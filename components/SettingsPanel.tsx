"use client";

import DownloadButton from "./DownloadButton";

interface SettingsPanelProps {
  lineColor: string;
  onLineColorChange: (color: string) => void;
  threshold: number;
  onThresholdChange: (threshold: number) => void;
  pngOutline: boolean;
  onPngOutlineChange: (outline: boolean) => void;
  stencilImage: string | null;
}

export default function SettingsPanel({
  lineColor,
  onLineColorChange,
  threshold,
  onThresholdChange,
  pngOutline,
  onPngOutlineChange,
  stencilImage,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* PNG Outline Toggle */}
      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={pngOutline}
            onChange={(e) => onPngOutlineChange(e.target.checked)}
            className="w-5 h-5 text-gold border-dark-border rounded focus:ring-gold accent-gold"
          />
          <span className="text-sm font-medium text-text-primary font-sans">
            PNG Outline (Sin fondo)
          </span>
        </label>
        <p className="text-xs text-text-muted mt-1 ml-8 font-sans">
          Solo líneas para fácil transferencia
        </p>
      </div>

      {/* Line Color Selector */}
      <div>
        <label className="block text-sm font-medium text-gold-dark mb-2 font-sans tracking-wide">
          COLOR DE LÍNEA
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={lineColor}
            onChange={(e) => onLineColorChange(e.target.value)}
            className="w-16 h-10 border border-dark-border cursor-pointer bg-background"
          />
          <input
            type="text"
            value={lineColor}
            onChange={(e) => onLineColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-dark-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold font-sans"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Threshold Slider */}
      <div>
        <label className="block text-sm font-medium text-gold-dark mb-2 font-sans tracking-wide">
          CANTIDAD DE DETALLE: {threshold}
        </label>
        <input
          type="range"
          min="20"
          max="180"
          step="20"
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer accent-gold"
        />
        <div className="flex justify-between text-xs text-text-muted mt-1 font-sans">
          <span>✨ SIMPLE (pocas líneas)</span>
          <span>🔍 DETALLADO (muchas líneas)</span>
        </div>
        <p className="text-xs text-gold-dark mt-2 font-semibold font-sans">
          ⬅️ IZQUIERDA = Minimalista | DERECHA = Máximo detalle ➡️
        </p>
      </div>

      {/* Download Button */}
      {stencilImage && (
        <DownloadButton stencilImage={stencilImage} lineColor={lineColor} />
      )}
    </div>
  );
}

