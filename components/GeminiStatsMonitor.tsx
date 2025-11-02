/**
 * Componente de Monitoreo de Gemini Multi-Key
 * 
 * Muestra estadísticas en tiempo real del uso de múltiples API keys de Gemini
 */

"use client";

import { useGeminiStats } from "@/lib/gemini-stats-hook";
import type { ProviderStats } from "@/lib/gemini-multi-key";
import { useState } from "react";

export function GeminiStatsMonitor() {
  const stats = useGeminiStats();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!stats || stats.totalKeys === 0) {
    return null;
  }

  const utilizationPercent = Math.round(
    (stats.totalRequestsToday / (stats.totalKeys * 25)) * 100
  );

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white rounded-lg shadow-2xl border border-white/10 text-xs font-mono z-50">
      {/* Header - Always visible */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span className="text-blue-400">🔑</span> Gemini Multi-Key
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/60 hover:text-white transition-colors"
          >
            {isExpanded ? "▼" : "▲"}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-white/60">Keys Activas</div>
            <div className="text-lg font-bold text-green-400">
              {stats.activeKeys}/{stats.totalKeys}
            </div>
          </div>
          <div>
            <div className="text-white/60">Requests Hoy</div>
            <div className="text-lg font-bold text-blue-400">
              {stats.totalRequestsToday}
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div>
          <div className="text-white/60 mb-1">Uso Diario</div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                utilizationPercent > 80
                  ? "bg-red-500"
                  : utilizationPercent > 50
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            />
          </div>
          <div className="text-white/40 text-[10px] mt-1">
            {utilizationPercent}% ({stats.totalRequestsToday}/{stats.totalKeys * 25})
          </div>
        </div>

        {/* Available Capacity */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
          <div>
            <div className="text-white/60">Disponible/Min</div>
            <div className="font-bold text-green-400">
              {stats.availableCapacityMinute} RPM
            </div>
          </div>
          <div>
            <div className="text-white/60">Disponible/Día</div>
            <div className="font-bold text-green-400">
              {stats.availableCapacityDay} RPD
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-white/10 p-3 max-h-64 overflow-auto">
          <div className="text-white/60 mb-2 font-bold">
            Detalles por Key:
          </div>
          <div className="space-y-2">
            {stats.stats.map((keyStat, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  keyStat.disabled
                    ? "bg-red-500/20 border border-red-500/30"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">
                    Key {index + 1}
                    <span className="text-white/40 ml-1">
                      ({keyStat.key.slice(0, 8)}...)
                    </span>
                  </span>
                  {keyStat.disabled && (
                    <span className="text-red-400 text-[10px]">
                      ⚠️ DISABLED
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <div className="text-white/40">Hoy</div>
                    <div className={keyStat.requestsToday >= 25 ? "text-red-400" : "text-green-400"}>
                      {keyStat.requestsToday}/25
                    </div>
                  </div>
                  <div>
                    <div className="text-white/40">Minuto</div>
                    <div className={keyStat.requestsThisMinute >= 5 ? "text-red-400" : "text-green-400"}>
                      {keyStat.requestsThisMinute}/5
                    </div>
                  </div>
                  <div>
                    <div className="text-white/40">Fallos</div>
                    <div className={keyStat.failures > 0 ? "text-yellow-400" : "text-white/60"}>
                      {keyStat.failures}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="px-3 py-2 border-t border-white/10 text-[10px] text-white/40">
        Auto-refresh cada 5s • Click para {isExpanded ? "contraer" : "expandir"}
      </div>
    </div>
  );
}
