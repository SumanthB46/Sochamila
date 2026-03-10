import Replicate from "replicate";
import { imagekit } from "../../lib/imagekit";

/* ======================================================
   IMAGE EDIT (Remove background, Upscale)
   Uses Replicate + uploads result to ImageKit for permanent URL
====================================================== */

const REPLICATE_REMBG = "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";
const REPLICATE_UPSCALE =
  "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b";

export type ImageEditAction = "remove-bg" | "upscale";

export interface ImageEditResult {
  success: boolean;
  url: string;
  action: ImageEditAction;
}

async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString("base64");
}

async function uploadToImageKit(base64: string, prefix: string): Promise<string> {
  const result = await imagekit.upload({
    file: base64,
    fileName: `${prefix}-${Date.now()}.png`,
    folder: "/ai-generated",
    tags: ["ai-edit", prefix],
  });
  return result.url;
}

function getReplicateToken(): string {
  const token = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
  if (!token || !token.trim()) {
    throw new Error(
      "REPLICATE_API_TOKEN (or REPLICATE_API_KEY) is not set in .env. Get one at https://replicate.com/account/api-tokens"
    );
  }
  return token.trim();
}

/**
 * Remove background from image using Replicate rembg
 */
export async function removeBackground(imageUrl: string): Promise<ImageEditResult> {
  const token = getReplicateToken();

  const replicate = new Replicate({ auth: token });

  const raw = await replicate.run(REPLICATE_REMBG as `${string}/${string}:${string}`, {
    input: { image: imageUrl },
  });
  const outputUrl = typeof raw === "string" ? raw : (raw as { url?: () => string })?.url?.() ?? (raw as any)?.url;
  if (!outputUrl || typeof outputUrl !== "string") {
    throw new Error("No output from remove background");
  }

  const base64 = await downloadImageAsBase64(outputUrl);
  const url = await uploadToImageKit(base64, "nobg");

  return { success: true, url, action: "remove-bg" };
}

/**
 * Upscale image using Replicate Real-ESRGAN
 */
export async function upscaleImage(
  imageUrl: string,
  scale: number = 2
): Promise<ImageEditResult> {
  const token = getReplicateToken();

  const replicate = new Replicate({ auth: token });

  const raw = await replicate.run(
    REPLICATE_UPSCALE as `${string}/${string}:${string}`,
    {
      input: {
        image: imageUrl,
        scale: Math.min(4, Math.max(2, scale)),
        face_enhance: false,
      },
    }
  );
  const outputUrl = typeof raw === "string" ? raw : (raw as { url?: () => string })?.url?.() ?? (raw as any)?.url;
  if (!outputUrl || typeof outputUrl !== "string") {
    throw new Error("No output from upscale");
  }

  const base64 = await downloadImageAsBase64(outputUrl);
  const url = await uploadToImageKit(base64, "upscaled");

  return { success: true, url, action: "upscale" };
}

export async function editImage(
  imageUrl: string,
  action: ImageEditAction
): Promise<ImageEditResult> {
  if (action === "remove-bg") return removeBackground(imageUrl);
  if (action === "upscale") return upscaleImage(imageUrl);
  throw new Error(`Unknown action: ${action}`);
}
