# Vercel Environment Variables Setup

## Required Environment Variables

Your Vercel deployment requires the following environment variables to be configured. Without these, the AI chat and translation features will not work.

### 1. Firebase Configuration (Frontend)
These variables are used by the frontend to connect to Firebase for authentication and database:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Gemini AI API Key (Backend)
This variable is used by the `/api/gemini.js` serverless function:

```
GEMINI_API_KEY=your_google_gemini_api_key
```

**Important**: This key is kept secure on the server side and is never exposed to the client.

### 3. Google Translate API Key (Backend - Optional)
This variable is used by the `/api/translate.js` serverless function for the click-to-translate feature:

```
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
```

**Note**: The same Google API key can be used for both Gemini and Translate if you've enabled both APIs in your Google Cloud project. The translate API will fall back to using `GEMINI_API_KEY` if `GOOGLE_TRANSLATE_API_KEY` is not set.

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Enter the **Key** (e.g., `GEMINI_API_KEY`)
   - Enter the **Value** (your actual API key)
   - Select which environments to apply to: **Production**, **Preview**, and **Development**
5. Click **Save**
6. Redeploy your project for the changes to take effect

## Enabling Google APIs

### For Gemini AI:
1. Go to https://aistudio.google.com/
2. Create or select a project
3. Get your API key from the "Get API Key" button

### For Google Translate:
1. Go to https://console.cloud.google.com/
2. Enable the "Cloud Translation API"
3. Use the same API key or create a new one

## Verifying Setup

After configuring the environment variables and deploying:

1. Open your deployed app in the browser
2. Open the browser console (F12)
3. Look for debug logs when you try to chat:
   - `🔌 Calling /api/gemini...`
   - `📡 API Response status: 200` (success) or error details
   - `🇪🇸 Spanish-only system instruction prepared`

If you see error status codes:
- **500**: API key not configured or invalid
- **400**: Request format error
- **403**: API key doesn't have permission for the service

## Spanish-Only Dialogue

The app is configured to provide **Spanish-only dialogue** with these features:

1. **AI responses are ALWAYS in Spanish** regardless of user's proficiency level
2. **Level-based scaffolding**: The complexity of Spanish adjusts based on CEFR level (A1-C2)
3. **Click-to-translate**: Users can click any AI message to get instant English translation
   - Click without selection → translates entire message
   - Select text then click → translates only selection

Debug logs will show:
- `🌍 User level: A1, Getting AI response...`
- `🇪🇸 Spanish-only system instruction prepared`

This ensures immersive language learning while providing a safety net for comprehension.
