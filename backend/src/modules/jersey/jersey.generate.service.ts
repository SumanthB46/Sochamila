import OpenAI from "openai";
import { imagekit } from "../../lib/imagekit";

/* ======================================================
   JERSEY IMAGE GENERATION SERVICE
   Using OpenAI DALL-E 3 for high-quality jersey designs
====================================================== */

const SYSTEM_PROMPT = `
You are a professional sports apparel designer and advanced AI image generator specializing in football jerseys.

Your task is to generate exactly two ultra-realistic, high-resolution images of a football jersey based strictly on the user's design requirements.

IMAGE REQUIREMENTS:

Image 1: Front view of the football jersey
Image 2: Back view of the football jersey

DESIGN RULES:

- Follow the user's instructions for colors, patterns, logos, text, name, and number precisely
- Ensure perfect design consistency between front and back (same fabric, colors, and patterns)
- Jersey must look professionally manufactured, suitable for real match play
- Use clean stitching, realistic fabric folds, and accurate textures
- No human model - display jersey as flat-lay or on a neutral mannequin

JERSEY PRESENTATION:

- Plain neutral background (white, gray, or studio background)
- Center the jersey clearly in the frame
- No watermarks, no extra text, no background objects

FRONT VIEW (Image 1 must show):

- Primary and secondary colors clearly visible
- Collar type (round, V-neck, polo, crew neck, etc.)
- Sleeve design and patterns exactly as specified
- Team logo placement on chest (if provided)
- Sponsor text or logo (if provided)
- Any side panels or special design elements

BACK VIEW (Image 2 must show):

- Player name clearly printed in bold font
- Jersey number in large, bold, readable font
- Back panel or side design elements matching front
- Same fabric and color alignment as front view
- All back details exactly as specified

QUALITY STANDARDS:

- Photorealistic lighting and shadows
- High sharpness and clarity
- Professional sports apparel quality
- Realistic fabric texture and material appearance
- Perfect consistency between both images

CRITICAL REQUIREMENTS:

- Generate EXACTLY 2 images - no more, no fewer
- Both images must show the SAME jersey design from different angles
- Must be suitable for professional product photography
- No human models, no unnecessary backgrounds
`;

interface GenerateJerseyOptions {
  prompt: string;
  customInstructions?: string;
}

interface JerseyGenerationResult {
  success: boolean;
  images: string[];
  prompt: string;
  model: string;
}

/**
 * Generate jersey images using OpenAI DALL-E 3
 * Generates 2 images (front and back view) and uploads to ImageKit
 */
export async function generateJerseyImages(
  options: GenerateJerseyOptions
): Promise<JerseyGenerationResult> {
  const { prompt, customInstructions } = options;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Get a key at https://platform.openai.com/api-keys and add it to your .env file."
    );
  }

  const openai = new OpenAI({ apiKey });

  try {
    // Build the complete prompt with system instructions
    const enhancedPrompt = `
${SYSTEM_PROMPT}

USER DESIGN SPECIFICATIONS:
${prompt}
${customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${customInstructions}` : ""}
    `.trim();

    // Generate 2 images for front and back views
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1, // DALL-E 3 only supports n=1, we'll generate separate calls for 2 images
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });

    const imageData1 = response.data?.[0]?.b64_json;
    if (!imageData1) {
      throw new Error("No image data in OpenAI response. Try a different prompt.");
    }

    // Generate second image with back view prompt
    const backViewPrompt = `${enhancedPrompt}\n\nIMPORTANT: This is the BACK VIEW of the jersey. Show the back side clearly.`;
    const response2 = await openai.images.generate({
      model: "dall-e-3",
      prompt: backViewPrompt.trim(),
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });

    const imageData2 = response2.data?.[0]?.b64_json;
    if (!imageData2) {
      throw new Error("Failed to generate second image. Try a different prompt.");
    }

    // Upload both images to ImageKit
    const uploadResponse1 = await imagekit.upload({
      file: imageData1,
      fileName: `jersey-front-${Date.now()}.png`,
      folder: "/jersey-designs",
      tags: ["jersey", "front-view", "dall-e-3"],
    });

    const uploadResponse2 = await imagekit.upload({
      file: imageData2,
      fileName: `jersey-back-${Date.now()}.png`,
      folder: "/jersey-designs",
      tags: ["jersey", "back-view", "dall-e-3"],
    });

    return {
      success: true,
      images: [uploadResponse1.url, uploadResponse2.url],
      prompt: enhancedPrompt,
      model: "dall-e-3",
    };
  } catch (err: any) {
    // Rate limit errors
    if (
      err?.status === 429 ||
      err?.code === "rate_limit_exceeded" ||
      err?.message?.includes("rate limit")
    ) {
      const rateError = new Error(
        `OpenAI rate limit exceeded: ${err?.message || "Please try again in a minute."}`
      );
      (rateError as any).status = 429;
      throw rateError;
    }

    // Invalid API key
    if (
      err?.status === 401 ||
      err?.message?.includes("Incorrect API key") ||
      err?.message?.includes("Invalid API key")
    ) {
      const authError = new Error(
        "Invalid OpenAI API key. Check OPENAI_API_KEY in your .env file."
      );
      (authError as any).status = 401;
      throw authError;
    }

    // ImageKit upload errors
    if (err?.message?.includes("ImageKit")) {
      throw new Error("Failed to save generated images. Please try again.");
    }

    throw err;
  }
}
