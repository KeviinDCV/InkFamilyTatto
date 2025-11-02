import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAIStyle } from "../ai-styles";

/**
 * Procesa una imagen con Gemini Vision API
 * Nota: Gemini no puede generar imágenes directamente, pero puede analizar
 * y proporcionar descripciones detalladas que podrían usarse con otros servicios.
 *
 * Por ahora, esta función solo sirve como fallback para análisis de imágenes.
 */
export async function processImageGemini(
  imageDataUrl: string,
  styleId: string = "classic"
): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Google Gemini API key not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Obtener configuración del estilo
    const style = getAIStyle(styleId);

    // Extract base64 data
    const base64Data = imageDataUrl.split(",")[1];
    const mimeType = imageDataUrl.split(";")[0].split(":")[1];

    // Create the image part
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    };

    console.log(`[Gemini] Analyzing image with style: ${style.name}`);

    // Use el prompt específico del estilo
    const result = await model.generateContent([style.gemini.analysisPrompt, imagePart]);
    const response = await result.response;
    const description = response.text();

    console.log(`[Gemini] Analysis complete:`, description);

    // Gemini no puede generar imágenes de sketch directamente
    // Solo puede analizar. Para uso real, esto debería combinarse con otra API
    throw new Error(
      "Gemini can only analyze images, not generate line art. Use Replicate as primary provider."
    );
  } catch (error) {
    console.error("[Gemini] Processing error:", error);
    throw error;
  }
}
