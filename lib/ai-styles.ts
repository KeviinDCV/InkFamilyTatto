/**
 * AI Style Mapping - Mapea los estilos de InkFamily a parámetros de APIs de IA
 *
 * Cada estilo tiene configuraciones específicas para Replicate y Gemini
 * para mantener consistencia con los estilos originales de OpenCV.
 */

export interface AIStyleConfig {
  id: string;
  name: string;
  description: string;
  edgeStrength?: number; // Intensidad de detección de bordes

  // Configuración para Replicate ControlNet Preprocessors
  replicate: {
    preprocessor: "lineart" | "lineart_anime" | "lineart_coarse" | "pidinet" | "canny" | "hed" | "mlsd";
    resolution?: number;
    detectResolution?: number;
    imageResolution?: number;
  };

  // Configuración para Gemini (análisis y descripción)
  gemini: {
    analysisPrompt: string;
    styleKeywords: string[];
  };
}

export const aiStyles: Record<string, AIStyleConfig> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Líneas gruesas para estilos tradicionales",
    edgeStrength: 1.5,
    replicate: {
      preprocessor: "lineart_coarse",
      resolution: 1024,
    },
    gemini: {
      analysisPrompt: "Convert this image to a traditional tattoo stencil with thick, bold lines. Focus on strong outlines and traditional tattoo aesthetics.",
      styleKeywords: ["thick lines", "bold", "traditional", "strong outlines"],
    },
  },

  "darwin-enriquez": {
    id: "darwin-enriquez",
    name: "Darwin Enriquez",
    description: "Líneas limpias y detalladas",
    edgeStrength: 1.2,
    replicate: {
      preprocessor: "lineart",
      resolution: 1024,
    },
    gemini: {
      analysisPrompt: "Convert this image to a clean, detailed line art with precise lines. Maintain all important details while keeping lines clean and well-defined.",
      styleKeywords: ["clean lines", "detailed", "precise", "well-defined"],
    },
  },

  "stiven-hernandez": {
    id: "stiven-hernandez",
    name: "Stiven Hernandez",
    description: "Clásico detallado",
    edgeStrength: 1.8,
    replicate: {
      preprocessor: "pidinet",
      resolution: 1024,
      detectResolution: 1024,
    },
    gemini: {
      analysisPrompt: "Convert this image to a classic detailed line art. Preserve intricate details and maintain a balanced, classic style with connected lines.",
      styleKeywords: ["classic", "detailed", "intricate", "balanced"],
    },
  },

  "andres-makishi": {
    id: "andres-makishi",
    name: "Andres Makishi",
    description: "Minimalista fine-line",
    edgeStrength: 0.8,
    replicate: {
      preprocessor: "lineart_anime",
      resolution: 1024,
    },
    gemini: {
      analysisPrompt: "Convert this image to a minimalist fine-line drawing. Use thin, delicate lines and focus only on essential features. Keep it simple and elegant.",
      styleKeywords: ["minimalist", "fine-line", "thin", "delicate", "simple"],
    },
  },

  "adrian-rod": {
    id: "adrian-rod",
    name: "Adrian Rod",
    description: "Detallado y alto contraste",
    edgeStrength: 2.0,
    replicate: {
      preprocessor: "hed",
      resolution: 1024,
      detectResolution: 1024,
    },
    gemini: {
      analysisPrompt: "Convert this image to a highly detailed line art with strong contrast. Emphasize edges and create dramatic, bold lines with clear distinction between light and dark areas.",
      styleKeywords: ["high contrast", "detailed", "dramatic", "bold edges"],
    },
  },
};

/**
 * Obtiene la configuración de estilo AI por ID
 */
export function getAIStyle(styleId: string): AIStyleConfig {
  return aiStyles[styleId] || aiStyles.classic;
}

/**
 * Lista todos los estilos disponibles
 */
export function getAllAIStyles(): AIStyleConfig[] {
  return Object.values(aiStyles);
}
