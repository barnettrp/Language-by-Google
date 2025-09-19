# Language by Google - ConvoQuest

A language learning application with conversation-based quests powered by Firebase and Google's Gemini AI.

## Features

- **Firebase Authentication**: Secure user registration and login
- **Interactive Placement Test**: AI-powered assessment to determine user's Spanish level
- **Conversation-based Quests**: Learn Spanish through engaging storylines
- **Grammar Correction**: AI-powered sentence analysis and correction
- **Real-time Chat**: Interactive conversations with AI tutors
- **User Settings**: Customizable dialect and formality preferences

## Setup and Configuration

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Google Gemini API key

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
   
   GEMINI_API_KEY=your-gemini-api-key
   ```

#### For Production Deployment (Vercel)

Set the following environment variables in your Vercel project settings:

**Client-side (VITE_ prefixed):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Server-side (for API functions):**
- `GEMINI_API_KEY`

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
# Then edit .env with your actual Firebase and Gemini API keys
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This creates a `dist/` folder with the built application ready for deployment.

### Deployment to Vercel

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all the variables listed above
3. **Deploy**: Vercel will automatically build and deploy your app

The `vercel.json` configuration file handles:
- Static site building with Vite
- Serverless function routing for the Gemini API
- SPA routing for client-side navigation
- CORS headers for API endpoints

## Project Structure

```
├── api/
│   └── gemini.js          # Serverless function for Gemini API proxy
├── public/
│   ├── index.html         # Main HTML file
│   ├── app.js            # Main application logic
│   └── firebase.js       # Firebase configuration and initialization
├── dist/                  # Built files (generated)
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite build configuration
├── vercel.json           # Vercel deployment configuration
└── .env.example          # Environment variables template
```

## Architecture

### Frontend
- **Vite**: Build tool and development server
- **Firebase SDK**: Authentication and Firestore database
- **Tailwind CSS**: Styling framework
- **Vanilla JavaScript**: No framework dependencies for simplicity

### Backend
- **Vercel Serverless Functions**: API proxy for Gemini AI
- **Firebase**: User authentication and data storage
- **Google Gemini AI**: Language processing and conversation

### Security
- Environment variables for sensitive configuration
- Server-side API proxy to hide Gemini API key
- Firebase security rules (configure in Firebase console)
- CORS headers properly configured

## Error Handling

### Firebase Configuration Errors

The app provides comprehensive error handling for Firebase configuration issues:

**Enhanced Error Messages:**
- Specific identification of missing environment variables
- Clear instructions for both development and production setup
- Visual configuration status with ✅/❌ indicators
- Direct links to Firebase Console and documentation

**Configuration Debug Page:**
- Visit `/debug-config.html` for detailed configuration diagnostics
- Real-time status of all Firebase environment variables
- Environment information and troubleshooting guidance
- Auto-refresh every 30 seconds to monitor configuration changes

**Error Display Examples:**
- Missing variables: Shows exactly which `VITE_FIREBASE_*` variables are not set
- Invalid configuration: Displays specific Firebase initialization errors
- Network issues: Provides guidance for connectivity problems

If Firebase is not configured correctly, the app will display a detailed error page instead of the generic message, providing:
- Specific missing environment variables
- Step-by-step setup instructions
- Links to relevant documentation
- A retry button once configuration is fixed

## Security Notes

- Never commit your `.env` file to version control
- Set environment variables securely in your deployment platform
- Firebase configuration values are not secret but should be environment-specific
- The Gemini API key is kept server-side only and never exposed to the client

## Development Workflow

1. **Start development server**: `npm run dev`
2. **Make changes** to files in `public/`
3. **Test locally** with your Firebase project
4. **Build for production**: `npm run build`
5. **Deploy to Vercel** (automatically on git push)

## Troubleshooting

### Firebase Configuration Errors

If you see "Critical Error: App could not load. Firebase is not configured correctly", follow these steps:

#### Quick Diagnosis
1. **Visit the debug page**: Navigate to `/debug-config.html` in your browser
2. **Check configuration status**: The page shows exactly which variables are missing
3. **Follow the specific instructions** provided on the error page

#### Common Issues and Solutions

**Missing Environment Variables:**
- Copy `.env.example` to `.env` for local development
- Fill in all `VITE_FIREBASE_*` variables with your actual Firebase credentials
- For production: Set environment variables in your Vercel dashboard under Settings → Environment Variables

**Invalid Firebase Configuration:**
- Verify your Firebase project exists and is active
- Ensure Firebase Authentication and Firestore are enabled in the Firebase Console
- Double-check that your credentials match exactly (no extra spaces or characters)

**Firebase Project Setup:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable Authentication (Email/Password provider)
4. Create a Firestore database
5. Get your web app config from Project Settings → General → Your apps

#### Development vs Production

**Local Development:**
- Environment variables go in `.env` file (never commit this file!)
- Use `npm run dev` to start development server
- Visit `http://localhost:5173/debug-config.html` to verify configuration

**Production (Vercel):**
- Set all `VITE_FIREBASE_*` variables in Vercel dashboard
- Set `GEMINI_API_KEY` as well (server-side only)
- Redeploy after changing environment variables

### API Errors
- Verify GEMINI_API_KEY is set in Vercel environment variables
- Check Vercel function logs for detailed error messages
- Ensure API quotas are not exceeded

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 18 or higher
- Verify all environment variables are properly formatted

### Still Having Issues?

1. **Check the debug page** at `/debug-config.html` for detailed configuration status
2. **Review browser console** for specific error messages
3. **Verify Firebase project setup** in the Firebase Console
4. **Test with a fresh `.env` file** copied from `.env.example`