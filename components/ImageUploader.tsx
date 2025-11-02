"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { validateImageFile } from "@/lib/image-utils";

interface ImageUploaderProps {
  onImageUpload: (imageData: string) => void;
  onError?: (error: string) => void;
}

export default function ImageUploader({ onImageUpload, onError }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);
      
      if (rejectedFiles.length > 0) {
        const errorMsg = "Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, WebP).";
        setError(errorMsg);
        onError?.(errorMsg);
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error || "Error al validar el archivo");
          onError?.(validation.error || "Error al validar el archivo");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") {
            onImageUpload(result);
          }
        };
        reader.onerror = () => {
          const errorMsg = "Error al leer el archivo";
          setError(errorMsg);
          onError?.(errorMsg);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300
          ${
            isDragActive || isDragging
              ? "border-gold bg-gold/10 shadow-lg shadow-gold/20"
              : error
              ? "border-red-500/50 bg-red-900/20"
              : "border-dark-border bg-dark-card hover:border-gold hover:bg-gold/5"
          }
        `}
        onMouseEnter={() => setIsDragging(true)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            {/* Efecto de glow detrás del ícono */}
            <div className="absolute inset-0 bg-gold/20 rounded-full blur-2xl"></div>
            <svg
              className="w-20 h-20 text-gold relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <p className="font-serif text-2xl font-bold text-gold mb-3 tracking-wide">
            {isDragActive
              ? "SUELTA LA IMAGEN AQUÍ"
              : "ARRASTRA Y SUELTA TU IMAGEN"}
          </p>
          <div className="w-16 h-px bg-gradient-gold my-4"></div>
          <p className="text-sm text-text-muted mb-6 font-sans">o haz click para seleccionar</p>
          <button 
            type="button"
            className="px-8 py-3 bg-gradient-gold text-background font-sans font-bold tracking-wide hover:opacity-90 transition-all duration-300 transform hover:scale-105"
          >
            SELECCIONAR ARCHIVO
          </button>
          <p className="text-xs text-text-muted mt-6 font-sans">
            Formatos soportados: JPG, PNG, WebP · Máximo 10MB
          </p>
        </div>
      </div>
      {error && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 backdrop-blur-sm">
          <p className="text-sm text-red-400 font-sans">{error}</p>
        </div>
      )}
    </div>
  );
}

