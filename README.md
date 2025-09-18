# Language by Google - ConvoQuest

A language learning application with conversation-based quests powered by Firebase and Google's Gemini AI.

## Setup and Configuration

### Firebase Configuration

This application requires Firebase configuration to be set via environment variables. The configuration supports both local development and deployment environments.

#### For Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase project credentials in the `.env` file:
   ```
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:your-app-id
   ```

#### For Production Deployment (Vercel)

Set the environment variables in your Vercel project settings:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Development

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

## Error Handling

If Firebase is not configured correctly, the app will display:
> Critical Error: App could not load. Firebase is not configured correctly.

This error appears when:
- Environment variables are not set
- Firebase configuration values are invalid
- Firebase modules fail to load

## Security Notes

- Never commit your `.env` file to version control
- Set environment variables securely in your deployment platform
- Firebase configuration values are not secret but should be environment-specific