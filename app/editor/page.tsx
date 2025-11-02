"use client";

import { useState, useCallback } from "react";
import ImageUploader from "@/components/ImageUploader";
import StencilPreview from "@/components/StencilPreview";
import StyleSelector from "@/components/StyleSelector";
import SettingsPanel from "@/components/SettingsPanel";
import Link from "next/link";
import Image from "next/image";

export default function EditorPage() {
  const [image, setImage] = useState<string | null>(null);
  const [stencilImage, setStencilImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("classic");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleImageUpload = useCallback((imageData: string) => {
    setImage(imageData);
    setStencilImage(null);
  }, []);

  const handleStencilGenerated = useCallback((stencilData: string) => {
    setStencilImage(stencilData);
    setIsProcessing(false);
  }, []);

  const handleProcessingStart = useCallback(() => {
    setIsProcessing(true);
  }, []);

  return (
    <main className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-dark-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="Ink Family" width={35} height={35} className="opacity-90" />
              <span className="font-serif text-2xl font-bold text-gold tracking-wider">INK FAMILY</span>
            </Link>
            <Link
              href="/"
              className="text-gold-dark hover:text-gold transition-colors font-sans text-sm tracking-wide flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              VOLVER AL INICIO
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 relative">
        {/* Efectos de fondo similares al landing page */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bronze rounded-full blur-3xl"></div>
        </div>

        {!image ? (
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 text-gold tracking-wide">
                GENERADOR DE ESTÉNCILES
              </h1>
              <div className="w-24 h-px bg-gradient-gold mx-auto mb-6"></div>
              <p className="text-lg text-text-muted font-sans">
                Sube tu imagen para comenzar a crear tu esténcil profesional de tatuaje
              </p>
            </div>
            <ImageUploader 
              onImageUpload={handleImageUpload}
              onError={(error) => {
                console.error("Upload error:", error);
                // Could show a toast notification here
              }}
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {/* Preview Section */}
            <div className="lg:col-span-2">
              <StencilPreview
                originalImage={image}
                stencilImage={stencilImage}
                isProcessing={isProcessing}
                selectedStyle={selectedStyle}
                onProcessingStart={handleProcessingStart}
                onStencilGenerated={handleStencilGenerated}
              />
            </div>

            {/* Controls Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-dark-card border border-dark-border p-6">
                <h2 className="font-serif text-3xl font-bold mb-6 text-gold tracking-wide">
                  CONFIGURACIÓN
                </h2>
                <div className="w-16 h-px bg-gradient-gold mb-6"></div>
              
                <StyleSelector
                  selectedStyle={selectedStyle}
                  onStyleChange={setSelectedStyle}
                />

                <SettingsPanel
                  stencilImage={stencilImage}
                />
              </div>

              <div className="bg-dark-card border border-dark-border p-6">
                <button
                  onClick={() => {
                    setImage(null);
                    setStencilImage(null);
                  }}
                  className="w-full px-4 py-3 bg-gradient-gold text-background hover:opacity-90 transition-all duration-300 transform hover:scale-105 font-sans font-bold tracking-wide"
                >
                  SUBIR NUEVA IMAGEN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

