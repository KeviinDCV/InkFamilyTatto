# Sistema de Rotación de APIs para Procesamiento de Imágenes

Este sistema implementa rotación automática entre 3 proveedores de IA gratuitos para convertir imágenes a line art profesional.

## 🎯 Proveedores Implementados

### 1. Hugging Face Spaces (Primera Opción)
- **Límite:** ~200 requests/día
- **Costo:** Completamente GRATIS
- **Calidad:** ⭐⭐⭐⭐
- **Velocidad:** 3-5 segundos
- **Configuración:** Opcional (funciona sin API key, pero con límites más bajos)

### 2. Replicate (Segunda Opción)
- **Límite:** ~2,500 imágenes con créditos gratuitos ($25)
- **Costo:** $25 de créditos gratis al registrarte
- **Calidad:** ⭐⭐⭐⭐⭐
- **Velocidad:** 2-4 segundos
- **Configuración:** Requiere API key

### 3. Google Gemini (Tercera Opción - Backup)
- **Límite:** 500 requests/día
- **Costo:** Completamente GRATIS
- **Nota:** No genera imágenes directamente, se usa como análisis de respaldo
- **Configuración:** Requiere API key

## 📦 Instalación

```bash
npm install @gradio/client @google/generative-ai replicate
```

## 🔑 Configuración de API Keys

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Hugging Face (OPCIONAL - funciona sin esto)
NEXT_PUBLIC_HUGGINGFACE_API_TOKEN=tu_token_aqui

# Replicate (REQUERIDO)
NEXT_PUBLIC_REPLICATE_API_TOKEN=tu_token_aqui

# Google Gemini (OPCIONAL - solo como backup)
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=tu_api_key_aqui
```

2. Obtén tus API keys:

### Hugging Face (Opcional)
1. Ve a https://huggingface.co/settings/tokens
2. Crea un nuevo token
3. Copia y pega en `.env.local`

### Replicate (Recomendado - $25 gratis)
1. Regístrate en https://replicate.com
2. Ve a https://replicate.com/account/api-tokens
3. Crea un token y obtienes $25 en créditos gratis
4. Copia y pega en `.env.local`

### Google Gemini (Opcional - Backup)
1. Ve a https://aistudio.google.com/app/apikey
2. Crea una API key
3. Copia y pega en `.env.local`

## 🚀 Uso

### Uso Básico (Rotación Automática)

```typescript
import { processImageToLineArt } from "@/lib/api-providers";

// El sistema automáticamente elige el mejor proveedor disponible
const result = await processImageToLineArt({
  imageDataUrl: "data:image/png;base64,...",
  provider: "auto", // Rotación automática
  style: "lineart",  // o "lineart_anime", "pidinet", "canny"
});

console.log("Imagen procesada:", result.processedImageUrl);
console.log("Proveedor usado:", result.provider);
console.log("Tiempo:", result.processingTime, "ms");
```

### Uso con Proveedor Específico

```typescript
// Forzar uso de Hugging Face
const result = await processImageToLineArt({
  imageDataUrl: "data:image/png;base64,...",
  provider: "huggingface",
  style: "lineart_anime",
});

// Forzar uso de Replicate
const result = await processImageToLineArt({
  imageDataUrl: "data:image/png;base64,...",
  provider: "replicate",
  style: "pidinet",
});
```

### Estilos Disponibles

- `lineart` - Line art estándar (mejor para fotos)
- `lineart_anime` - Line art estilo anime (más estilizado)
- `pidinet` - Detección de bordes con red neuronal (muy limpio)
- `canny` - Detección de bordes Canny mejorada con IA

### Ver Estadísticas de Uso

```typescript
import { getProviderStats } from "@/lib/api-providers";

const stats = getProviderStats();

console.log("Hugging Face:", stats.huggingface.requestsToday, "/", stats.huggingface.dailyLimit);
console.log("Replicate:", stats.replicate.requestsToday, "/", stats.replicate.dailyLimit);
console.log("Gemini:", stats.gemini.requestsToday, "/", stats.gemini.dailyLimit);
```

## 🔄 Cómo Funciona la Rotación

1. **Modo Auto (Recomendado):**
   - Intenta primero con **Hugging Face** (gratis ilimitado casi)
   - Si falla o está saturado, pasa a **Replicate** ($25 gratis)
   - Si ambos fallan, usa **Gemini** como análisis de respaldo
   - Trackea automáticamente cuántas requests se han hecho

2. **Límites Diarios:**
   - El sistema guarda en `localStorage` cuántas requests has hecho hoy
   - Se resetea automáticamente cada 24 horas
   - Si un provider alcanza su límite, pasa automáticamente al siguiente

3. **Manejo de Errores:**
   - Si un provider falla, automáticamente intenta con el siguiente
   - Muestra mensajes claros cuando todos los providers están agotados

## 💡 Recomendaciones

1. **Para desarrollo:** Usa modo `auto` sin configurar nada (Hugging Face funciona sin API key)

2. **Para producción:**
   - Configura **Replicate** (mejor calidad, $25 gratis = ~2,500 imágenes)
   - Mantén **Hugging Face** como backup primario
   - Configura **Gemini** solo si necesitas análisis adicional

3. **Ahorro de créditos:**
   - Usa Hugging Face primero (gratis ilimitado)
   - Reserva Replicate para usuarios importantes
   - Implementa caché para imágenes ya procesadas

## 📊 Comparativa de Costos

| Proveedor | Costo Inicial | Imágenes Gratis | Costo por Imagen |
|-----------|---------------|-----------------|------------------|
| Hugging Face | $0 | ~200/día (ilimitado en teoría) | $0 |
| Replicate | $0 ($25 créditos) | ~2,500 | ~$0.01 después |
| Gemini | $0 | 500/día | $0 |

**Total Gratis por Día:** ~700+ imágenes sin pagar nada

## 🛠️ Troubleshooting

### Error: "All AI providers have reached their daily limits"
- Espera 24 horas para que se reseteen los límites
- O configura más API keys
- O implementa caché local

### Error: "Replicate API token not configured"
- Asegúrate de tener `NEXT_PUBLIC_REPLICATE_API_TOKEN` en `.env.local`
- Reinicia el servidor de desarrollo

### Imágenes procesadas de mala calidad
- Prueba diferentes estilos: `lineart`, `lineart_anime`, `pidinet`
- Usa `replicate` provider para mejor calidad
- Asegúrate de que la imagen de entrada sea de buena calidad

## 📝 Licencia

Este código es parte de InkFamily y está diseñado para uso gratuito con las APIs mencionadas.
