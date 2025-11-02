"use client";

import { useEffect, useState } from "react";
import { geminiKeyManager, ProviderStats } from "./gemini-multi-key";

/**
 * Hook de React para monitorear estadísticas de Gemini (cliente)
 */
export function useGeminiStats() {
  const [stats, setStats] = useState<ProviderStats | null>(null);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") {
      return;
    }

    const updateStats = () => {
      setStats(geminiKeyManager.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update cada 5s

    return () => clearInterval(interval);
  }, []);

  return stats;
}
