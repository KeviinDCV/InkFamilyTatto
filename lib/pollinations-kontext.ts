/**
 * Pollinations Kontext - Image-to-Image GRATIS
 * Documentación: https://github.com/pollinations/pollinations
 */

export interface PollinationsKontextOptions {
  imageDataUrl: string;
  styleId: string;
}

/**
 * Convierte imagen a esténcil usando Pollinations Kontext (100% GRATIS)
 */
export async function imageToStencilPollinations(
  options: PollinationsKontextOptions
): Promise<string> {
  const { imageDataUrl, styleId } = options;

  try {
    console.log('[Pollinations Kontext] Procesando imagen...');
    console.log('[Pollinations] Tamaño data URL:', imageDataUrl.length, 'caracteres');

    // Obtener API key del servidor
    const apiKey = process.env.POLLINATIONS_API_KEY;
    
    if (!apiKey) {
      throw new Error('POLLINATIONS_API_KEY no está configurada en .env.local');
    }

    console.log('[Pollinations] API Key encontrada:', apiKey.substring(0, 4) + '...');

    // Convertir data URL a buffer
    const { buffer, mime } = dataURLtoBuffer(imageDataUrl);
    console.log('[Pollinations] Buffer creado:', buffer.length, 'bytes, mime:', mime);
    
    // Subir imagen a servidor temporal (necesario para Pollinations)
    console.log('[Pollinations] Subiendo imagen a host temporal...');
    const imageUrl = await uploadToTemporaryHost(buffer, mime);
    console.log('[Pollinations] Imagen subida exitosamente:', imageUrl);
    
    // Generar prompt según estilo
    const prompt = getPromptForStyle(styleId);
    
    console.log(`[Pollinations] Prompt: ${prompt}`);

    // Llamar a Pollinations Kontext API CON AUTENTICACIÓN Y MÁXIMA CALIDAD
    // safe=false: desactiva filtro de contenido (necesario para tatuajes)
    // quality=high: máxima calidad de generación
    // 2048x2048: resolución ultra alta para detalles profesionales
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=kontext&image=${encodeURIComponent(imageUrl)}&width=2048&height=2048&quality=high&nologo=true&safe=false`;
    
    console.log(`[Pollinations] Llamando a API con MÁXIMA CALIDAD (2048x2048, quality=high)...`);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    console.log(`[Pollinations] Response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Pollinations] Error response body:`, errorText);
      throw new Error(`Pollinations API error: ${response.status} - ${errorText || response.statusText}`);
    }

    // Convertir respuesta a buffer y luego a data URL
    const arrayBuffer = await response.arrayBuffer();
    const resultBuffer = Buffer.from(arrayBuffer);
    const resultMime = response.headers.get('content-type') || 'image/png';
    const resultDataUrl = bufferToDataURL(resultBuffer, resultMime);

    console.log('[Pollinations] Esténcil generado exitosamente, tamaño:', resultBuffer.length, 'bytes');

    return resultDataUrl;
  } catch (error) {
    console.error('[Pollinations] Error completo:', error);
    if (error instanceof Error) {
      console.error('[Pollinations] Error stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Genera prompt específico para cada estilo
 * Prompts profesionales basados en artistas reales
 */
function getPromptForStyle(styleId: string): string {
  const prompts: Record<string, string> = {
    'classic': 'Convert this image into a traditional tattoo stencil with bold, clean black outlines. Use strong lines and simplified forms with high contrast, emphasizing classic tattoo aesthetics. Remove all colors and gradients, keeping only clear shapes and linework suitable for stencil printing.',
    
    'darwin-enriquez': 'Create a tattoo stencil inspired by Darwin Enriquez\'s style. Focus on precise, clean, and detailed linework with balanced shading. Use thin to medium lines to define facial features, hair, and textures. Keep the composition elegant, black and white only, ready for tattoo transfer.',
    
    'stiven-hernandez': 'Generate a tattoo stencil in the style of Stiven Hernandez — a classic yet highly detailed black and white design. Emphasize clear outlines, realistic structure, and strong contrast, while preserving a traditional tattoo composition. Simplify background elements but retain facial and anatomical precision.',
    
    'andres-makishi': 'Transform this image into a minimalist fine-line tattoo stencil inspired by Andres Makishi. Use ultra-thin, precise lines with delicate detail and minimal shading. Keep the composition elegant and simple, focusing on clean contours and negative space. Black ink only, no background or fills.',
    
    'adrian-rod': 'Create a tattoo stencil in the style of Adrian Rod — detailed, high-contrast, and dynamic. Use sharp black outlines with deep shadows and intricate texture definition. Focus on depth and realism while maintaining stencil clarity. The result should be bold and ready for professional tattoo application.',
  };

  return prompts[styleId] || prompts['classic'];
}

/**
 * Convierte Data URL a Buffer (Node.js)
 */
function dataURLtoBuffer(dataURL: string): { buffer: Buffer; mime: string } {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const base64Data = parts[1];
  const buffer = Buffer.from(base64Data, 'base64');
  
  return { buffer, mime };
}

/**
 * Convierte Buffer a Data URL
 */
function bufferToDataURL(buffer: Buffer, mime: string): string {
  const base64 = buffer.toString('base64');
  return `data:${mime};base64,${base64}`;
}

/**
 * Sube imagen a servidor temporal usando freeimage.host (100% gratis, sin API key)
 */
async function uploadToTemporaryHost(buffer: Buffer, mime: string): Promise<string> {
  try {
    console.log('[Upload] Iniciando upload, tamaño:', buffer.length, 'bytes');
    
    // Convertir buffer a base64
    const base64 = buffer.toString('base64');
    console.log('[Upload] Base64 creado, longitud:', base64.length);
    
    // Usar freeimage.host (gratis, sin autenticación)
    const formData = new FormData();
    formData.append('source', base64);
    formData.append('type', 'base64');
    formData.append('action', 'upload');
    
    console.log('[Upload] Enviando a freeimage.host...');
    const response = await fetch('https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5', {
      method: 'POST',
      body: formData,
    });

    console.log('[Upload] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Upload] Error response:', errorText);
      throw new Error(`Error uploading to freeimage.host: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Upload] Response data:', JSON.stringify(data).substring(0, 500));
    
    if (data.status_code !== 200) {
      console.error('[Upload] Upload failed, data:', data);
      throw new Error(data.error?.message || 'Upload failed');
    }
    
    console.log('[Upload] Upload exitoso, URL:', data.image?.url);
    return data.image.url;
  } catch (error) {
    console.error('[Upload] Error completo:', error);
    console.log('[Upload] FALLBACK: Usando data URL directamente');
    // Fallback: usar la imagen directamente como data URL en la query
    // Pollinations puede aceptar data URLs directamente
    const dataUrl = bufferToDataURL(buffer, mime);
    return dataUrl;
  }
}
