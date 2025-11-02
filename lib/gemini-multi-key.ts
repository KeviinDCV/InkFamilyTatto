/**
 * Gemini Multi-Key Manager
 * 
 * Rota automáticamente entre múltiples API keys de Gemini para
 * multiplicar el cupo gratuito (5 RPM, 25 RPD por key).
 * 
 * Con 10 keys: 50 RPM, 250 RPD
 * Con 20 keys: 100 RPM, 500 RPD
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

interface KeyStats {
  key: string;
  requestsThisMinute: number;
  requestsToday: number;
  lastRequest: number;
  failures: number;
  disabled: boolean;
}

interface ProviderStats {
  totalKeys: number;
  activeKeys: number;
  totalRequestsToday: number;
  availableCapacityMinute: number;
  availableCapacityDay: number;
  stats: KeyStats[];
}

class GeminiMultiKeyManager {
  private keys: string[];
  private stats: Map<string, KeyStats>;
  private currentIndex = 0;
  private readonly RPM_LIMIT = 5; // Requests Per Minute (Free Tier)
  private readonly RPD_LIMIT = 25; // Requests Per Day (Free Tier)
  private readonly STORAGE_KEY = "gemini-multi-key-stats";

  constructor() {
    // Cargar keys desde environment variable
    const keysString = process.env.NEXT_PUBLIC_GEMINI_API_KEYS || "";
    this.keys = keysString
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (this.keys.length === 0) {
      console.warn("⚠️ No Gemini API keys configured. Set NEXT_PUBLIC_GEMINI_API_KEYS");
    }

    // Inicializar stats desde localStorage
    this.stats = this.loadStats();
  }

  private loadStats(): Map<string, KeyStats> {
    // Solo en el cliente (navegador)
    if (typeof window === "undefined") {
      return this.initializeStats();
    }

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        const statsMap = new Map<string, KeyStats>();

        // Reconstruir Map desde el objeto guardado
        for (const [key, stat] of Object.entries(data)) {
          statsMap.set(key, stat as KeyStats);
        }

        // Verificar que todas las keys actuales estén en stats
        for (const key of this.keys) {
          if (!statsMap.has(key)) {
            statsMap.set(key, this.createEmptyStats(key));
          }
        }

        return statsMap;
      }
    } catch (error) {
      console.warn("⚠️ Error loading Gemini stats:", error);
    }

    return this.initializeStats();
  }

  private initializeStats(): Map<string, KeyStats> {
    const stats = new Map<string, KeyStats>();
    for (const key of this.keys) {
      stats.set(key, this.createEmptyStats(key));
    }
    return stats;
  }

  private createEmptyStats(key: string): KeyStats {
    return {
      key,
      requestsThisMinute: 0,
      requestsToday: 0,
      lastRequest: 0,
      failures: 0,
      disabled: false,
    };
  }

  private saveStats(): void {
    if (typeof window === "undefined") return;

    try {
      const data = Object.fromEntries(this.stats);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("⚠️ Error saving Gemini stats:", error);
    }
  }

  private resetIfNeeded(stat: KeyStats): void {
    const now = Date.now();
    const lastRequest = stat.lastRequest;

    // Reset por minuto (60 segundos)
    if (now - lastRequest > 60000) {
      stat.requestsThisMinute = 0;
    }

    // Reset diario (a medianoche)
    const lastDate = new Date(lastRequest);
    const nowDate = new Date(now);
    if (
      lastDate.getDate() !== nowDate.getDate() ||
      lastDate.getMonth() !== nowDate.getMonth() ||
      lastDate.getFullYear() !== nowDate.getFullYear()
    ) {
      stat.requestsToday = 0;
      stat.failures = 0; // Reset failures también
      stat.disabled = false; // Re-habilitar keys al nuevo día
    }
  }

  private isAvailable(stat: KeyStats): boolean {
    if (stat.disabled) return false;

    this.resetIfNeeded(stat);

    return (
      stat.requestsThisMinute < this.RPM_LIMIT &&
      stat.requestsToday < this.RPD_LIMIT
    );
  }

  /**
   * Obtiene la siguiente API key disponible usando rotación round-robin
   */
  getNextAvailableKey(): string | null {
    if (this.keys.length === 0) {
      console.error("❌ No Gemini API keys configured");
      return null;
    }

    const totalKeys = this.keys.length;
    let attempts = 0;

    // Intentar encontrar una key disponible (máximo 2 vueltas completas)
    while (attempts < totalKeys * 2) {
      const key = this.keys[this.currentIndex];
      const stat = this.stats.get(key);

      if (stat && this.isAvailable(stat)) {
        return key;
      }

      // Siguiente key (round-robin)
      this.currentIndex = (this.currentIndex + 1) % totalKeys;
      attempts++;
    }

    // No hay keys disponibles
    console.warn(
      "⚠️ All Gemini API keys have reached their limits. Wait 1 minute or add more keys."
    );
    return null;
  }

  /**
   * Registra el resultado de una request (éxito o fallo)
   */
  trackRequest(key: string, success: boolean): void {
    const stat = this.stats.get(key);
    if (!stat) return;

    this.resetIfNeeded(stat);

    stat.requestsThisMinute++;
    stat.requestsToday++;
    stat.lastRequest = Date.now();

    if (!success) {
      stat.failures++;
      // Deshabilitar key si falla 3 veces consecutivas
      if (stat.failures >= 3) {
        stat.disabled = true;
        console.warn(
          `🚫 Gemini API Key deshabilitada por múltiples fallos: ${key.slice(0, 10)}...`
        );
      }
    } else {
      stat.failures = 0; // Reset failures en éxito
    }

    // Mover al siguiente key para próxima request (load balancing)
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;

    this.saveStats();
  }

  /**
   * Obtiene estadísticas del manager
   */
  getStats(): ProviderStats {
    const allStats = Array.from(this.stats.values());

    return {
      totalKeys: this.keys.length,
      activeKeys: allStats.filter((s) => !s.disabled).length,
      totalRequestsToday: allStats.reduce((sum, s) => sum + s.requestsToday, 0),
      availableCapacityMinute: allStats.filter((s) => this.isAvailable(s))
        .length * this.RPM_LIMIT,
      availableCapacityDay:
        allStats.filter((s) => this.isAvailable(s)).length * this.RPD_LIMIT,
      stats: allStats,
    };
  }

  /**
   * Re-habilita una key deshabilitada manualmente
   */
  resetKey(key: string): void {
    const stat = this.stats.get(key);
    if (stat) {
      stat.disabled = false;
      stat.failures = 0;
      this.saveStats();
      console.log(`✅ Gemini API Key re-habilitada: ${key.slice(0, 10)}...`);
    }
  }

  /**
   * Re-habilita todas las keys deshabilitadas
   */
  resetAllKeys(): void {
    for (const stat of this.stats.values()) {
      stat.disabled = false;
      stat.failures = 0;
    }
    this.saveStats();
    console.log("✅ Todas las Gemini API Keys re-habilitadas");
  }
}

// Singleton instance
export const geminiKeyManager = new GeminiMultiKeyManager();

/**
 * Hace una request a Gemini usando rotación automática de keys
 * Reintenta automáticamente con diferentes keys si falla
 */
export async function callGeminiWithRotation(
  prompt: string,
  imageDataUrl?: string,
  model: string = "gemini-2.0-flash-exp"
): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    const apiKey = geminiKeyManager.getNextAvailableKey();

    if (!apiKey) {
      throw new Error(
        "❌ Todas las API keys de Gemini han alcanzado su límite. " +
          "Opciones: (1) Espera 1 minuto, (2) Añade más keys, o (3) Usa otro provider."
      );
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model });

      // Preparar contenido
      const parts: any[] = [prompt];
      if (imageDataUrl) {
        const base64Data = imageDataUrl.includes(",")
          ? imageDataUrl.split(",")[1]
          : imageDataUrl;
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg",
          },
        });
      }

      // Hacer request
      const result = await geminiModel.generateContent(parts);
      const response = result.response.text();

      // ✅ Éxito
      geminiKeyManager.trackRequest(apiKey, true);
      console.log(
        `✅ Gemini request exitoso con key: ${apiKey.slice(0, 10)}... (intento ${i + 1}/${maxRetries})`
      );

      return response;
    } catch (error: any) {
      // ❌ Error
      geminiKeyManager.trackRequest(apiKey, false);
      lastError = error;
      console.warn(
        `⚠️ Error con Gemini key ${apiKey.slice(0, 10)}... (intento ${i + 1}/${maxRetries}):`,
        error.message
      );

      // Si es un error de rate limit, intentar con otra key inmediatamente
      if (error.message?.includes("429") || error.message?.includes("quota")) {
        continue;
      }

      // Si es otro tipo de error, esperar un poco antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw (
    lastError || new Error("Failed to call Gemini after max retries")
  );
}

/**
 * Genera un prompt optimizado para convertir imagen a line art
 */
export async function analyzeImageForLineArt(
  imageDataUrl: string
): Promise<string> {
  const prompt = `Analiza esta imagen y genera un prompt detallado para convertirla a line art estilo tattoo stencil.
El prompt debe incluir:
- Descripción de los elementos principales
- Estilo de líneas (gruesas/finas, detalladas/minimalistas)
- Nivel de contraste y sombreado
- Técnica de dibujo recomendada

Responde SOLO con el prompt, sin explicaciones adicionales.`;

  return await callGeminiWithRotation(prompt, imageDataUrl);
}

// Exportar tipos para TypeScript
export type { KeyStats, ProviderStats };
