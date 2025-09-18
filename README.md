# ConvoQuest - Language Learning Game

A language learning application built with Vite, Firebase, and Google's Gemini AI.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Google Gemini API key

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Language-by-Google
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your actual Firebase configuration values:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Firebase Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Get your Firebase configuration from Project Settings

5. **Gemini API Setup**
   - Get a Gemini API key from Google AI Studio
   - This will be configured in your deployment environment

### Development Commands

```bash
# Verify your setup
npm run setup-check

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clean build artifacts
npm run clean
```

### Deployment (Vercel)

1. **Environment Variables**
   
   Set these environment variables in your Vercel project:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `GEMINI_API_KEY` (for the serverless function)

2. **Deploy**
   ```bash
   # Connect to Vercel and deploy
   vercel
   ```

### Project Structure

```
├── api/
│   └── gemini.js          # Vercel serverless function for Gemini API
├── public/
│   └── index.html         # Main application file
├── dist/                  # Build output (generated)
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel deployment configuration
└── vite.config.js        # Vite build configuration
```

### Features

- **Authentication**: Firebase Auth with email/password
- **Language Learning**: Interactive conversations with AI
- **Quest System**: Gamified learning experience
- **Placement Testing**: Adaptive difficulty assessment
- **Real-time Chat**: AI-powered language correction and guidance

### Troubleshooting

#### Build Issues
- Ensure you're using Node.js v16 or higher
- Delete `node_modules` and `package-lock.json`, then run `npm install`

#### Firebase Connection Issues
- Verify all Firebase environment variables are correctly set
- Check Firebase project configuration and rules
- Ensure Firebase services (Auth, Firestore) are enabled

#### API Issues
- Verify `GEMINI_API_KEY` is set in your deployment environment
- Check API usage limits and quotas

### Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and rotate them regularly
- Firebase rules should be properly configured for production use