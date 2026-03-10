import api from "../axios";

/* ======================================================
   AI IMAGE GENERATION API
====================================================== */

interface GenerateImageRequest {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  model?: "flux" | "sdxl";
}

interface GenerateImageResponse {
  success: boolean;
  url: string;
  prompt: string;
  model: string;
  error?: string;
}

/**
 * Generate an AI image from a text prompt`
 * Calls backend which uses Replicate FLUX.1 model
 */
export async function generateAIImage(
  options: GenerateImageRequest
): Promise<GenerateImageResponse> {
  // Validate prompt before sending
  const { prompt } = options;
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt is required");
  }
  if (prompt.trim().length < 3) {
    throw new Error("Prompt must be at least 3 characters");
  }
  if (prompt.length > 1000) {
    throw new Error("Prompt must be less than 1000 characters");
  }

  try {
    const response = await api.post<GenerateImageResponse>(
      "/ai/generate",
      { prompt: prompt.trim(), model: options.model }
    );
    return response.data;
  } catch (error: any) {
    // Extract error message from response
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

/**
 * Generate image with default options (1:1, FLUX)
 */
export async function generateImage(prompt: string): Promise<string> {
  const result = await generateAIImage({ prompt });

  if (!result.success) {
    throw new Error(result.error || "Failed to generate image");
  }

  return result.url;
}

/* ======================================================
   IMAGE EDIT (Remove background, Upscale)
====================================================== */

export type ImageEditAction = "remove-bg" | "upscale";

export interface ImageEditResponse {
  success: boolean;
  url: string;
  action: ImageEditAction;
  error?: string;
}

/**
 * Edit an image (remove background or upscale).
 * Returns the new image URL to use on the layer — mockup updates when you set layer src to this.
 */
export async function editImage(
  imageUrl: string,
  action: ImageEditAction
): Promise<string> {
  if (!imageUrl?.trim()) throw new Error("Image URL is required");
  const response = await api.post<ImageEditResponse>("/ai/image-edit", {
    imageUrl: imageUrl.trim(),
    action,
  });
  const data = response.data;
  if (!data?.success || !data?.url) {
    throw new Error(data?.error || "Image edit failed");
  }
  return data.url;
}
