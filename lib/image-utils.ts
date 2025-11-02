/**
 * Utility functions for image manipulation
 */

export function resizeImage(
  imageDataUrl: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("No se pudo obtener el contexto del canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      reject(new Error("Error al cargar la imagen"));
    };

    img.src = imageDataUrl;
  });
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP.",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "El archivo es demasiado grande. El tamaño máximo es 10MB.",
    };
  }

  return { valid: true };
}

