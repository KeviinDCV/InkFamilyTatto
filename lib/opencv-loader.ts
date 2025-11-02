/**
 * Utility to load OpenCV.js dynamically
 */

declare global {
  interface Window {
    cv: any;
  }
}

let opencvLoading: Promise<void> | null = null;
let opencvReady = false;

export function loadOpenCV(): Promise<void> {
  if (opencvReady && typeof window !== "undefined" && window.cv) {
    return Promise.resolve();
  }

  if (opencvLoading) {
    return opencvLoading;
  }

  opencvLoading = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("OpenCV solo puede cargarse en el navegador"));
      return;
    }

    // Check if already loaded
    if (window.cv) {
      opencvReady = true;
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="opencv"]');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.cv) {
          clearInterval(checkInterval);
          opencvReady = true;
          resolve();
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.cv) {
          reject(new Error("Timeout al cargar OpenCV"));
        }
      }, 30000);
      return;
    }

    // Load OpenCV.js from CDN
    const script = document.createElement("script");
    script.src = "https://docs.opencv.org/5.x/opencv.js";
    script.async = true;
    script.type = "text/javascript";

    script.onload = () => {
      // Wait for OpenCV to be ready
      const checkInterval = setInterval(() => {
        if (window.cv && window.cv.Mat) {
          clearInterval(checkInterval);
          opencvReady = true;
          resolve();
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.cv) {
          reject(new Error("Timeout al inicializar OpenCV"));
        }
      }, 30000);
    };

    script.onerror = () => {
      reject(new Error("Error al cargar OpenCV.js"));
    };

    document.head.appendChild(script);
  });

  return opencvLoading;
}

export function isOpenCVReady(): boolean {
  return opencvReady && typeof window !== "undefined" && !!window.cv;
}

