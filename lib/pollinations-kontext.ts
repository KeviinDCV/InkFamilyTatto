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
    
    // Obtener dimensiones de la imagen original para mantener aspect ratio
    const imageDimensions = await getImageDimensions(imageDataUrl);
    console.log('[Pollinations] Dimensiones originales:', imageDimensions);
    
    // Calcular dimensiones manteniendo aspect ratio (máximo 2048px en el lado más largo)
    const maxSize = 2048;
    let width = imageDimensions.width;
    let height = imageDimensions.height;
    
    if (width > height) {
      if (width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
    }
    
    console.log('[Pollinations] Dimensiones ajustadas:', { width, height });
    
    // Subir imagen a servidor temporal (necesario para Pollinations)
    console.log('[Pollinations] Subiendo imagen a host temporal...');
    const imageUrl = await uploadToTemporaryHost(buffer, mime);
    console.log('[Pollinations] Imagen subida exitosamente:', imageUrl);
    
    // Generar prompt según estilo
    const prompt = getPromptForStyle(styleId);
    
    console.log(`[Pollinations] Prompt: ${prompt}`);

    // Negative prompt para evitar contenido no deseado pero pasar filtros
    const negativePrompt = 'photo, photograph, realistic, 3d, render, violence, gore, blood, weapons, nsfw, explicit, disturbing';
    
    // Llamar a Pollinations Kontext API CON AUTENTICACIÓN Y MÁXIMA CALIDAD
    // safe=false: desactiva filtro de contenido (necesario para tatuajes)
    // quality=high: máxima calidad de generación
    // enhance=false: evita mejoras automáticas que puedan activar filtros
    // IMPORTANTE: Usamos las dimensiones originales (con aspect ratio) para evitar crop
    const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=kontext&image=${encodeURIComponent(imageUrl)}&width=${width}&height=${height}&quality=high&nologo=true&safe=false&enhance=false&negative_prompt=${encodeURIComponent(negativePrompt)}&nofeed=true`;
    
    console.log(`[Pollinations] Llamando a API con MÁXIMA CALIDAD (${width}x${height}, quality=high, aspect ratio preservado)...`);

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    console.log(`[Pollinations] Response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Pollinations] Error response body:`, errorText);
      
      // Manejar específicamente el error de filtro de contenido
      if (errorText.includes('violence detection') || errorText.includes('Content rejected')) {
        throw new Error('La imagen fue rechazada por el filtro de contenido. Por favor, intenta con otra imagen o con un estilo diferente.');
      }
      
      throw new Error(`Error al procesar con IA: ${response.status}. Intenta nuevamente o con otra imagen.`);
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
 * IMPORTANTE: Todos los prompts incluyen instrucciones para mantener la composición COMPLETA
 * Los prompts están optimizados para evitar filtros de contenido
 */
function getPromptForStyle(styleId: string): string {
  const prompts: Record<string, string> = {
    'classic': 'Professional tattoo line art stencil design. Transform this COMPLETE image into clean black outlines and simple shapes with high contrast. MAINTAIN THE FULL COMPOSITION without cropping. Traditional tattoo aesthetic with bold lines. Remove colors, keep only linework. Artistic illustration style, suitable for body art stencil printing.',
    
    'darwin-enriquez': 'Fine art tattoo sketch in Darwin Enriquez style. Convert the ENTIRE image into elegant linework with precise details. KEEP THE FULL FRAME without cropping. Thin to medium artistic lines defining features and textures. Black and white illustration, professional tattoo design ready for transfer.',
    
    'stiven-hernandez': 'Classic tattoo design illustration in Stiven Hernandez style. Transform the COMPLETE image into detailed line art. DO NOT CROP - maintain full composition. Clear outlines with artistic structure and contrast. Traditional tattoo illustration with anatomical precision. Professional body art design.',
    
    'andres-makishi': 'Minimalist fine-line tattoo artwork inspired by Andres Makishi. Convert this FULL image into delicate line art. PRESERVE THE COMPLETE COMPOSITION. Ultra-thin precise lines with elegant contours. Simple black ink illustration focusing on negative space. Professional minimalist tattoo design.',
    
    'adrian-rod': 'Detailed tattoo illustration in Adrian Rod style. Transform this COMPLETE image into bold line art. KEEP THE ENTIRE FRAME intact. Sharp outlines with artistic texture definition. Professional high-contrast illustration. Ready for professional tattoo stencil application.',
  };

  return prompts[styleId] || prompts['classic'];
}

/**
 * Obtiene las dimensiones de una imagen desde Data URL
 */
async function getImageDimensions(dataURL: string): Promise<{ width: number; height: number }> {
  // En Node.js, necesitamos usar una librería como sharp o jimp
  // Por ahora, usaremos el tamaño del buffer como aproximación
  // y decodificaremos las dimensiones desde el header de la imagen
  
  const { buffer } = dataURLtoBuffer(dataURL);
  
  // Intentar leer dimensiones del header PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50) { // PNG
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  
  // Intentar leer dimensiones del header JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) { // JPEG
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xFF) break;
      const marker = buffer[offset + 1];
      if (marker === 0xC0 || marker === 0xC2) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }
  
  // Fallback: usar dimensiones cuadradas por defecto
  console.warn('[getImageDimensions] No se pudieron detectar dimensiones, usando 2048x2048');
  return { width: 2048, height: 2048 };
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
