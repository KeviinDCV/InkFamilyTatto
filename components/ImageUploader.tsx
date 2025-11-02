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
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${
            isDragActive || isDragging
              ? "border-accent-cool-purple bg-accent-cool-purple/10"
              : error
              ? "border-red-400 bg-red-50"
              : "border-gray-300 hover:border-accent-cool-purple hover:bg-gray-50"
          }
        `}
        onMouseEnter={() => setIsDragging(true)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-semibold text-gray-700 mb-2">
            {isDragActive
              ? "Suelta la imagen aquí"
              : "Arrastra y suelta tu imagen aquí"}
          </p>
          <p className="text-sm text-gray-500 mb-4">o</p>
          <button 
            type="button"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
          >
            Seleccionar archivo
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Formatos soportados: JPG, PNG, WebP (máx. 10MB)
          </p>
        </div>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

