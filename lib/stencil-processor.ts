import { stencilStyles, StencilStyleConfig } from "./stencil-styles";
import { loadOpenCV } from "./opencv-loader";

declare global {
  interface Window {
    cv: any;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export async function processImageToStencil(
  imageDataUrl: string,
  styleId: string,
  thresholdMultiplier: number,
  lineColor: string,
  pngOutline: boolean
): Promise<string> {
  await loadOpenCV();

  const cv = window.cv;
  if (!cv) {
    throw new Error("OpenCV no está disponible");
  }

  const style = stencilStyles[styleId] || stencilStyles.classic;

  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          // Create canvas to get image data
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("No se pudo obtener el contexto del canvas"));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Convert ImageData to OpenCV Mat
          const src = cv.matFromImageData(imageData);

          // Convert to grayscale
          const gray = new cv.Mat();
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

          // Apply blur
          const blurred = new cv.Mat();
          cv.GaussianBlur(
            gray,
            blurred,
            new cv.Size(style.blurSize * 2 + 1, style.blurSize * 2 + 1),
            0,
            0,
            cv.BORDER_DEFAULT
          );

          // Apply Canny edge detection with adjusted thresholds
          const edges = new cv.Mat();
          const adjustedThreshold1 = (style.cannyThreshold1 * thresholdMultiplier) / 50;
          const adjustedThreshold2 = (style.cannyThreshold2 * thresholdMultiplier) / 50;
          cv.Canny(
            blurred,
            edges,
            adjustedThreshold1,
            adjustedThreshold2,
            style.apertureSize,
            false
          );

          // Apply thresholding
          const thresholded = new cv.Mat();
          const thresholdValue = (style.thresholdValue * thresholdMultiplier) / 50;
          let thresholdType = cv.THRESH_BINARY;

          switch (style.thresholdType) {
            case "binary":
              thresholdType = cv.THRESH_BINARY;
              break;
            case "binary_inv":
              thresholdType = cv.THRESH_BINARY_INV;
              break;
            case "adaptive":
              cv.adaptiveThreshold(
                edges,
                thresholded,
                255,
                cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv.THRESH_BINARY,
                11,
                2
              );
              break;
          }

          if (style.thresholdType !== "adaptive") {
            cv.threshold(edges, thresholded, thresholdValue, 255, thresholdType);
          }

          // Apply morphological operations
          let processed = thresholded.clone();
          if (style.morphologicalOp !== "none") {
            const kernel = cv.getStructuringElement(
              cv.MORPH_RECT,
              new cv.Size(
                style.morphologicalSize * 2 + 1,
                style.morphologicalSize * 2 + 1
              )
            );

            switch (style.morphologicalOp) {
              case "erode":
                cv.erode(processed, processed, kernel);
                break;
              case "dilate":
                cv.dilate(processed, processed, kernel);
                break;
              case "open":
                cv.morphologyEx(processed, processed, cv.MORPH_OPEN, kernel);
                break;
              case "close":
                cv.morphologyEx(processed, processed, cv.MORPH_CLOSE, kernel);
                break;
            }
          }

          // Convert to RGBA
          const rgba = new cv.Mat();
          cv.cvtColor(processed, rgba, cv.COLOR_GRAY2RGBA);

          // Convert Mat to ImageData for color manipulation
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = rgba.cols;
          tempCanvas.height = rgba.rows;
          const tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) {
            reject(new Error("No se pudo obtener el contexto del canvas temporal"));
            return;
          }

          const tempImageData = new ImageData(
            new Uint8ClampedArray(rgba.data),
            rgba.cols,
            rgba.rows
          );
          tempCtx.putImageData(tempImageData, 0, 0);

          // Apply color to white pixels (edges)
          const colorRgb = hexToRgb(lineColor);
          const finalImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = finalImageData.data;

          // Apply color to white pixels and set transparency
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // If pixel is white (or light), apply the selected color
            if (r > 127 || g > 127 || b > 127) {
              data[i] = colorRgb.r;     // Red
              data[i + 1] = colorRgb.g; // Green
              data[i + 2] = colorRgb.b; // Blue
              data[i + 3] = 255;        // Alpha (opaque)
            } else {
              // Black pixels become transparent if PNG outline is enabled
              if (pngOutline) {
                data[i + 3] = 0; // Transparent
              } else {
                data[i + 3] = 255; // Opaque (black background)
              }
            }
          }

          tempCtx.putImageData(finalImageData, 0, 0);

          // Convert to data URL
          const resultCanvas = document.createElement("canvas");
          resultCanvas.width = tempCanvas.width;
          resultCanvas.height = tempCanvas.height;
          const resultCtx = resultCanvas.getContext("2d");
          if (!resultCtx) {
            reject(new Error("No se pudo obtener el contexto del canvas de resultado"));
            return;
          }

          resultCtx.drawImage(tempCanvas, 0, 0);

          // Convert to data URL
          const resultDataUrl = resultCanvas.toDataURL("image/png");

          // Cleanup
          src.delete();
          gray.delete();
          blurred.delete();
          edges.delete();
          thresholded.delete();
          processed.delete();
          rgba.delete();

          resolve(resultDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Error al cargar la imagen"));
      };

      img.src = imageDataUrl;
    } catch (error) {
      reject(error);
    }
  });
}

