"use client";

import { useEffect, useRef, useState } from "react";

interface StencilPreviewProps {
  originalImage: string;
  stencilImage: string | null;
  isProcessing: boolean;
  lineColor: string;
  pngOutline: boolean;
  threshold: number;
  selectedStyle: string;
  onProcessingStart: () => void;
  onStencilGenerated: (stencilData: string) => void;
}

export default function StencilPreview({
  originalImage,
  stencilImage,
  isProcessing,
  lineColor,
  pngOutline,
  threshold,
  selectedStyle,
  onProcessingStart,
  onStencilGenerated,
}: StencilPreviewProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const stencilCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [canGenerate, setCanGenerate] = useState<boolean>(false);

  // Draw original image
  useEffect(() => {
    if (!originalImage) return;
    
    // Habilitar botón de generación cuando hay imagen
    setCanGenerate(true);
    // Limpiar esténcil anterior cuando cambia la imagen
    onStencilGenerated("");

    const img = new Image();
    img.onload = () => {
      const canvas = originalCanvasRef.current;
      if (canvas) {
        // Usar tamaño REAL de la imagen (no reducir)
        const { width, height } = img;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Desactivar suavizado para imágenes nítidas
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, width, height);
        }
      }
    };
    img.onerror = () => {
      console.error("Error loading original image");
      setError("Error al cargar la imagen original");
    };
    img.src = originalImage;
  }, [originalImage, onStencilGenerated]);

  // Handler para generar esténcil manualmente
  const handleGenerateStencil = async () => {
    if (!originalImage || !selectedStyle) return;

    onProcessingStart();
    setError(null);

    try {
      console.log(`[StencilPreview] Generando esténcil con IA: Estilo=${selectedStyle}`);

      // PROCESAR CON POLLINATIONS KONTEXT IA (MÁXIMA CALIDAD)
      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageDataUrl: originalImage,
          styleId: selectedStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Error al procesar la imagen");
      }

      const result = await response.json();

      console.log(`[StencilPreview] Esténcil creado en ${result.processingTime}ms`);

      onStencilGenerated(result.processedImageUrl);
    } catch (error) {
      console.error("[StencilPreview] Error processing image:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al procesar la imagen con IA";
      setError(errorMessage);
      onStencilGenerated("");
    }
  };

  // Draw stencil image
  useEffect(() => {
    if (stencilImage && stencilCanvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = stencilCanvasRef.current;
        if (canvas) {
          // Usar tamaño REAL de la imagen (2048x2048 de Pollinations)
          const { width, height } = img;

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Desactivar suavizado para máxima nitidez
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);
          }
        }
      };
      img.onerror = () => {
        console.error("Error loading stencil image");
        setError("Error al cargar la imagen procesada");
      };
      img.src = stencilImage;
    }
  }, [stencilImage]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-primary">Vista Previa</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Imagen Original
          </h3>
          <div className="border-2 border-gray-200 rounded-lg overflow-auto bg-gray-50 max-h-[600px]">
            <canvas
              ref={originalCanvasRef}
              className="w-auto h-auto"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        </div>

        {/* Stencil Preview */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Esténcil Procesado (IA)
          </h3>
          <div className="border-2 border-gray-200 rounded-lg overflow-auto bg-gray-50 relative max-h-[600px]">
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                <div className="text-center p-4 max-w-md">
                  <div className="text-red-500 text-4xl mb-3">⚠️</div>
                  <p className="text-red-600 font-semibold mb-2">Error de Procesamiento</p>
                  <p className="text-sm text-gray-600 mb-4">{error}</p>
                  <p className="text-xs text-gray-500">
                    Si el error persiste, intenta con una imagen más pequeña o en otro formato.
                  </p>
                </div>
              </div>
            )}
            {/* Botón para generar esténcil */}
            {!isProcessing && !stencilImage && canGenerate && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 z-10">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    ¡Imagen lista!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-sm">
                    Selecciona un estilo en el panel de la izquierda y presiona el botón para generar tu esténcil con IA
                  </p>
                  <button
                    onClick={handleGenerateStencil}
                    disabled={!canGenerate}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="flex items-center gap-2">
                      <span>🌸</span>
                      <span>Generar Esténcil con IA</span>
                    </span>
                  </button>
                  <p className="text-xs text-gray-500 mt-4">
                    Estilo seleccionado: <strong>{selectedStyle}</strong>
                  </p>
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-10">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      🤖
                    </div>
                  </div>
                  <p className="text-gray-700 font-semibold text-lg mb-1">
                    Generando con IA...
                  </p>
                  <p className="text-gray-500 text-sm">
                    Calidad Ultra Alta (2048x2048) • ~15-30 segundos
                  </p>
                </div>
              </div>
            )}
            <canvas
              ref={stencilCanvasRef}
              className="w-auto h-auto"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        </div>
      </div>

      {/* Regenerar Button */}
      {!isProcessing && !error && stencilImage && (
        <div className="mt-6 text-center">
          <button
            onClick={handleGenerateStencil}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            🔄 Generar con Otro Estilo
          </button>
        </div>
      )}
    </div>
  );
}
