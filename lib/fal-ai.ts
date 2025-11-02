/**
 * fal.ai - API GRATUITA para image-to-image
 * https://fal.ai
 */

const FAL_API_URL = "https://fal.run";

export interface FalAIOptions {
  imageDataUrl: string;
  styleId: string;
}

/**
 * Convierte imagen a esténcil usando fal.ai
 */
export async function imageToStencilFalAI(
  options: FalAIOptions
): Promise<string> {
  const { imageDataUrl, styleId } = options;

  // fal.ai API key
  const apiKey = process.env.FAL_KEY;
  
  if (!apiKey) {
    throw new Error('FAL_KEY no está configurada en .env.local');
  }

  console.log(`[fal.ai] Procesando con estilo: ${styleId}`);

  try {
    // Construir prompt según el estilo
    const prompt = getPromptForStyle(styleId);
    
    // Llamar a fal.ai con FLUX ControlNet
    const response = await fetch(`${FAL_API_URL}/fal-ai/flux-lora`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_url: imageDataUrl,
        lora_path: "https://huggingface.co/davisbro/half_illustration/resolve/main/flux_train_replicate.safetensors",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false,
        output_format: "png",
        image_prompt_strength: 0.85,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[fal.ai] Error:', errorText);
      throw new Error(`fal.ai API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // fal.ai devuelve la URL de la imagen
    const imageUrl = result.images[0].url;
    
    // Descargar y convertir a data URL
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const dataUrl = await blobToDataURL(imageBlob);
    
    console.log('[fal.ai] Esténcil generado exitosamente');
    
    return dataUrl;
  } catch (error) {
    console.error('[fal.ai] Error:', error);
    throw error;
  }
}

/**
 * Genera prompt específico para cada estilo
 */
function getPromptForStyle(styleId: string): string {
  const prompts: Record<string, string> = {
    'classic': 'black and white tattoo stencil, thick bold lines, traditional tattoo style, clean strong outlines, high contrast line art, no shading, pure black lines on white background',
    'darwin-enriquez': 'clean detailed line art, precise thin lines, black and white tattoo stencil, fine details, minimal style, crisp edges',
    'stiven-hernandez': 'detailed line art stencil, intricate black lines, classic tattoo design, balanced composition, clean linework',
    'andres-makishi': 'minimalist line art, ultra-thin delicate lines, simple elegant tattoo stencil, minimal details, fine line work',
    'adrian-rod': 'high contrast line art, bold dramatic thick lines, detailed tattoo stencil, strong edges, heavy black lines',
  };
  
  return prompts[styleId] || prompts['classic'];
}

/**
 * Convierte Blob a Data URL
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
