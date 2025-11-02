import { NextRequest, NextResponse } from "next/server";
import { getAIStyle } from "@/lib/ai-styles";
import { imageToStencilPollinations } from "@/lib/pollinations-kontext";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl, styleId = "classic" } = await request.json();

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: "Image data URL is required" },
        { status: 400 }
      );
    }

    // Obtener configuración del estilo
    const style = getAIStyle(styleId);
    console.log(`[API] Processing with Pollinations Kontext - Style: ${style.name}`);

    const startTime = Date.now();

    // PROCESAR CON POLLINATIONS KONTEXT (100% GRATIS + IA REAL)
    const stencilDataUrl = await imageToStencilPollinations({
      imageDataUrl,
      styleId
    });

    const processingTime = Date.now() - startTime;

    console.log(`[API] Esténcil creado con IA en ${processingTime}ms`);

    return NextResponse.json({
      processedImageUrl: stencilDataUrl,
      provider: "pollinations-kontext",
      processingTime,
      styleUsed: style.name,
      message: "Procesado con Pollinations Kontext IA (100% GRATIS)"
    });
  } catch (error) {
    console.error("[API] Error processing image:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to process image",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
