# Development Setup Guide

## Quick setup that'll make your life easier

### Must-have VS Code extensions

Install these once and you're cruising:

- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **HTML CSS Support** (`ecmel.vscode-html-css`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier – Code formatter** (`esbenp.prettier-vscode`)
- **VS Code Live Server** (`ritwickdey.liveserver`) or use Vite dev server
- **Firebase Explorer** (`jsayol.firebase-explorer`) — optional, convenient
- **Vercel** (`vercel.vercel-vscode`) — optional, deploy/inspect without leaving the editor

> **Note**: The project includes a `.vscode/extensions.json` file that will automatically suggest these extensions when you open the workspace.

### Workspace Settings

The project includes preconfigured workspace settings (`.vscode/settings.json`) with:

- Format on save enabled
- Prettier as default formatter
- Consistent line endings (LF)
- ESLint validation for JavaScript and HTML
- Tailwind CSS IntelliSense enhancements

### Development Options

#### Option 1: Vite Development Server (Recommended)

```bash
# Install dependencies
npm install
# Start development server
npm run dev

The application will be available at `http://localhostI :5173`

#### Option 2: Live Server (Alternative)

1. Open your project folder in VS Code
2. Right-click `public/index.html` → "Open with Live Server"
3. This serves over HTTP and fixes module import issues

### VS Code Tasks

The project includes predefined tasks (`.vscode/tasks.json`):

- **Start Development Server** (`Ctrl+Shift+P` → "Tasks: Run Task" → "Start Development Server")
- **Build for Production**
- **Preview Production Build**

You can also use `Ctrl+Shift+B` to run the default build task (Start Development Server).

### Code Quality Tools

#### ESLint Configuration

- Modern ESLint flat config format (`eslint.config.js`)
- Configured for modern JavaScript (ES2021+) with module support
- Browser globals included (window, document, fetch, etc.)
- Firebase globals added

Run linting:
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues where possible
```

#### Prettier Configuration

- Consistent code formatting (`.prettierrc`)
- Single quotes, semicolons, 2-space indentation
- Line width of 100 characters

Run formatting:
```bash
npm run format      # Format all files in public/
```

### Environment Setup

1. Copy environment variables template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase and Gemini API credentials in the `.env` file

3. The development server will automatically load these variables

#### Required Environment Variables

**Firebase Configuration (Client-side - VITE_* prefix):**
- `VITE_FIREBASE_API_KEY` - Firebase project API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID

**API Keys (Server-side):**
- `GEMINI_API_KEY` - Google Gemini AI API key for chat functionality
- `GOOGLE_TRANSLATE_API_KEY` - Google Cloud Translation API key for click-to-translate feature
- `GOOGLE_CLOUD_TTS_API_KEY` - (Optional) Google Cloud Text-to-Speech API key for character voices (falls back to GEMINI_API_KEY if not set)

**Important:** For the Cloud Translation and Text-to-Speech APIs to work, ensure these APIs are enabled in your Google Cloud Console for the correct project.

### Build and Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel (if Vercel CLI is installed)
vercel
```

### API Endpoints and Serverless Functions

The application includes three serverless functions in the `api/` directory for Vercel deployment:

#### 1. `/api/gemini` - AI Chat Endpoint
- **File:** `api/gemini.js`
- **Method:** POST
- **Purpose:** Handles AI chat conversations with Gemini
- **Environment Variable:** `GEMINI_API_KEY`
- **Request Body:**
  ```json
  {
    "systemInstruction": "string (optional)",
    "contents": [{"role": "user", "parts": [{"text": "message"}]}]
  }
  ```

#### 2. `/api/translate` - Translation Endpoint
- **File:** `api/translate.js`
- **Method:** POST
- **Purpose:** Translates text using Google Cloud Translation API
- **Environment Variable:** `GOOGLE_TRANSLATE_API_KEY`
- **Request Body:**
  ```json
  {
    "text": "string",
    "sourceLang": "es",
    "targetLang": "en"
  }
  ```
- **Response:**
  ```json
  {
    "translatedText": "translated string"
  }
  ```
- **Used For:** Click-to-translate feature in quest conversations

#### 3. `/api/tts` - Text-to-Speech Endpoint
- **File:** `api/tts.js`
- **Method:** POST
- **Purpose:** Generates audio using Google Cloud Text-to-Speech API
- **Environment Variable:** `GOOGLE_CLOUD_TTS_API_KEY` or `GEMINI_API_KEY`
- **Request Body:**
  ```json
  {
    "text": "string",
    "characterName": "string (optional)",
    "characterGender": "male|female (optional)",
    "speedMultiplier": 1.0,
    "pitchAdjustment": 0
  }
  ```
- **Response:**
  ```json
  {
    "audioContent": "base64 encoded MP3",
    "voiceName": "es-US-Neural2-A"
  }
  ```
- **Used For:** Character voice generation in quest conversations

**Local Development:**
- The `dev-server.js` file provides local equivalents of these endpoints
- Run `node dev-server.js` to test all API endpoints locally

**Google Cloud APIs Required:**
- Cloud Translation API: https://console.cloud.google.com/apis/library/translate.googleapis.com
- Cloud Text-to-Speech API: https://console.cloud.google.com/apis/library/texttospeech.googleapis.com

### Troubleshooting

- **ESLint errors**: Most can be auto-fixed with `npm run lint:fix`
- **Formatting issues**: Run `npm run format` to auto-format code
- **Module import errors**: Use the Vite dev server instead of Live Server
- **Environment variables**: Check that `.env` file exists and contains required variables

### Nice-to-have Additions

- **Vercel CLI**: `npm i -g vercel` for terminal deployment
- **Dev Containers**: Future enhancement for consistent development environments
- **Additional ESLint rules**: Can be customized in `eslint.config.js`