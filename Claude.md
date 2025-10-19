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

---

## Date: 2025-10-19

### Issue: Vercel Deployment - Firebase Not Configured

**Problem:**
- App loading on Vercel showed error: "Critical Error: App could not load. Firebase is not configured correctly."
- Local development worked fine with `.env` file
- Vercel deployments were missing Firebase environment variables

**Root Cause:**
- Vite embeds `VITE_*` prefixed environment variables into JavaScript bundle at **build time**
- Vercel builds the app in the cloud without access to local `.env` file
- Environment variables must be set in Vercel dashboard for production builds

**Solution - Vercel CLI Authentication:**

In remote/containerized environments (like devcontainers), the interactive `vercel login` doesn't persist credentials properly. Use token-based authentication instead:

1. **Create an access token:**
   - Go to https://vercel.com/account/tokens
   - Click "Create Token"
   - Give it a name (e.g., "CLI Access")
   - Copy the token

2. **Use token with CLI commands:**
   ```bash
   # Check authentication
   vercel whoami --token YOUR_TOKEN

   # Link project
   vercel link --yes --token YOUR_TOKEN

   # List environment variables
   vercel env ls --token YOUR_TOKEN

   # Add environment variable
   echo "VALUE" | vercel env add VAR_NAME production --token YOUR_TOKEN

   # Deploy
   vercel --prod --token YOUR_TOKEN --yes
   ```

3. **For persistent use, export the token:**
   ```bash
   export VERCEL_TOKEN=YOUR_TOKEN
   vercel deploy --prod --yes
   ```

**Vercel Configuration Fix:**

Updated `vercel.json` to use modern configuration format:

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

**Key Changes:**
- Removed legacy `routes` syntax (conflicts with `headers`)
- Removed `functions.runtime` specification (Vercel auto-detects)
- Use `rewrites` for SPA routing

**Environment Variables Required in Vercel:**
All variables must be set in Vercel Dashboard → Settings → Environment Variables for Production, Preview, and Development:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `GEMINI_API_KEY` (server-side only)

**Result:**
✅ Successfully deployed to production
✅ Firebase configuration now working on Vercel
✅ App loads correctly at production URL

**Production URL:** https://language-by-google-c5xr3cwyn-richard-barnetts-projects.vercel.app

---

### Issue: Users Stuck in Placement Test

**Problem:**
- After login, users were redirected to placement test with no way to complete it
- Placement test had quiz and chat views but no "Complete" button
- Users couldn't access main app with quests

**Root Cause:**
- Placement test flow was incomplete - missing completion mechanism
- No button or handler to mark placement test as complete
- Users were trapped in placement view indefinitely

**Solution:**

1. **Added "Complete Placement Test" button** to placement chat view (index.html:224-226)
2. **Implemented completion handler** that:
   - Saves `placementCompleted: true` to Firestore user document
   - Also saves to localStorage as backup
   - Transitions user to main app view
3. **Added necessary imports** (`updateDoc` from firebase/firestore)
4. **Added DOM reference** and event listener for the new button

**Files Modified:**
- `public/index.html` - Added complete button with green styling
- `public/app.js` - Added handler, imports, DOM reference, and event listener

**Code Changes:**
```javascript
// New handler function (app.js:748-771)
async function handleCompletePlacement() {
  console.log('[ConvoQuest] Completing placement test...');

  try {
    // Save to Firestore if available
    if (currentUser && db) {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        placementCompleted: true,
      });
    }

    // Also save to localStorage as backup
    localStorage.setItem('placementCompleted', 'true');

    // Show main app view
    showView('main-app-view');
  } catch (error) {
    console.error('[ConvoQuest] Error completing placement test:', error);
    alert('Error saving placement test completion. Please try again.');
  }
}
```

**Result:**
✅ Users can now complete placement test and access main app
✅ Placement completion saved to both Firestore and localStorage
✅ Deployed to production

**Latest Production URL:** https://language-by-google-n3x6wixum-richard-barnetts-projects.vercel.app

---

## Date: 2025-10-19 (Later)

### Restoration: CEFR Adaptive Placement Test

**Problem:**
- On October 19, commit `4ae3e88` accidentally replaced the sophisticated CEFR adaptive placement test with a simplified 3-question quiz + chat system
- The original test had 180 questions (30 per CEFR level), Wilson score confidence intervals, and adaptive level adjustment
- Users lost access to the statistically-rigorous placement testing

**Root Cause Analysis:**
- Timeline of placement test:
  - **Oct 12, 2025** (`cf36ca8`): Full CEFR adaptive test created with 180-question bank and confidence interval algorithm
  - **Oct 14, 2025** (`cd74c3a`): Test still intact with all features working
  - **Oct 19, 2025** (`4ae3e88`): Entire system accidentally replaced while trying to add a "Complete" button

**The Divergence:**
- What should have happened: Add a simple "Complete Placement Test" button to allow users to exit
- What actually happened: 1,861 lines deleted, 1,374 lines added - entire adaptive test replaced with minimal version

**Solution - Restoration:**

1. **Created backups** of current simplified version:
   - `public/index.html.backup-before-restore`
   - `public/app.js.backup-before-restore`

2. **Restored from commit `cd74c3a`** (Oct 14, before divergence):
   - `public/index.html` - Full adaptive test implementation (1902 lines)
   - `public/app.js` - Firebase integration (451 lines)

3. **Copied missing question bank:**
   - `dist/placement-questions.js` → `public/placement-questions.js` (180 questions, all CEFR levels)

4. **Added the intended completion feature** (what should have been done originally):
   - Added "Complete Placement Test" button to HTML
   - Added `completePlacementBtn` to DOM references
   - Created `handleCompletePlacement()` function with:
     - Firestore save (`placementCompleted: true`)
     - localStorage backup
     - Transition to main app
   - Added event listener for completion button
   - Used Firebase compat API for consistency

**Files Modified:**
- `public/index.html` - Restored + added completion button
- `public/app.js` - Restored original version
- `public/placement-questions.js` - Copied from dist/

**Restored Features:**
✅ 180-question bank (30 per CEFR level: A1, A2, B1, B2, C1, C2)
✅ Adaptive level adjustment (67% up, 33% down based on last 3 answers)
✅ Wilson Score confidence interval calculation (95% CI)
✅ Smart termination (10-15 questions, stops at 85% confidence)
✅ Progress bar with current question and estimated level
✅ Statistical final level determination (highest level with ≥60% accuracy)
✅ Complete Placement Test button for manual exit

**Key Functions Restored:**
- `initPlacementTest()` - Initializes adaptive test
- `loadNextQuestion()` - Selects random question from current level
- `handlePlacementAnswer()` - Processes answer and adjusts level
- `calculateConfidence()` - Wilson score interval calculation
- `finishPlacementTest()` - Determines final CEFR level
- `handleCompletePlacement()` - NEW: Manual completion option

**Result:**
✅ Full CEFR adaptive placement test restored
✅ Users can complete test via statistical confidence OR manual button
✅ All 180 questions available across 6 CEFR levels
✅ Sophisticated placement algorithm working again

