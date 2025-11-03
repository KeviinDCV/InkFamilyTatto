"use client";

import { useEffect, useRef, useState } from "react";
import DownloadButton from "./DownloadButton";

type ViewMode = 'slider';

interface StencilPreviewProps {
  originalImage: string;
  stencilImage: string | null;
  isProcessing: boolean;
  selectedStyle: string;
  onProcessingStart: () => void;
  onStencilGenerated: (stencilData: string) => void;
}

export default function StencilPreview({
  originalImage,
  stencilImage,
  isProcessing,
  selectedStyle,
  onProcessingStart,
  onStencilGenerated,
}: StencilPreviewProps) {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const stencilCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>("");
  const [canGenerate, setCanGenerate] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [originalOpacity, setOriginalOpacity] = useState<number>(100);
  const [sliderPosition, setSliderPosition] = useState<number>(50);

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
        const { width, height } = img;
        
        // Calcular tamaño que quepa en el contenedor según el tamaño de la pantalla
        const isMobile = window.innerWidth < 640; // sm breakpoint
        const isTablet = window.innerWidth < 768; // md breakpoint
        
        const maxHeight = isMobile ? 280 : isTablet ? 380 : 580;
        const maxWidth = isMobile ? 350 : isTablet ? 500 : 800;
        
        let displayWidth = width;
        let displayHeight = height;
        
        // Si la imagen es más grande que el contenedor, escalarla
        if (height > maxHeight || width > maxWidth) {
          const aspectRatio = width / height;
          
          if (height > maxHeight) {
            displayHeight = maxHeight;
            displayWidth = maxHeight * aspectRatio;
          }
          
          if (displayWidth > maxWidth) {
            displayWidth = maxWidth;
            displayHeight = maxWidth / aspectRatio;
          }
        }

        canvas.width = displayWidth;
        canvas.height = displayHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
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
    setError("");

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

  // Draw overlay canvas (original image) for slider comparison
  useEffect(() => {
    if (!stencilImage || !originalImage || !overlayCanvasRef.current || !stencilCanvasRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const stencilCanvas = stencilCanvasRef.current;
    
    const img = new Image();
    img.onload = () => {
      // Sincronizar dimensiones exactas con el canvas del stencil
      overlayCanvas.width = stencilCanvas.width;
      overlayCanvas.height = stencilCanvas.height;
      
      const ctx = overlayCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        ctx.globalAlpha = originalOpacity / 100;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, overlayCanvas.width, overlayCanvas.height);
      }
    };
    img.src = originalImage;
  }, [stencilImage, originalImage, originalOpacity, stencilCanvasRef.current?.width, stencilCanvasRef.current?.height]);

  // Draw stencil image
  useEffect(() => {
    if (stencilImage && stencilCanvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = stencilCanvasRef.current;
        if (canvas) {
          const { width, height } = img;
          
          // Calcular tamaño que quepa en el contenedor según el tamaño de la pantalla
          const isMobile = window.innerWidth < 640; // sm breakpoint
          const isTablet = window.innerWidth < 768; // md breakpoint
          
          const maxHeight = isMobile ? 280 : isTablet ? 380 : 580;
          const maxWidth = isMobile ? 350 : isTablet ? 500 : 800;
          
          let displayWidth = width;
          let displayHeight = height;
          
          // Si la imagen es más grande que el contenedor, escalarla
          if (height > maxHeight || width > maxWidth) {
            const aspectRatio = width / height;
            
            if (height > maxHeight) {
              displayHeight = maxHeight;
              displayWidth = maxHeight * aspectRatio;
            }
            
            if (displayWidth > maxWidth) {
              displayWidth = maxWidth;
              displayHeight = maxWidth / aspectRatio;
            }
          }

          canvas.width = displayWidth;
          canvas.height = displayHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
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
    <div className="bg-dark-card border border-dark-border p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gold tracking-wide">VISTA PREVIA</h2>
      </div>

      {/* Control de opacidad para el modo Slider */}
      {stencilImage && (
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-semibold text-gold-dark mb-2">
            Opacidad Original: {originalOpacity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={originalOpacity}
            onChange={(e) => setOriginalOpacity(Number(e.target.value))}
            className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer accent-gold"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Original Image */}
        <div>
          <h3 className="font-sans text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gold-dark tracking-wide">
            IMAGEN ORIGINAL
          </h3>
          <div className="border-2 border-dark-border overflow-hidden bg-zinc-900 flex items-center justify-center">
            <canvas
              ref={originalCanvasRef}
              className="w-full h-auto"
              style={{ imageRendering: 'crisp-edges', display: 'block' }}
            />
          </div>
        </div>

        {/* Stencil Preview */}
        <div>
          <h3 className="font-sans text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-gold-dark tracking-wide">
            ESTÉNCIL PROCESADO (IA)
          </h3>
          <div className="border-2 border-dark-border overflow-hidden bg-zinc-900 relative">
            {/* Modo Slider - Imagen original con clip-path dinámico */}
            {stencilImage && (
              <div 
                className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none" 
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <canvas
                  ref={overlayCanvasRef}
                  className="w-full h-auto"
                  style={{ imageRendering: 'crisp-edges', display: 'block' }}
                />
              </div>
            )}
            
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-10">
                <div className="text-center p-3 sm:p-4 max-w-md mx-4">
                  <p className="text-red-400 font-semibold mb-2 font-sans text-base sm:text-lg">ERROR DE PROCESAMIENTO</p>
                  <p className="text-xs sm:text-sm text-text-muted mb-3 sm:mb-4 font-sans">{error}</p>
                  <p className="text-xs text-text-muted font-sans">
                    Si el error persiste, intenta con una imagen más pequeña o en otro formato.
                  </p>
                </div>
              </div>
            )}
            {/* Botón para generar esténcil */}
            {!isProcessing && !stencilImage && canGenerate && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-dark backdrop-blur-sm z-10">
                <div className="text-center p-4 sm:p-8 mx-4">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-gold mb-2 tracking-wide">
                    IMAGEN LISTA
                  </h3>
                  <p className="text-text-muted mb-4 sm:mb-6 max-w-sm font-sans text-sm sm:text-base">
                    Selecciona un estilo en el panel de configuración y presiona el botón para generar tu esténcil con IA
                  </p>
                  <button
                    onClick={handleGenerateStencil}
                    disabled={!canGenerate}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-gold text-background font-sans font-bold tracking-wide shadow-lg hover:opacity-90 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                  >
                    GENERAR ESTÉNCIL CON IA
                  </button>
                  <p className="text-xs text-text-muted mt-3 sm:mt-4 font-sans">
                    Estilo seleccionado: <strong className="text-gold">{selectedStyle}</strong>
                  </p>
                </div>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-10">
                <div className="text-center px-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-dark-border border-t-gold mx-auto mb-3 sm:mb-4"></div>
                  </div>
                  <p className="text-gold font-semibold text-base sm:text-lg mb-1 font-sans tracking-wide">
                    GENERANDO CON IA...
                  </p>
                  <p className="text-text-muted text-xs sm:text-sm font-sans">
                    IA + Mejora de Nitidez Extrema (Líneas Vectoriales) • ~20-40s
                  </p>
                </div>
              </div>
            )}
            <canvas
              ref={stencilCanvasRef}
              className="w-full h-auto relative z-0"
              style={{ imageRendering: 'crisp-edges', display: 'block' }}
            />
            
            {/* Control deslizante para modo Slider */}
            {stencilImage && (
              <div 
                className="absolute inset-y-0 w-1 bg-gold cursor-ew-resize z-20 flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={(e) => {
                  const container = e.currentTarget.parentElement;
                  if (!container) return;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const rect = container.getBoundingClientRect();
                    const x = moveEvent.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                    setSliderPosition(percentage);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regenerar Button */}
      {!isProcessing && !error && stencilImage && (
        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={handleGenerateStencil}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-gold text-background font-sans font-semibold tracking-wide hover:opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base"
          >
            GENERAR CON OTRO ESTILO
          </button>
        </div>
      )}

      {/* Download Button - Colocado abajo para mejor accesibilidad */}
      {stencilImage && (
        <div className="mt-4 sm:mt-6">
          <DownloadButton stencilImage={stencilImage} />
        </div>
      )}
    </div>
  );
}
