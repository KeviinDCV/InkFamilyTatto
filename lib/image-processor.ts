/**
 * Procesador de Imágenes para Esténciles
 * Convierte imágenes a line art para tatuajes
 */

export interface ProcessingOptions {
  threshold?: number;
  edgeStrength?: number;
  lineColor?: string;
  style?: 'classic' | 'darwin-enriquez' | 'stiven-hernandez' | 'andres-makishi' | 'adrian-rod';
}

// Mapeo de IDs de estilos a tipos de procesamiento
function mapStyleToProcessing(styleId: string): 'classic' | 'geometric' | 'minimalist' | 'tribal' | 'realistic' {
  const mapping: Record<string, 'classic' | 'geometric' | 'minimalist' | 'tribal' | 'realistic'> = {
    'classic': 'classic',
    'darwin-enriquez': 'geometric', // Líneas limpias y detalladas
    'stiven-hernandez': 'realistic', // Clásico detallado
    'andres-makishi': 'minimalist', // Minimalista fine-line
    'adrian-rod': 'tribal' // Detallado y alto contraste
  };
  return mapping[styleId] || 'classic';
}

/**
 * Convierte una imagen a esténcil de line art
 */
export async function imageToStencil(
  imageDataUrl: string,
  options: ProcessingOptions = {}
): Promise<string> {
  const {
    threshold = 128,
    edgeStrength = 1.5,
    lineColor = '#000000',
    style = 'classic'
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('No se pudo crear el contexto 2D');
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Dibujar imagen original
        ctx.drawImage(img, 0, 0);
        
        // Obtener datos de píxeles
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Mapear estilo a tipo de procesamiento
        const processingType = mapStyleToProcessing(style);
        
        // Aplicar procesamiento según el estilo
        let processedData: ImageData;
        
        switch (processingType) {
          case 'geometric':
            processedData = applyGeometricStyle(imageData, threshold, edgeStrength);
            break;
          case 'minimalist':
            processedData = applyMinimalistStyle(imageData, threshold);
            break;
          case 'tribal':
            processedData = applyTribalStyle(imageData, threshold, edgeStrength);
            break;
          case 'realistic':
            processedData = applyRealisticStyle(imageData, threshold, edgeStrength);
            break;
          case 'classic':
          default:
            processedData = applyClassicStyle(imageData, threshold, edgeStrength);
        }
        
        // Aplicar color de línea
        applyLineColor(processedData, lineColor);
        
        // Poner datos procesados en el canvas
        ctx.putImageData(processedData, 0, 0);
        
        // Convertir a data URL
        const stencilDataUrl = canvas.toDataURL('image/png');
        resolve(stencilDataUrl);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };
    
    img.src = imageDataUrl;
  });
}

/**
 * Estilo Clásico: Edge detection mejorado con múltiples técnicas
 */
function applyClassicStyle(
  imageData: ImageData,
  threshold: number,
  edgeStrength: number
): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // 1. Aplicar reducción de ruido gaussiana antes de edge detection
  const blurred = gaussianBlur(imageData, 1.0);
  
  // 2. Convertir a escala de grises con mejor contraste
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < blurred.data.length; i += 4) {
    const idx = i / 4;
    // Usar pesos optimizados para percepción visual
    gray[idx] = 0.299 * blurred.data[i] + 0.587 * blurred.data[i + 1] + 0.114 * blurred.data[i + 2];
  }
  
  // 3. Mejorar contraste con histogram equalization
  const enhanced = histogramEqualization(gray, width, height);
  
  // 4. Aplicar Sobel operator mejorado
  const edges = new Uint8ClampedArray(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      // Sobel kernels mejorados
      const gx = 
        -enhanced[(y - 1) * width + (x - 1)] + enhanced[(y - 1) * width + (x + 1)] +
        -2 * enhanced[y * width + (x - 1)] + 2 * enhanced[y * width + (x + 1)] +
        -enhanced[(y + 1) * width + (x - 1)] + enhanced[(y + 1) * width + (x + 1)];
      
      const gy = 
        -enhanced[(y - 1) * width + (x - 1)] - 2 * enhanced[(y - 1) * width + x] - enhanced[(y - 1) * width + (x + 1)] +
        enhanced[(y + 1) * width + (x - 1)] + 2 * enhanced[(y + 1) * width + x] + enhanced[(y + 1) * width + (x + 1)];
      
      const magnitude = Math.sqrt(gx * gx + gy * gy) * edgeStrength;
      edges[idx] = Math.min(255, magnitude);
    }
  }
  
  // 5. Non-maximum suppression para líneas más finas
  const thinned = nonMaximumSuppression(edges, width, height);
  
  // 6. Hysteresis thresholding - AJUSTE SUPER DRAMÁTICO
  // Threshold INVERTIDO: bajo = POCAS líneas, alto = MUCHAS líneas
  // Esto es más intuitivo para el usuario
  const invertedThreshold = 200 - threshold; // Invertir el rango
  const lowThresh = Math.max(5, invertedThreshold * 0.2);
  const highThresh = Math.max(20, invertedThreshold * 0.8);
  
  console.log(`[Classic] Threshold usuario=${threshold}, invertido=${invertedThreshold}, usando low=${lowThresh}, high=${highThresh}`);
  
  const result = hysteresisThreshold(thinned, width, height, lowThresh, highThresh);
  
  // 7. Limpiar ruido con morfología
  const cleaned = morphologicalCleaning(result, width, height);
  
  return cleaned;
}

/**
 * Gaussian Blur para reducir ruido
 */
function gaussianBlur(imageData: ImageData, sigma: number): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const result = new ImageData(width, height);
  
  // Kernel gaussiano 5x5
  const kernel = [
    [1, 4, 7, 4, 1],
    [4, 16, 26, 16, 4],
    [7, 26, 41, 26, 7],
    [4, 16, 26, 16, 4],
    [1, 4, 7, 4, 1]
  ];
  const kernelSum = 273;
  
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = -2; ky <= 2; ky++) {
        for (let kx = -2; kx <= 2; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const weight = kernel[ky + 2][kx + 2];
          r += imageData.data[idx] * weight;
          g += imageData.data[idx + 1] * weight;
          b += imageData.data[idx + 2] * weight;
        }
      }
      
      const outIdx = (y * width + x) * 4;
      result.data[outIdx] = r / kernelSum;
      result.data[outIdx + 1] = g / kernelSum;
      result.data[outIdx + 2] = b / kernelSum;
      result.data[outIdx + 3] = 255;
    }
  }
  
  return result;
}

/**
 * Histogram Equalization para mejor contraste
 */
function histogramEqualization(gray: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const histogram = new Array(256).fill(0);
  const total = width * height;
  
  // Calcular histograma
  for (let i = 0; i < gray.length; i++) {
    histogram[gray[i]]++;
  }
  
  // Calcular CDF
  const cdf = new Array(256);
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }
  
  // Normalizar
  const cdfMin = cdf.find(v => v > 0) || 0;
  const result = new Uint8ClampedArray(gray.length);
  
  for (let i = 0; i < gray.length; i++) {
    result[i] = Math.round(((cdf[gray[i]] - cdfMin) / (total - cdfMin)) * 255);
  }
  
  return result;
}

/**
 * Non-maximum suppression para líneas más finas
 */
function nonMaximumSuppression(edges: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const result = new Uint8ClampedArray(edges.length);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const current = edges[idx];
      
      // Comparar con vecinos
      const n1 = edges[(y - 1) * width + x];
      const n2 = edges[(y + 1) * width + x];
      const n3 = edges[y * width + (x - 1)];
      const n4 = edges[y * width + (x + 1)];
      
      if (current >= n1 && current >= n2 && current >= n3 && current >= n4) {
        result[idx] = current;
      } else {
        result[idx] = 0;
      }
    }
  }
  
  return result;
}

/**
 * Hysteresis thresholding para mejor detección de bordes
 */
function hysteresisThreshold(
  edges: Uint8ClampedArray,
  width: number,
  height: number,
  lowThreshold: number,
  highThreshold: number
): ImageData {
  const result = new ImageData(width, height);
  const strong = new Uint8ClampedArray(edges.length);
  const weak = new Uint8ClampedArray(edges.length);
  
  // Clasificar píxeles
  for (let i = 0; i < edges.length; i++) {
    if (edges[i] >= highThreshold) {
      strong[i] = 1;
    } else if (edges[i] >= lowThreshold) {
      weak[i] = 1;
    }
  }
  
  // Conectar bordes débiles a fuertes
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      if (weak[idx]) {
        // Verificar si hay un borde fuerte cercano
        let hasStrongNeighbor = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (strong[(y + dy) * width + (x + dx)]) {
              hasStrongNeighbor = true;
              break;
            }
          }
          if (hasStrongNeighbor) break;
        }
        
        if (hasStrongNeighbor) {
          strong[idx] = 1;
        }
      }
    }
  }
  
  // Convertir a ImageData (líneas negras sobre blanco)
  for (let i = 0; i < strong.length; i++) {
    const value = strong[i] ? 0 : 255;
    const dataIdx = i * 4;
    result.data[dataIdx] = value;
    result.data[dataIdx + 1] = value;
    result.data[dataIdx + 2] = value;
    result.data[dataIdx + 3] = 255;
  }
  
  return result;
}

/**
 * Limpieza morfológica para eliminar ruido
 */
function morphologicalCleaning(imageData: ImageData, width: number, height: number): ImageData {
  const result = new ImageData(width, height);
  const data = imageData.data;
  
  // Operación de apertura (erosión seguida de dilatación)
  const eroded = new Uint8ClampedArray(width * height);
  
  // Erosión
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const dataIdx = idx * 4;
      
      // Si algún vecino es blanco, hacer blanco
      let allBlack = true;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          if (data[nIdx] > 128) {
            allBlack = false;
            break;
          }
        }
        if (!allBlack) break;
      }
      
      eroded[idx] = allBlack ? 0 : 255;
    }
  }
  
  // Dilatación
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const dataIdx = idx * 4;
      
      // Si algún vecino es negro, hacer negro
      let hasBlack = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = (y + dy) * width + (x + dx);
          if (eroded[nIdx] === 0) {
            hasBlack = true;
            break;
          }
        }
        if (hasBlack) break;
      }
      
      const value = hasBlack ? 0 : 255;
      result.data[dataIdx] = value;
      result.data[dataIdx + 1] = value;
      result.data[dataIdx + 2] = value;
      result.data[dataIdx + 3] = 255;
    }
  }
  
  return result;
}

/**
 * Estilo Darwin Enriquez (Geométrico): Líneas limpias y precisas
 */
function applyGeometricStyle(
  imageData: ImageData,
  threshold: number,
  edgeStrength: number
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  
  // 1. Blur más suave para preservar detalles
  const blurred = gaussianBlur(imageData, 0.5);
  
  // 2. Convertir a escala de grises
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < blurred.data.length; i += 4) {
    const idx = i / 4;
    gray[idx] = 0.299 * blurred.data[i] + 0.587 * blurred.data[i + 1] + 0.114 * blurred.data[i + 2];
  }
  
  // 3. Histogram equalization
  const enhanced = histogramEqualization(gray, width, height);
  
  // 4. Sobel con menor intensidad para líneas más finas
  const edges = new Uint8ClampedArray(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      const gx = 
        -enhanced[(y - 1) * width + (x - 1)] + enhanced[(y - 1) * width + (x + 1)] +
        -2 * enhanced[y * width + (x - 1)] + 2 * enhanced[y * width + (x + 1)] +
        -enhanced[(y + 1) * width + (x - 1)] + enhanced[(y + 1) * width + (x + 1)];
      
      const gy = 
        -enhanced[(y - 1) * width + (x - 1)] - 2 * enhanced[(y - 1) * width + x] - enhanced[(y - 1) * width + (x + 1)] +
        enhanced[(y + 1) * width + (x - 1)] + 2 * enhanced[(y + 1) * width + x] + enhanced[(y + 1) * width + (x + 1)];
      
      // Menor edgeStrength para líneas más delicadas
      const magnitude = Math.sqrt(gx * gx + gy * gy) * (edgeStrength * 0.7);
      edges[idx] = Math.min(255, magnitude);
    }
  }
  
  // 5. Non-maximum suppression para líneas ultra finas
  const thinned = nonMaximumSuppression(edges, width, height);
  
  // 6. Hysteresis más estricto
  const result = hysteresisThreshold(thinned, width, height, threshold * 0.6, threshold * 1.2);
  
  return result;
}

/**
 * Estilo Andres Makishi (Minimalista): Líneas ultra finas
 */
function applyMinimalistStyle(
  imageData: ImageData,
  threshold: number
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  
  // 1. Blur más agresivo para simplificar
  const blurred = gaussianBlur(imageData, 1.5);
  
  // 2. Escala de grises
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < blurred.data.length; i += 4) {
    const idx = i / 4;
    gray[idx] = 0.299 * blurred.data[i] + 0.587 * blurred.data[i + 1] + 0.114 * blurred.data[i + 2];
  }
  
  // 3. Sobel con mínima intensidad
  const edges = new Uint8ClampedArray(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      const gx = 
        -gray[(y - 1) * width + (x - 1)] + gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)] + 2 * gray[y * width + (x + 1)] +
        -gray[(y + 1) * width + (x - 1)] + gray[(y + 1) * width + (x + 1)];
      
      const gy = 
        -gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - gray[(y - 1) * width + (x + 1)] +
        gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + gray[(y + 1) * width + (x + 1)];
      
      // Mínima intensidad para líneas ultra delicadas
      const magnitude = Math.sqrt(gx * gx + gy * gy) * 0.5;
      edges[idx] = Math.min(255, magnitude);
    }
  }
  
  // 4. Hysteresis muy alto para solo líneas principales
  const result = hysteresisThreshold(edges, width, height, threshold * 1.5, threshold * 2.0);
  
  return result;
}

/**
 * Estilo Adrian Rod (Tribal): Líneas MUY gruesas y alto contraste
 */
function applyTribalStyle(
  imageData: ImageData,
  threshold: number,
  edgeStrength: number
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  
  // 1. Sin blur para mantener bordes duros
  const data = imageData.data;
  
  // 2. Escala de grises con contraste aumentado
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    let g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    // Aumentar contraste
    g = g < 128 ? g * 0.5 : 128 + (g - 128) * 1.5;
    gray[idx] = Math.min(255, Math.max(0, g));
  }
  
  // 3. Sobel con MÁXIMA intensidad
  const edges = new Uint8ClampedArray(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      const gx = 
        -gray[(y - 1) * width + (x - 1)] + gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)] + 2 * gray[y * width + (x + 1)] +
        -gray[(y + 1) * width + (x - 1)] + gray[(y + 1) * width + (x + 1)];
      
      const gy = 
        -gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - gray[(y - 1) * width + (x + 1)] +
        gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + gray[(y + 1) * width + (x + 1)];
      
      // MÁXIMA intensidad
      const magnitude = Math.sqrt(gx * gx + gy * gy) * (edgeStrength * 2.5);
      edges[idx] = Math.min(255, magnitude);
    }
  }
  
  // 4. Threshold bajo para capturar más bordes
  const result = hysteresisThreshold(edges, width, height, threshold * 0.3, threshold * 0.7);
  
  // 5. DILATAR 2 veces para líneas MUY gruesas
  const dilated1 = dilateImage(result, width, height);
  const dilated2 = dilateImage(dilated1, width, height);
  
  return dilated2;
}

/**
 * Dilatación para engrosar líneas
 */
function dilateImage(imageData: ImageData, width: number, height: number): ImageData {
  const result = new ImageData(width, height);
  const data = imageData.data;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const dataIdx = idx * 4;
      
      // Si hay un píxel negro en vecindad, hacer negro
      let hasBlack = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          if (data[nIdx] === 0) {
            hasBlack = true;
            break;
          }
        }
        if (hasBlack) break;
      }
      
      const value = hasBlack ? 0 : 255;
      result.data[dataIdx] = value;
      result.data[dataIdx + 1] = value;
      result.data[dataIdx + 2] = value;
      result.data[dataIdx + 3] = 255;
    }
  }
  
  return result;
}

/**
 * Estilo Stiven Hernandez (Realista): Máximo detalle con hatching
 */
function applyRealisticStyle(
  imageData: ImageData,
  threshold: number,
  edgeStrength: number
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  
  // 1. Blur mínimo para preservar detalles
  const blurred = gaussianBlur(imageData, 0.7);
  
  // 2. Escala de grises
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < blurred.data.length; i += 4) {
    const idx = i / 4;
    gray[idx] = 0.299 * blurred.data[i] + 0.587 * blurred.data[i + 1] + 0.114 * blurred.data[i + 2];
  }
  
  // 3. Histogram equalization
  const enhanced = histogramEqualization(gray, width, height);
  
  // 4. Sobel normal
  const edges = new Uint8ClampedArray(width * height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      const gx = 
        -enhanced[(y - 1) * width + (x - 1)] + enhanced[(y - 1) * width + (x + 1)] +
        -2 * enhanced[y * width + (x - 1)] + 2 * enhanced[y * width + (x + 1)] +
        -enhanced[(y + 1) * width + (x - 1)] + enhanced[(y + 1) * width + (x + 1)];
      
      const gy = 
        -enhanced[(y - 1) * width + (x - 1)] - 2 * enhanced[(y - 1) * width + x] - enhanced[(y - 1) * width + (x + 1)] +
        enhanced[(y + 1) * width + (x - 1)] + 2 * enhanced[(y + 1) * width + x] + enhanced[(y + 1) * width + (x + 1)];
      
      const magnitude = Math.sqrt(gx * gx + gy * gy) * edgeStrength;
      edges[idx] = Math.min(255, magnitude);
    }
  }
  
  // 5. Threshold medio para muchos detalles
  const result = hysteresisThreshold(edges, width, height, threshold * 0.4, threshold * 0.9);
  
  // 6. Agregar hatching para sombreado
  const data = result.data;
  const originalGray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const idx = i / 4;
    originalGray[idx] = 0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2];
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const grayValue = originalGray[idx];
      const dataIdx = idx * 4;
      
      // Solo en píxeles blancos
      if (data[dataIdx] === 255) {
        // Hatching según nivel de gris
        if (grayValue < 80 && (x + y) % 2 === 0) {
          data[dataIdx] = data[dataIdx + 1] = data[dataIdx + 2] = 0;
        } else if (grayValue < 120 && (x + y) % 3 === 0) {
          data[dataIdx] = data[dataIdx + 1] = data[dataIdx + 2] = 0;
        } else if (grayValue < 160 && (x + y) % 5 === 0) {
          data[dataIdx] = data[dataIdx + 1] = data[dataIdx + 2] = 0;
        }
      }
    }
  }
  
  return result;
}

/**
 * Aplica el color de línea seleccionado
 */
function applyLineColor(imageData: ImageData, color: string): void {
  const rgb = hexToRgb(color);
  if (!rgb) return;
  
  console.log(`[applyLineColor] Aplicando color: ${color} = RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`);
  
  const data = imageData.data;
  let pixelsChanged = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    // Cambiar todos los píxeles que sean más oscuros que gris medio
    if (data[i] < 128 || data[i + 1] < 128 || data[i + 2] < 128) {
      data[i] = rgb.r;
      data[i + 1] = rgb.g;
      data[i + 2] = rgb.b;
      pixelsChanged++;
    }
  }
  
  console.log(`[applyLineColor] ${pixelsChanged} píxeles cambiados a ${color}`);
}

/**
 * Convierte color hex a RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
