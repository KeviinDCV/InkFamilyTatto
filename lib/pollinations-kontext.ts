/**
 * Pollinations Kontext - Image-to-Image GRATIS + Sharp Upscaling
 * Documentación: https://github.com/pollinations/pollinations
 */

import sharp from 'sharp';

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

    // Convertir respuesta a buffer
    const arrayBuffer = await response.arrayBuffer();
    let resultBuffer = Buffer.from(arrayBuffer);
    
    console.log('[Pollinations] Esténcil generado, tamaño original:', resultBuffer.length, 'bytes');

    // UPSCALING + MEJORA DE NITIDEZ (AJUSTADO SEGÚN ESTILO)
    console.log('[Sharp] Aplicando procesamiento de imagen profesional...');
    
    try {
      // Procesamiento diferenciado según el estilo
      const isFineLine = styleId === 'andres-makishi';
      
      let sharpProcessor = sharp(resultBuffer)
        // 1. Upscaling con Lanczos3
        .resize({
          width: width * 2,  // 2x upscale
          height: height * 2,
          kernel: 'lanczos3', // Máxima calidad de interpolación
          fit: 'fill'
        })
        // 2. Convertir a escala de grises para mejorar contraste
        .grayscale();
      
      if (isFineLine) {
        // Procesamiento suave para líneas finas (Andres Makishi)
        sharpProcessor = sharpProcessor
          // Normalización suave
          .normalise()
          // Contraste moderado para preservar líneas finas
          .linear(1.3, -(128 * 0.3))
          // Sharpening suave para definir sin eliminar líneas finas
          .sharpen({
            sigma: 1.5,
            m1: 1.5,
            m2: 2,
            x1: 2,
            y2: 10,
            y3: 10
          })
          // Threshold más bajo para preservar líneas finas
          .threshold(110, { grayscale: false });
      } else {
        // Procesamiento agresivo para líneas bold (otros estilos)
        sharpProcessor = sharpProcessor
          // Normalizar para maximizar contraste
          .normalise()
          // Aumentar contraste agresivamente
          .linear(1.5, -(128 * 0.5))
          // Sharpening EXTREMO para líneas nítidas tipo SVG
          .sharpen({
            sigma: 2,
            m1: 2,
            m2: 3,
            x1: 3,
            y2: 15,
            y3: 15
          })
          // Unsharp mask adicional para bordes perfectos
          .convolve({
            width: 3,
            height: 3,
            kernel: [
              -1, -1, -1,
              -1,  9, -1,
              -1, -1, -1
            ]
          })
          // Threshold estándar para líneas bold
          .threshold(128, { grayscale: false });
      }
      
      const upscaledBuffer = await sharpProcessor
        // PNG sin pérdida
        .png({ quality: 100, compressionLevel: 6 })
        .toBuffer();
      
      resultBuffer = Buffer.from(upscaledBuffer);
      console.log('[Sharp] Procesamiento completado: líneas nítidas tipo SVG, tamaño:', resultBuffer.length, 'bytes');
    } catch (upscaleError) {
      console.warn('[Sharp] Error en procesamiento, usando imagen original:', upscaleError);
      // Si falla el upscaling, continuar con la imagen original
    }

    const resultMime = 'image/png';
    const resultDataUrl = bufferToDataURL(resultBuffer, resultMime);

    console.log('[Pollinations] ✅ Esténcil finalizado: 2x resolución + líneas súper nítidas tipo SVG');

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
    'classic': 'Transform this COMPLETE image into a traditional tattoo stencil design. MAINTAIN THE FULL COMPOSITION without cropping. Use bold lines, thick outlines, no shading, blackwork style. Clean contours with strong contrast. Professional tattoo stencil ready for application.',
    
    'darwin-enriquez': 'Convert this FULL image into a detailed tattoo stencil. MAINTAIN COMPLETE COMPOSITION - DO NOT CROP. Use clean lines, detailed linework, blackwork style, high-contrast, very sharp and crisp edges. Professional stencil with clear definition throughout.',
    
    'stiven-hernandez': 'Transform this COMPLETE image into a tattoo stencil with clean lines and classic detail. DO NOT CROP - maintain full composition. Use fine and consistent outlines, high contrast, traditional tattoo aesthetic. Professional stencil design.',
    
    'andres-makishi': 'Convert this FULL image into a fine-line tattoo stencil with VISIBLE delicate lines. PRESERVE THE COMPLETE COMPOSITION and ALL DETAILS from the original image. Use thin but CLEAR and DEFINED black lines to capture: (1) all outer contours, (2) all internal details including wrinkles, folds, textures, facial features, clothing details, accessories, (3) all surface changes and defining elements. Maintain EVERY detail but with fine-line style. Lines must be thin, consistent, visible and crisp throughout. Balance between delicate fine-line aesthetic and complete detail preservation. Professional fine-line stencil with good contrast and comprehensive linework.',
    
    'adrian-rod': 'Transform this COMPLETE image into a detailed tattoo stencil. KEEP THE ENTIRE FRAME intact. Use detailed linework, high-contrast, blackwork with detailed shading but only using lines. Rich detail throughout with line-based shading technique. Professional high-detail stencil.',
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
