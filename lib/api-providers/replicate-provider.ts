import Replicate from "replicate";
import { getAIStyle } from "../ai-styles";

export async function processImageReplicate(
  imageDataUrl: string,
  styleId: string = "classic"
): Promise<string> {
  try {
    const apiToken = process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error("Replicate API token not configured");
    }

    const replicate = new Replicate({
      auth: apiToken,
    });

    // Obtener configuración del estilo
    const style = getAIStyle(styleId);
    const { preprocessor, resolution } = style.replicate;

    console.log(`[Replicate] Processing with style: ${style.name} (${preprocessor})`);

    const output = await replicate.run(
      "fofr/controlnet-preprocessors:f6584ef76cf07a2014ffe1e9bdb1a5cfa714f031883ab43f8d4b05506625988e",
      {
        input: {
          image: imageDataUrl,
          preprocessor: preprocessor,
          resolution: resolution || 1024,
        },
      }
    );

    // Output should be a URL string
    if (typeof output === "string") {
      console.log(`[Replicate] Success! Image URL: ${output}`);
      return output;
    }

    // If output is an array, take the first element
    if (Array.isArray(output) && output.length > 0) {
      return output[0];
    }

    // If output is an object with a URL
    if (output && typeof output === "object" && "url" in output) {
      return (output as any).url;
    }

    throw new Error("Invalid response from Replicate");
  } catch (error) {
    console.error("[Replicate] Processing error:", error);
    throw error;
  }
}
