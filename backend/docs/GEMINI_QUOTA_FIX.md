# Fix: "Quota exceeded limit: 0" for Gemini Image Generation

If you see an error like:
```
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0
```

This means **image generation is not enabled** for your Google Cloud project's free tier.

## Solutions

### Option 1: Enable Billing (Recommended for Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one)
3. Go to **Billing** → **Link a billing account**
4. Add a payment method (you'll only be charged if you exceed free tier limits)
5. Wait a few minutes, then try generating images again

**Note:** The free tier still applies even with billing enabled. You get 500 free image generations per day.

### Option 2: Enable Vertex AI API (REQUIRED for Image Generation)

**Important:** Image generation requires **Vertex AI API** to be enabled, not just Generative Language API.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Search for **"Vertex AI API"**
4. Click **Enable** (this is separate from Generative Language API)
5. Wait 2-3 minutes for the API to fully enable
6. Also ensure **"Generative Language API"** is enabled

**Note:** Even with billing enabled, you must explicitly enable Vertex AI API for image generation to work.

### Option 3: Use a Different Model (If Available)

Some regions/projects may have different model availability. Try updating the model name in `backend/src/modules/ai/ai.generate.service.ts`:

- `gemini-2.0-flash-exp-image-generation` (experimental)
- `imagen-3-fast-generate-001` (if Imagen is enabled)

### Option 4: Check Project Region

Image generation models may not be available in all regions. Ensure your Google Cloud project is in a supported region (US, EU, etc.).

## Verify Your Setup

1. **Check API Key:** Ensure `GEMINI_API_KEY` in `.env` is correct
2. **Check Billing:** Verify billing is enabled in Google Cloud Console
3. **Check APIs Enabled:**
   - ✅ **Vertex AI API** (REQUIRED for image generation)
   - ✅ **Generative Language API**
4. **Wait for Propagation:** After enabling APIs/billing, wait 3-5 minutes
5. **Check Limits:** Visit https://ai.dev/rate-limit to see your current usage

## Common Issue: "limit: 0" After Enabling Billing

If you still see "limit: 0" after enabling billing:
- **Wait 5-10 minutes** - API changes can take time to propagate
- **Verify Vertex AI API is enabled** (not just Generative Language API)
- **Check your project region** - Some models may not be available in all regions
- **Try creating a new API key** after enabling Vertex AI API

## Still Having Issues?

- Check the official docs: https://ai.google.dev/gemini-api/docs/image-generation
- Verify your project settings: https://console.cloud.google.com/apis/dashboard
- Check rate limits: https://ai.google.dev/gemini-api/docs/rate-limits
