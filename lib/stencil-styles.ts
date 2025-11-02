export interface StencilStyleConfig {
  name: string;
  description: string;
  cannyThreshold1: number;
  cannyThreshold2: number;
  apertureSize: number;
  blurSize: number;
  thresholdValue: number;
  thresholdType: "binary" | "binary_inv" | "adaptive";
  morphologicalOp: "none" | "erode" | "dilate" | "open" | "close";
  morphologicalSize: number;
}

export const stencilStyles: Record<string, StencilStyleConfig> = {
  classic: {
    name: "Classic",
    description: "Líneas gruesas para estilos tradicionales",
    cannyThreshold1: 50,
    cannyThreshold2: 150,
    apertureSize: 3,
    blurSize: 3,
    thresholdValue: 127,
    thresholdType: "binary",
    morphologicalOp: "dilate",
    morphologicalSize: 2,
  },
  "darwin-enriquez": {
    name: "Darwin Enriquez",
    description: "Líneas limpias y detalladas",
    cannyThreshold1: 30,
    cannyThreshold2: 100,
    apertureSize: 3,
    blurSize: 1,
    thresholdValue: 100,
    thresholdType: "binary",
    morphologicalOp: "none",
    morphologicalSize: 0,
  },
  "stiven-hernandez": {
    name: "Stiven Hernandez",
    description: "Clásico detallado",
    cannyThreshold1: 40,
    cannyThreshold2: 120,
    apertureSize: 3,
    blurSize: 2,
    thresholdValue: 110,
    thresholdType: "binary",
    morphologicalOp: "close",
    morphologicalSize: 1,
  },
  "andres-makishi": {
    name: "Andres Makishi",
    description: "Minimalista fine-line",
    cannyThreshold1: 20,
    cannyThreshold2: 60,
    apertureSize: 3,
    blurSize: 1,
    thresholdValue: 80,
    thresholdType: "binary",
    morphologicalOp: "erode",
    morphologicalSize: 1,
  },
  "adrian-rod": {
    name: "Adrian Rod",
    description: "Detallado y alto contraste",
    cannyThreshold1: 60,
    cannyThreshold2: 180,
    apertureSize: 5,
    blurSize: 2,
    thresholdValue: 140,
    thresholdType: "binary",
    morphologicalOp: "dilate",
    morphologicalSize: 2,
  },
};

