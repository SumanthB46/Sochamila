# 🎯 Quick Setup Checklist for Jersey Generator API

## ⚡ 5-Minute Setup

Follow these steps to get the Jersey Generator working with OpenAI:

### ✅ Step 1: Get OpenAI API Key (2 min)

```
1. Go to: https://platform.openai.com/api-keys
2. Sign in with your OpenAI account
3. Click "Create new secret key"
4. Copy the key (format: sk-proj-...)
```

### ✅ Step 2: Add API Key to Backend (1 min)

**File:** `backend/.env`

```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

**Make sure:**
- No spaces before/after the `=`
- No quotes around the key
- File is saved

### ✅ Step 3: Restart Backend (1 min)

```bash
# Stop the current backend (Ctrl+C if running)
# Then:
cd backend
npm run dev
```

Watch for this message:
```
🚀 Backend running on http://localhost:5000
```

### ✅ Step 4: Test in Browser (1 min)

1. Open Jersey Generator: `http://localhost:3000/JeseyGen`
2. Fill in the form
3. Click "Convert to Text"
4. Click "Generate Images"
5. Wait for images to generate...

---

## 🔗 Backend Files Structure

```
backend/
├── src/
│   ├── modules/
│   │   └── jersey/                       ← NEW
│   │       ├── jersey.generate.service.ts
│   │       ├── jersey.generate.controller.ts
│   │       └── jersey.routes.ts
│   └── routes/
│       └── index.ts                      (updated)
├── .env                                  ← UPDATE THIS
└── docs/
    └── JERSEY_API_SETUP.md              (full guide)
```

---

## ✨ What Was Added

### Backend Files (3 new):
1. **jersey.generate.service.ts** - Calls OpenAI DALL-E 3 API
2. **jersey.generate.controller.ts** - Validates requests
3. **jersey.routes.ts** - API endpoints

### Updated Files (2):
1. **routes/index.ts** - Registers jersey routes
2. **frontend/app/JeseyGen/page.tsx** - Calls correct endpoint

---

## 🧪 Quick Test with cURL

```bash
curl -X POST http://localhost:5000/api/jersey/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Design a modern blue and white football jersey with player number 10 on the back",
    "customInstructions": "Make it aggressive and dynamic"
  }'
```

Expected response:
```json
{
  "success": true,
  "images": ["url_to_image_1", "url_to_image_2"],
  "model": "dall-e-3"
}
```

---

## ❓ Common Issues

### ❌ "Cannot find module 'jersey/jersey.routes'"
- Make sure all 3 jersey files are created in `backend/src/modules/jersey/`
- Restart backend: `npm run dev`

### ❌ "OPENAI_API_KEY is not configured"
- Add the key to `backend/.env`
- Restart backend
- Verify no spaces: `OPENAI_API_KEY=sk-proj-...` (exact format)

### ❌ "Invalid OpenAI API key"
- Go to https://platform.openai.com/api-keys
- Get a new key
- Update `.env` and restart

### ❌ "Rate limit exceeded"
- OpenAI has rate limits (~32000 tokens/min)
- Wait 1-2 minutes
- Try again

---

## 📊 API Endpoint

```
POST /api/jersey/generate

Request:
{
  "prompt": "Design specifications...",
  "customInstructions": "Optional user instructions..."
}

Response:
{
  "success": true,
  "images": ["url1", "url2"],
  "model": "dall-e-3"
}
```

---

## 💡 Pro Tips

1. **Better Prompts = Better Images**
   - Be specific about colors, style, placement
   - Example: "Royal blue jersey with white stripes on sleeves, bold number 10 on back"

2. **Custom Instructions Enhance Results**
   - "Remove background"
   - "Add metallic sheen"
   - "Make more aggressive looking"

3. **Monitor Costs**
   - Each jersey generation = 2 images
   - Cost: $0.16 per jersey (2 × $0.08)
   - Track at: https://platform.openai.com/account/usage

4. **Save Your API Key**
   - Don't share it publicly
   - Regenerate if accidentally exposed
   - Use environment variables, never commit to git

---

## 🎉 Done!

Your Jersey Generator should now be fully functional with OpenAI DALL-E 3!

**Next steps:**
1. ✅ Generate some awesome jersey designs
2. ✅ Get feedback from users
3. ✅ Iterate on prompts for better results

---

## 📞 Need Help?

1. Check `.env` file has the API key
2. Check backend is running (`npm run dev`)
3. Check frontend is calling correct endpoint (`/api/jersey/generate`)
4. View backend console logs for error messages
5. Visit https://platform.openai.com/account/usage to check API status
