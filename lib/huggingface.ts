/**
 * Hugging Face Inference API - Image-to-Image para Esténciles
 * https://huggingface.co/docs/diffusers/using-diffusers/img2img
 */

const HF_API_URL = "https://api-inference.huggingface.co/models";

// Modelo de Stable Diffusion para image-to-image que SÍ está en Inference API
const MODEL = "stabilityai/stable-diffusion-2-1";

export interface HuggingFaceOptions {
  imageDataUrl: string;
  styleId: string;
  prompt?: string;
}

/**
 * Convierte imagen a esténcil usando Hugging Face Inference API
 */
export async function imageToStencilHuggingFace(
  options: HuggingFaceOptions
): Promise<string> {
  // Hugging Face Inference API NO soporta image-to-image en tier gratuito
  // Fallback a procesamiento local
  throw new Error('Hugging Face image-to-image no está disponible en tier gratuito. Usa procesamiento local.');
}

/**
 * Genera instrucción específica para cada estilo (para InstructPix2Pix)
 */
function getPromptForStyle(styleId: string): string {
  const instructions: Record<string, string> = {
    'classic': 'convert to black and white tattoo stencil with thick bold lines',
    'darwin-enriquez': 'convert to clean detailed line art with precise thin lines',
    'stiven-hernandez': 'convert to detailed line art with intricate black lines',
    'andres-makishi': 'convert to minimalist line art with ultra-thin delicate lines',
    'adrian-rod': 'convert to high contrast line art with bold dramatic lines',
  };
  
  return instructions[styleId] || instructions['classic'];
}

/**
 * Convierte Data URL a Blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
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
