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
            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">
            PNG Outline (Sin fondo)
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          Solo líneas para fácil transferencia
        </p>
      </div>

      {/* Line Color Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color de Línea
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={lineColor}
            onChange={(e) => onLineColorChange(e.target.value)}
            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
          />
          <input
            type="text"
            value={lineColor}
            onChange={(e) => onLineColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Threshold Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cantidad de Detalle: {threshold}
        </label>
        <input
          type="range"
          min="20"
          max="180"
          step="20"
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>✨ SIMPLE (pocas líneas)</span>
          <span>🔍 DETALLADO (muchas líneas)</span>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-semibold text-red-600">
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

