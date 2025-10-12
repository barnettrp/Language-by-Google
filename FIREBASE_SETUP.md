# Firebase Setup Guide for ConvoQuest

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name (e.g., "ConvoQuest" or "Language-by-Google")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

## Step 2: Register Your Web App

1. In your Firebase project, click the **web icon (</>) ** to add a web app
2. Register app nickname (e.g., "ConvoQuest Web App")
3. **Don't** check "Set up Firebase Hosting" (we're using Vercel)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object shown on screen

## Step 3: Get Your Configuration Values

From the Firebase Console configuration screen, you'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Step 4: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click **"Get started"**
3. Under **Sign-in method** tab, click **"Email/Password"**
4. **Enable** the first toggle (Email/Password)
5. Click **"Save"**

## Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
   - For production, you'll want to set up proper security rules
4. Select a Cloud Firestore location (choose closest to your users)
5. Click **"Enable"**

### Security Rules (Important for Production)

Once you're ready for production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 6: Update Your .env File

Open `.env` in your project root and replace the placeholder values:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## Step 7: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Create API key"**
3. Select your Google Cloud project (or create a new one)
4. Copy the API key
5. Add it to your `.env` file:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

## Step 8: Restart the Development Server

After updating `.env`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Step 9: Test the App

1. Open http://localhost:5173/
2. Try creating a new account
3. Complete the placement test
4. Start a quest and chat with the AI

## Troubleshooting

### Firebase Error: "Firebase: Error (auth/...)"
- Check that Email/Password authentication is enabled
- Verify your API key and project ID are correct

### Gemini API Error
- Ensure you have billing enabled on your Google Cloud project
- Check that the API key is valid and has Generative Language API enabled

### Environment Variables Not Working
- Make sure your `.env` file is in the root directory
- Restart the dev server after making changes
- Verify variable names start with `VITE_` (for client-side access)

## For Vercel Deployment

Add the same environment variables to your Vercel project:

1. Go to your Vercel project dashboard
2. Settings > Environment Variables
3. Add all `VITE_*` variables and `GEMINI_API_KEY`
4. Redeploy
