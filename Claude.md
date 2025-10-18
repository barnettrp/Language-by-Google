# Chat AI Server Troubleshooting - Progress Log

## Date: 2025-10-14

### Problem Identified
The chat functionality was not calling the AI server. Root cause: When running `npm run dev` (which uses Vite), the `/api/gemini` serverless function endpoint doesn't exist. Vite only serves static files and doesn't handle Vercel serverless functions.

### Solution Approach
Created a custom Node.js development server (`dev-server.js`) that handles both:
1. Static file serving from the `public/` directory
2. The `/api/gemini` endpoint for AI chat functionality

### Progress So Far

✅ **Completed:**
1. Checked `.env` file - GEMINI_API_KEY is properly set
2. Identified the issue: Vite dev server doesn't handle the `/api/gemini` endpoint
3. Attempted to use Vercel CLI but it requires authentication
4. Attempted to configure Vite proxy but ran into Node.js version issues (Node 18 vs Vite 7 requirement of Node 20+)
5. Created `dev-server.js` - a standalone Node.js server that handles both static files and API requests
6. Updated `package.json` scripts to use `node dev-server.js` for the dev command

🔄 **In Progress:**
- Adding `dotenv` dependency to package.json (got interrupted)
- Need to install dependencies and start the server

### Next Steps
1. Add `dotenv` to dependencies in package.json
2. Run `npm install` to install dotenv
3. Start the development server with `npm run dev`
4. Test the `/api/gemini` endpoint manually
5. Verify chat is working in the browser

### Files Modified
- `vite.config.js` - Added proxy configuration (though we ended up not using this approach)
- `dev-server.js` - **NEW FILE** - Custom development server
- `package.json` - Changed `dev` script to use `node dev-server.js`

### Technical Details

**The dev-server.js does:**
- Loads environment variables from `.env` using dotenv
- Serves static files from `public/` directory
- Handles POST requests to `/api/gemini`
- Proxies requests to Google's Gemini API
- Includes proper CORS headers
- Works with Node.js 18.20.8 (current version in devcontainer)

**API Flow:**
```
Frontend (app.js) → POST /api/gemini → dev-server.js → Google Gemini API
```

### Environment Info
- Node.js: v18.20.8
- npm: 10.8.2
- Vite version installed: 7.1.6 (incompatible with Node 18, causes issues)
- GEMINI_API_KEY: ✓ Set in .env

### ✅ RESOLVED - API is Working!

**Solution:**
- Changed model from `gemini-pro` to `gemini-2.0-flash`
- Used v1 API instead of v1beta
- API endpoint `/api/gemini` is now working correctly
- Successfully tested with curl - received proper response from Gemini

**Test Result:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{"text": "Hi there! How can I help you today?\n"}],
      "role": "model"
    },
    "finishReason": "STOP"
  }],
  "modelVersion": "gemini-2.0-flash"
}
```

### Current Status
Server is running at `http://localhost:5173/`
Ready to test chat functionality in the browser!

### Key Code Locations
- Chat functionality: `public/app.js` lines 292-333 (AIManager)
- Send message function: `public/app.js` lines 540-564 (sendChatMessage)
- API handler: `api/gemini.js` (Vercel serverless function for production)
- Development API handler: `dev-server.js` (NEW - for local development)

---

## Date: 2025-10-18

### New Issue: Authentication Not Working

**Problem:**
- User sees "Signing In..." message but returns to login screen without page flip
- Running on Vite dev server (port 3000) instead of custom dev-server
- Need to troubleshoot Firebase authentication flow

**Troubleshooting Steps Taken:**
1. ✅ Added debug logging to `handleLogin()` function (app.js:372-409)
2. ✅ Added debug logging to `onAuthStateChanged` listener (app.js:706-741)
3. ✅ Created on-page debug console display in both login and signup views
4. ✅ Added console log interceptors to show [ConvoQuest] logs on page
5. ✅ Added Firebase configuration status logging

**Debug Features Added:**
- Debug console areas in index.html (lines 120-123 and 163-166)
- Console override in app.js (lines 12-75) to capture and display logs
- Firebase status logging function (app.js:77-84)

**Server Configuration:**
- Currently running: Vite dev server on port 3000
- Issue: Vite proxy config may not be working correctly for /api/gemini
- Alternative: Custom dev-server.js handles both static files and API (port 5173)

**Next Steps:**
- Test with debug console visible on page
- Check if Firebase auth is properly initialized
- Verify API endpoint is accessible
- May need to switch back to custom dev-server.js if Vite proxy isn't working
