import { NextResponse } from "next/server";

/**
 * @deprecated This route is no longer used.
 * AI image generation is handled by the backend at POST /api/ai/generate
 * See: backend/src/modules/ai/ai.generate.service.ts
 */
export async function POST(req: Request) {
  return NextResponse.json(
    { 
      error: "This endpoint is deprecated. Use the backend API at /api/ai/generate instead.",
      success: false 
    },
    { status: 410 }
  );
}
