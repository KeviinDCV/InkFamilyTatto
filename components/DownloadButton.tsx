"use client";

import { useState } from "react";

interface DownloadButtonProps {
  stencilImage: string;
  lineColor: string;
}

export default function DownloadButton({
  stencilImage,
  lineColor,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create a canvas from the stencil image
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          // Clear canvas with transparent background
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw the stencil image
          ctx.drawImage(img, 0, 0);
          
          // Convert to blob and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `ink-family-stencil-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
            setIsDownloading(false);
          }, "image/png");
        } else {
          setIsDownloading(false);
        }
      };
      
      img.onerror = () => {
        setIsDownloading(false);
      };
      
      img.src = stencilImage;
    } catch (error) {
      console.error("Error downloading stencil:", error);
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`
        w-full px-6 py-3 rounded-lg font-semibold text-white transition-all
        ${
          isDownloading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-warm hover:opacity-90 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        }
      `}
    >
      {isDownloading ? "Descargando..." : "Descargar Esténcil"}
    </button>
  );
}

