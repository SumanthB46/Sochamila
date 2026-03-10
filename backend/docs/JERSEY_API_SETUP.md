# Jersey Generator API Setup Guide

## ✅ Backend Setup for Jersey Image Generation

The Jersey Generator uses **OpenAI DALL-E 3** to generate high-quality jersey designs. Follow these steps to get it working.

### Step 1: Get Your OpenAI API Key

1. Go to: **https://platform.openai.com/api-keys**
2. Sign in with your OpenAI account (create one if needed)
3. Click **"Create new secret key"**
4. Copy the key (you won't see it again)

### Step 2: Add API Key to Backend

In the backend root folder, open or create a `.env` file:

```bash
# e:\sochamila\backend\.env
OPENAI_API_KEY=sk-proj-your-key-here-replace-this
```

Replace `sk-proj-your-key-here-replace-this` with your actual API key.

### Step 3: Install Dependencies

Make sure the OpenAI package is installed in the backend:

```bash
cd backend
npm install openai
```

(It should already be in `package.json`, but install to be safe)

### Step 4: Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Backend running on http://localhost:5000
```

### Step 5: Test the Endpoint

The Jersey Generator API is now available at:

```
POST http://localhost:5000/api/jersey/generate
```

**Request body example:**

```json
{
  "prompt": "Primary color: Royal blue\nSecondary color: White and gold accents\n\nJersey style: Modern and aggressive\nSleeves: White geometric patterns\nCollar: V-neck\nFabric: Matte mesh\n\nFront: Club logo on left chest, sponsor text in center\nBack: Player name \"SUMANTH\", number \"10\" in bold modern font\n\nExtra: Gold side panels\n\nLogo: Uploaded (logo.png)\n\nCustom Instructions: None",
  "customInstructions": "Remove background, add metallic sheen"
}
```

**Response:**

```json
{
  "success": true,
  "images": [
    "https://ik.imagekit.io/...front.png",
    "https://ik.imagekit.io/...back.png"
  ],
  "prompt": "...",
  "model": "dall-e-3"
}
```

---

## 🛠️ Backend Files Created

### 1. **Jersey Generation Service**
- **File:** `backend/src/modules/jersey/jersey.generate.service.ts`
- **Purpose:** Handles OpenAI API calls and ImageKit uploads
- **Features:**
  - Generates 2 images (front and back view)
  - Supports custom instructions
  - Uploads images to ImageKit
  - Error handling for rate limits and API key issues

### 2. **Jersey Controller**
- **File:** `backend/src/modules/jersey/jersey.generate.controller.ts`
- **Purpose:** Validates requests and returns responses
- **Features:**
  - Input validation (prompt length, custom instructions)
  - Proper error messages
  - Rate limit handling (429 responses)

### 3. **Jersey Routes**
- **File:** `backend/src/modules/jersey/jersey.routes.ts`
- **Purpose:** Defines the API endpoints
- **Endpoints:**
  - `POST /api/jersey/generate` - Generate jersey images

---

## 📝 Frontend Integration

The frontend is automatically configured to call the correct endpoint:

```typescript
// Frontend calls this endpoint
fetch("/api/jersey/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    prompt: designSpecs,
    customInstructions: userInstructions
  })
});
```

---

## 🔧 Environment Variables

### Backend `.env` file

```env
# OpenAI API Key (Required)
OPENAI_API_KEY=sk-proj-your-key-here

# Other existing variables...
DATABASE_URL=...
JWT_SECRET=...
```

---

## 💰 OpenAI DALL-E 3 Pricing

- **Cost:** $0.080 per image (as of Feb 2026)
- **Size:** 1024×1024 pixels
- **Quality:** Standard
- **Model:** dall-e-3 (highest quality)

### Free Trial
- OpenAI provides $5 free credits for new accounts
- This allows ~62 jersey generations (31 pairs)

---

## ❌ Troubleshooting

### Error: "OPENAI_API_KEY is not configured"
- ✅ Add `OPENAI_API_KEY=sk-proj-...` to `.env`
- ✅ Restart the backend server (`npm run dev`)

### Error: "Invalid OpenAI API key"
- ✅ Verify your API key is correct at https://platform.openai.com/api-keys
- ✅ Make sure there are no extra spaces in the `.env` file
- ✅ Restart the backend

### Error: "Rate limit exceeded"
- ✅ Wait 1-2 minutes and try again
- ✅ Check your usage at https://platform.openai.com/account/usage/overview
- ✅ Upgrade your OpenAI account if needed

### Error: "Failed to save generated images"
- ✅ Check if ImageKit is configured in the backend
- ✅ Verify ImageKit API credentials in `.env`

---

## 🚀 Next Steps

1. ✅ Add `OPENAI_API_KEY` to backend `.env`
2. ✅ Restart backend: `npm run dev`
3. ✅ Test the endpoint with curl or Postman
4. ✅ Use the Jersey Generator frontend to create designs!

---

## 📚 API Reference

### POST /api/jersey/generate

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Complete design specifications (min 10, max 2000 chars) |
| `customInstructions` | string | No | Additional AI instructions (max 500 chars) |

**Response Success (200):**

```json
{
  "success": true,
  "images": ["url1", "url2"],
  "prompt": "...",
  "model": "dall-e-3"
}
```

**Response Errors:**

- **400:** Bad request (invalid prompt)
- **401:** Invalid API key
- **429:** Rate limit exceeded
- **500:** Server error

---

## 📞 Support

For issues:
1. Check the `.env` file has `OPENAI_API_KEY`
2. Verify the API key at https://platform.openai.com/api-keys
3. Check backend logs in terminal
4. Ensure backend is running (`npm run dev`)
