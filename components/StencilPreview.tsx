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
    <div className="bg-dark-card border border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-3xl font-bold text-gold tracking-wide">VISTA PREVIA</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div>
          <h3 className="font-sans text-lg font-semibold mb-3 text-gold-dark tracking-wide">
            IMAGEN ORIGINAL
          </h3>
          <div className="border-2 border-dark-border overflow-auto bg-background max-h-[600px]">
            <canvas
              ref={originalCanvasRef}
              className="w-auto h-auto"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        </div>

        {/* Stencil Preview */}
        <div>
          <h3 className="font-sans text-lg font-semibold mb-3 text-gold-dark tracking-wide">
            ESTÉNCIL PROCESADO (IA)
          </h3>
          <div className="border-2 border-dark-border overflow-auto bg-background relative max-h-[600px]">
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-10">
                <div className="text-center p-4 max-w-md">
                  <div className="text-red-400 text-4xl mb-3">⚠️</div>
                  <p className="text-red-400 font-semibold mb-2 font-sans">Error de Procesamiento</p>
                  <p className="text-sm text-text-muted mb-4 font-sans">{error}</p>
                  <p className="text-xs text-text-muted font-sans">
                    Si el error persiste, intenta con una imagen más pequeña o en otro formato.
                  </p>
                </div>
              </div>
            )}
            {/* Botón para generar esténcil */}
            {!isProcessing && !stencilImage && canGenerate && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-dark backdrop-blur-sm z-10">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">🎨</div>
                  <h3 className="font-serif text-2xl font-bold text-gold mb-2 tracking-wide">
                    ¡IMAGEN LISTA!
                  </h3>
                  <p className="text-text-muted mb-6 max-w-sm font-sans">
                    Selecciona un estilo en el panel de configuración y presiona el botón para generar tu esténcil con IA
                  </p>
                  <button
                    onClick={handleGenerateStencil}
                    disabled={!canGenerate}
                    className="px-8 py-4 bg-gradient-gold text-background font-sans font-bold tracking-wide shadow-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <span className="flex items-center gap-2">
                      <span>🌸</span>
                      <span>GENERAR ESTÉNCIL CON IA</span>
                    </span>
                  </button>
                  <p className="text-xs text-text-muted mt-4 font-sans">
                    Estilo seleccionado: <strong className="text-gold">{selectedStyle}</strong>
                  </p>
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-10">
                <div className="text-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-dark-border border-t-gold mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">
                      🤖
                    </div>
                  </div>
                  <p className="text-gold font-semibold text-lg mb-1 font-sans tracking-wide">
                    GENERANDO CON IA...
                  </p>
                  <p className="text-text-muted text-sm font-sans">
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
            className="px-6 py-3 bg-gradient-gold text-background font-sans font-semibold tracking-wide hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            🔄 GENERAR CON OTRO ESTILO
          </button>
        </div>
      )}
    </div>
  );
}
