/**
 * Replicate.com - API con TIER GRATUITO ($5/mes en créditos)
 * https://replicate.com
 */

export interface ReplicateOptions {
  imageDataUrl: string;
  styleId: string;
}

/**
 * Convierte imagen a esténcil usando Replicate
 */
export async function imageToStencilReplicate(
  options: ReplicateOptions
): Promise<string> {
  const { imageDataUrl, styleId } = options;

  const apiKey = process.env.REPLICATE_API_TOKEN;
  
  if (!apiKey) {
    throw new Error('REPLICATE_API_TOKEN no está configurada en .env.local - Obtén una gratis en https://replicate.com');
  }

  console.log(`[Replicate] Procesando con estilo: ${styleId}`);

  try {
    // Construir prompt según el estilo
    const prompt = getPromptForStyle(styleId);
    
    // Usar modelo de sketch/lineart
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b", // InstantID
        input: {
          image: imageDataUrl,
          prompt: prompt,
          negative_prompt: "color, colorful, blurry, photo, realistic, detailed background, complex, messy",
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 30,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Replicate] Error:', errorText);
      throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    
    // Esperar a que se complete la predicción
    const result = await waitForPrediction(prediction.id, apiKey);
    
    // Obtener URL de la imagen generada
    const imageUrl = result.output[0];
    
    // Descargar y convertir a data URL
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const dataUrl = await blobToDataURL(imageBlob);
    
    console.log('[Replicate] Esténcil generado exitosamente');
    
    return dataUrl;
  } catch (error) {
    console.error('[Replicate] Error:', error);
    throw error;
  }
}

/**
 * Espera a que la predicción se complete
 */
async function waitForPrediction(id: string, apiKey: string, maxAttempts = 60): Promise<any> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });

    const prediction = await response.json();

    if (prediction.status === 'succeeded') {
      return prediction;
    }

    if (prediction.status === 'failed') {
      throw new Error(`Prediction failed: ${prediction.error}`);
    }

    // Esperar 1 segundo antes de reintentar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('Prediction timed out');
}

/**
 * Genera prompt específico para cada estilo
 */
function getPromptForStyle(styleId: string): string {
  const prompts: Record<string, string> = {
    'classic': 'black and white tattoo stencil, thick bold lines, traditional tattoo style, clean outlines, high contrast',
    'darwin-enriquez': 'clean line art, detailed precise lines, black and white tattoo stencil',
    'stiven-hernandez': 'detailed line art, intricate black lines, classic tattoo stencil',
    'andres-makishi': 'minimalist line art, thin delicate lines, simple tattoo stencil',
    'adrian-rod': 'high contrast line art, bold dramatic lines, detailed tattoo stencil',
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
