export type ImageProcessorProvider = "gemini" | "replicate" | "auto";

export interface ProcessImageOptions {
  imageDataUrl: string;
  provider?: ImageProcessorProvider;
  styleId?: string; // ID del estilo de InkFamily (classic, darwin-enriquez, etc.)
  lineColor?: string; // Color de las líneas en hex
  pngOutline?: boolean; // Si las líneas deben tener fondo transparente
}

export interface ProcessImageResult {
  processedImageUrl: string;
  provider: ImageProcessorProvider;
  processingTime: number;
}

export interface ProviderStats {
  provider: ImageProcessorProvider;
  requestsToday: number;
  lastRequest: number;
  isAvailable: boolean;
  dailyLimit: number;
  errorCount?: number;
}

export interface StyleProcessingOptions {
  styleId: string;
  lineColor: string;
  pngOutline: boolean;
}
