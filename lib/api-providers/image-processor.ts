import { ProcessImageOptions, ProcessImageResult, ImageProcessorProvider } from "./types";
import { getAvailableProvider, updateProviderStats } from "./provider-stats";
import { processImageGemini } from "./gemini-provider";
import { processImageReplicate } from "./replicate-provider";

/**
 * Procesa una imagen para convertirla en line art usando IA
 *
 * Este sistema rota automáticamente entre Replicate y Gemini:
 * 1. Replicate (primera opción): Mejor calidad, $25 gratis = ~2500 imágenes
 * 2. Gemini (fallback): 500 requests/día gratis, solo para análisis
 *
 * @param options - Opciones de procesamiento
 * @returns Resultado con la URL de la imagen procesada
 */
export async function processImageToLineArt(
  options: ProcessImageOptions
): Promise<ProcessImageResult> {
  const {
    imageDataUrl,
    provider = "auto",
    styleId = "classic",
    lineColor,
    pngOutline,
  } = options;

  let selectedProvider: ImageProcessorProvider;

  // Determine which provider to use
  if (provider === "auto") {
    const availableProvider = getAvailableProvider();
    if (!availableProvider) {
      throw new Error(
        "All AI providers have reached their daily limits. Please try again tomorrow or configure additional API keys."
      );
    }
    selectedProvider = availableProvider;
  } else {
    selectedProvider = provider;
  }

  const startTime = Date.now();

  try {
    let processedImageUrl: string;

    console.log(`[AI Processor] Using ${selectedProvider} provider with style: ${styleId}`);

    switch (selectedProvider) {
      case "replicate":
        processedImageUrl = await processImageReplicate(imageDataUrl, styleId);
        break;

      case "gemini":
        // Gemini no puede generar imágenes directamente, solo analizar
        // Intentar con Replicate en su lugar
        console.warn("[AI Processor] Gemini cannot generate line art, falling back to Replicate");
        processedImageUrl = await processImageReplicate(imageDataUrl, styleId);
        selectedProvider = "replicate";
        break;

      default:
        throw new Error(`Unknown provider: ${selectedProvider}`);
    }

    const processingTime = Date.now() - startTime;

    // Update stats for successful request
    updateProviderStats(selectedProvider, true);

    console.log(`[AI Processor] Success! Processed in ${processingTime}ms`);

    return {
      processedImageUrl,
      provider: selectedProvider,
      processingTime,
    };
  } catch (error) {
    console.error(`[AI Processor] Error with ${selectedProvider} provider:`, error);

    // If auto mode and this provider failed, try the next one
    if (provider === "auto") {
      console.log(`[AI Processor] ${selectedProvider} failed, trying next provider...`);

      // Mark this provider as temporarily unavailable
      updateProviderStats(selectedProvider, false);

      // Try again with a different provider
      const nextProvider = getAvailableProvider();
      if (nextProvider && nextProvider !== selectedProvider) {
        console.log(`[AI Processor] Retrying with ${nextProvider}...`);
        return processImageToLineArt({
          ...options,
          provider: nextProvider,
        });
      }
    }

    throw error;
  }
}
