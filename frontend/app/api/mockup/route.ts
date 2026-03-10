// app/api/mockup/route.ts
import { NextResponse } from "next/server";

/**
 * Request body shape:
 * {
 *   productId: string | number;  // provider product/variant id
 *   color: string;               // e.g. "white" or provider color code
 *   view: "front" | "back" | "left" | "right";
 *   designUrl?: string;          // optional: your uploaded design URL
 * }
 */
export async function POST(req: Request) {
  try {
    const { productId, color, view, designUrl } = await req.json();

    if (!productId || !color || !view) {
      return NextResponse.json(
        { error: "Missing productId / color / view" },
        { status: 400 }
      );
    }

    // 🔁 Replace THIS with your actual mockup provider endpoint.
    // Below is a PRINTFUL-STYLE example.
    const response = await fetch(
      "https://api.your-mockup-provider.com/mockup-generator/create-task",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MOCKUP_API_KEY}`,
        },
        body: JSON.stringify({
          product_id: productId,
          color,
          view, // mapped as "front" | "back" | "left" | "right"
          design_url: designUrl ?? null,
          format: "png",
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Mockup API error:", text);
      return NextResponse.json(
        { error: "Mockup provider failed" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // 🔁 Map according to your provider's response.
    // Expecting something like: { result: { mockups: [{ url: string }] } }
    const mockupUrl =
      data?.result?.mockups?.[0]?.url ?? data?.mockupUrl ?? null;

    if (!mockupUrl) {
      return NextResponse.json(
        { error: "No mockup URL returned from provider" },
        { status: 500 }
      );
    }

    return NextResponse.json({ mockupUrl });
  } catch (error) {
    console.error("Mockup API route error:", error);
    return NextResponse.json(
      { error: "Unexpected error generating mockup" },
      { status: 500 }
    );
  }
}
