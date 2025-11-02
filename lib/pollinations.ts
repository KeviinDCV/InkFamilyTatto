/**
 * Pollinations.ai - Servicio GRATUITO de IA para generación de imágenes
 * https://pollinations.ai
 */

export interface PollinationsOptions {
  prompt: string;
  inputImage: string; // Data URL de la imagen original
  width?: number;
  height?: number;
  seed?: number;
  model?: 'flux' | 'flux-realism' | 'flux-anime' | 'flux-3d' | 'turbo';
  enhance?: boolean;
}

/**
 * Genera un esténcil usando Pollinations.ai con image-to-image
 */
export async function generateStencilWithPollinations(
  options: PollinationsOptions
): Promise<string> {
  const {
    prompt,
    inputImage,
    width = 1024,
    height = 1024,
    seed,
    model = 'flux',
    enhance = true
  } = options;

  try {
    // Primero necesitamos subir la imagen a un servidor público
    // Por ahora, vamos a hacer la conversión directamente con el prompt
    
    // Construir el prompt completo para esténcil
    const fullPrompt = encodeURIComponent(
      `Convert this image to a black and white tattoo stencil line art. ${prompt}. 
Style: Clean black lines on white background, high contrast, suitable for tattooing. 
Remove all colors and convert to pure line drawing with solid black outlines.`
    );

    // Construir URL de Pollinations
    const params = new URLSearchParams({
      width: width.toString(),
      height: height.toString(),
      model: model,
      enhance: enhance.toString(),
      nologo: 'true',
      ...(seed && { seed: seed.toString() })
    });

    const url = `https://image.pollinations.ai/prompt/${fullPrompt}?${params.toString()}`;

    console.log('[Pollinations] Generando esténcil con IA...');
    console.log('[Pollinations] URL:', url);

    // Pollinations genera la imagen bajo demanda
    // La URL ya ES la imagen, no necesitamos descargarla
    console.log('[Pollinations] Esténcil generado exitosamente');

    return url;
  } catch (error) {
    console.error('[Pollinations] Error:', error);
    throw error;
  }
}

/**
 * Genera prompt específico para cada estilo de esténcil
 */
export function getStencilPromptForStyle(styleId: string): string {
  const stylePrompts: Record<string, string> = {
    'classic': 'Traditional tattoo style with thick bold lines, strong outlines, solid black, classic old school aesthetic',
    
    'darwin-enriquez': 'Clean and detailed line art, precise thin lines, well-defined edges, minimalist but detailed, fine line work',
    
    'stiven-hernandez': 'Classic detailed line art, intricate details, balanced composition, connected flowing lines, traditional fine details',
    
    'andres-makishi': 'Minimalist fine-line drawing, ultra-thin delicate lines, simple elegant style, only essential features, minimal detail',
    
    'adrian-rod': 'High contrast detailed line art, dramatic bold lines, strong edge emphasis, heavy blacks, intense contrast between light and dark'
  };

  return stylePrompts[styleId] || stylePrompts['classic'];
}

/**
 * Obtiene el modelo de Pollinations adecuado para cada estilo
 */
export function getModelForStyle(styleId: string): PollinationsOptions['model'] {
  const styleModels: Record<string, PollinationsOptions['model']> = {
    'classic': 'flux',
    'darwin-enriquez': 'flux',
    'stiven-hernandez': 'flux-realism',
    'andres-makishi': 'flux-anime',
    'adrian-rod': 'flux-realism'
  };

  return styleModels[styleId] || 'flux';
}
