# Troubleshooting: Gemini Image Generation "limit: 0" Error

If you're seeing `limit: 0` errors even after enabling billing, follow these steps:

## Step-by-Step Fix

### 1. Verify Billing is Enabled ✅
- Go to: https://console.cloud.google.com/billing
- Ensure your project has a billing account linked
- Status should show "Active"

### 2. Enable Vertex AI API (CRITICAL) ✅
**This is often the missing step!**

1. Go to: https://console.cloud.google.com/apis/library
2. Search for: **"Vertex AI API"**
3. Click **Enable**
4. Wait 2-3 minutes

**Note:** "Generative Language API" is NOT the same as "Vertex AI API". You need BOTH enabled.

### 3. Verify Both APIs Are Enabled
Check these APIs are enabled:
- ✅ Vertex AI API
- ✅ Generative Language API

Go to: https://console.cloud.google.com/apis/dashboard

### 4. Wait for Propagation
After enabling APIs/billing:
- **Wait 5-10 minutes** for changes to propagate
- API quota limits can take time to update

### 5. Create a New API Key (If Needed)
If your API key was created BEFORE enabling Vertex AI API:
1. Go to: https://aistudio.google.com/apikey
2. Create a new API key
3. Update `GEMINI_API_KEY` in your `.env` file
4. Restart your backend server

### 6. Check Your Project Region
Some models may not be available in all regions:
- US regions typically have best availability
- Check: https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models#available-regions

## Still Not Working?

### Check API Status
Visit: https://status.cloud.google.com/
- Check if Vertex AI is experiencing issues

### Verify Model Name
The error shows `gemini-2.5-flash-preview-image` but we use `gemini-2.5-flash-image`. If the API redirects to preview, it might indicate:
- The GA model isn't available in your region yet
- Your project needs additional permissions

### Alternative: Use Imagen API
If Gemini image generation still doesn't work, you could switch to Imagen (also on Vertex AI):
- Model: `imagen-3-fast-generate-001`
- Requires same setup (billing + Vertex AI API)

### Contact Support
If nothing works:
- Google Cloud Support: https://cloud.google.com/support
- Gemini API Docs: https://ai.google.dev/gemini-api/docs/image-generation
