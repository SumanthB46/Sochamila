# How to get your Gemini (Nano Banana) API key

The product editor uses **Google Gemini Nano Banana** (`gemini-2.5-flash-image`) for AI image generation. You need a Gemini API key.

**First time:** From the project root, run `npm install` in the backend folder so the `@google/genai` dependency is installed:

```bash
cd backend
npm install
```

## Steps

1. **Open Google AI Studio**
   - Go to: **https://aistudio.google.com/apikey**

2. **Sign in**
   - Use your Google account.

3. **Create an API key**
   - Click **“Create API key”**.
   - Choose an existing Google Cloud project or create a new one (no billing required for the free tier).
   - Copy the generated key.

4. **Add it to your backend**
   - In the backend folder, open `.env`.
   - Add or update:
     ```env
     GEMINI_API_KEY=your_api_key_here
     ```
   - Replace `your_api_key_here` with the key you copied.
   - Save the file and restart the backend server.

## Important: Enable Image Generation

**Image generation requires billing to be enabled** on your Google Cloud project, even if you stay within free tier limits.

After creating your API key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **Billing** → **Link a billing account**
4. Add a payment method (you won't be charged unless you exceed free tier)
5. **Enable Vertex AI API:**
   - Go to **APIs & Services** → **Library**
   - Search for **"Vertex AI API"**
   - Click **Enable** (this is REQUIRED for image generation)
6. **Wait 5-10 minutes** for changes to propagate

**Free tier limits:** 500 image generations per day (even with billing enabled, you get 500 free per day).

If you see "limit: 0" errors, see `GEMINI_QUOTA_FIX.md` for troubleshooting.

## Notes

- **Image generation:** The editor uses the `gemini-2.5-flash-image` model (Nano Banana) for text-to-image.
- Keep your API key secret and do not commit it to git (`.env` should be in `.gitignore`).
