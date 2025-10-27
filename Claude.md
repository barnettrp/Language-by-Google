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

---

## Date: 2025-01-24

### Phase 2 Complete: 4 New Daily Quests Created

**Context:**
Continuing the quest system optimization project documented in QUEST-IMPROVEMENTS.md. Phase 1 (Objective Tracking System) was already complete. Phase 2 goal was to create 3-5 new "quick quests" optimized for 10-15 minute daily practice sessions.

**What Was Done:**

Created **4 new daily quests** using the "La Farmacia" template established in the previous session:

1. **El Taxi (Taxi Ride)** - `taxi-ride`
   - Stage 1: Hailing taxi & stating destination
   - Stage 2: Arrival & payment
   - Grammar: ir a + location, numbers 80-120
   - Vocabulary: Transportation (taxi, destino, llevar, ir, dirección)

2. **La Biblioteca (Library Visit)** - `library-visit`
   - Stage 1: Finding a book
   - Stage 2: Checkout process
   - Grammar: buscar/necesitar, time duration (por + time)
   - Vocabulary: Books (libro, buscar, encontrar, sección, préstamo)

3. **El Supermercado (Grocery Shopping)** - `grocery-shopping`
   - Stage 1: Finding grocery items
   - Stage 2: Checkout & payment
   - Grammar: food nouns (masculine/feminine), numbers 100-300
   - Vocabulary: Food (frutas, verduras, pan, leche, huevos, carne)

4. **La Llamada Telefónica (Phone Call)** - `phone-call`
   - Stage 1: Making doctor appointment
   - Stage 2: Confirming appointment details
   - Grammar: phone etiquette, time expressions
   - Vocabulary: Appointments (cita, consulta, horario, disponible)

**Daily Quest Template Features:**
- 2 stages (12 minutes total, 6 min per stage)
- questType: "daily" for filtering
- 3 objectives per stage (2 required, 1 optional)
- minMessages: 3 (faster completion than story quests)
- 30 XP per stage (60 total)
- Grammar tips integrated into objectives
- Adaptive difficulty (A1-C2)
- Real-world practical scenarios

**Files Modified:**
- `public/quest-data.js` - Added 753 lines (4 new quests)
- `QUEST-IMPROVEMENTS.md` - Updated Phase 2 section with completion details

**Current Quest Database:**
- **Total Quests:** 10
- **Story Quests (longer):** 5 quests
  - missing-guitar (25 min)
  - market-day (25 min)
  - cafe-order (15 min)
  - surf-lesson (20 min)
  - fishing-don-pedro (20 min)
- **Daily Quests (optimized):** 5 quests
  - pharmacy-visit (12 min)
  - taxi-ride (12 min)
  - library-visit (12 min)
  - grocery-shopping (12 min)
  - phone-call (12 min)
- **Total Content:** 172 minutes (~2.9 hours)

**Current State:**
- ✅ Phase 1: Objective Tracking System - COMPLETE
- ✅ Phase 2: Create 3-5 New Quick Quests - COMPLETE
- 📋 Phase 3: Restructure Existing Quests - NOT STARTED
- 📋 Phase 4: Engagement Mechanics - NOT STARTED

**Dev Server Status:**
- Running at http://localhost:3000
- All 10 quests available for testing
- Background process ID: 6dfb2e

**Changes Not Yet Committed:**
- Modified: `.claude/settings.local.json`
- Modified: `QUEST-IMPROVEMENTS.md`
- Modified: `public/quest-data.js`
- Untracked backups: `public/*.backup-before-restore`, `public/quest-data.js.backup`

---

## NEXT SESSION: What To Do

### Immediate Options:

**Option 1: Test New Quests (Recommended)**
Before committing, test the 4 new daily quests in the browser:
1. Open http://localhost:3000
2. Login or complete placement test
3. Try each new quest: taxi-ride, library-visit, grocery-shopping, phone-call
4. Verify objectives tracking works
5. Check completion notifications
6. Fix any bugs found

**Option 2: Commit Current Work**
If testing looks good, commit with message:
```
Add 4 new daily quests: Taxi, Library, Grocery, Phone Call

Created 4 new daily quests using the La Farmacia template:
- El Taxi (taxi-ride): Transportation vocabulary, 2 stages, 12 min
- La Biblioteca (library-visit): Books & library, 2 stages, 12 min
- El Supermercado (grocery-shopping): Food & shopping, 2 stages, 12 min
- La Llamada Telefónica (phone-call): Phone etiquette, 2 stages, 12 min

All quests follow daily quest template:
- 2 stages optimized for 10-15 minute sessions
- 3 objectives per stage (2 required, 1 optional)
- Grammar tips integrated into objectives
- Adaptive difficulty (A1-C2)
- Real-world practical scenarios

Total quest database now contains 10 quests (5 story + 5 daily).

Phase 2 of Quest System Improvements complete.
```

**Option 3: Proceed to Phase 3 - Restructure Existing Quests**
Goal: Reduce the 5 longer story quests from 20-25 minutes down to 10-15 minutes

**Quests to shorten:**
1. The Missing Guitar - 25 min → 15 min (6 stages → 3-4 stages)
2. Market Day - 25 min → 15 min (5 stages → 3 stages)
3. Surf Lesson - 20 min → 15 min (4 stages → 3 stages)
4. Fishing with Don Pedro - 20 min → 15 min (4 stages → 3 stages)
5. Café Order - 15 min (already optimal? or reduce to 12 min?)

**Approach for Phase 3:**
1. Read through each quest's stages in `public/quest-data.js`
2. Identify stages that can be consolidated without losing story coherence
3. Merge objectives from multiple stages into fewer stages
4. Maintain narrative flow
5. Keep total around 3 stages per quest
6. Test after each quest restructure

**Option 4: Deploy to Production**
If quests are tested and working:
1. Start dev server: `npm run dev` (or `node dev-server.js`)
2. Build for production: `npm run build`
3. Deploy to Vercel: `vercel --prod --yes`

---

### Reference: Project Structure

**Key Files:**
- `public/quest-data.js` - Quest database (2909 lines)
- `public/index.html` - Quest UI with objective tracking
- `public/app.js` - Quest logic and Firebase integration
- `QUEST-IMPROVEMENTS.md` - Phase-by-phase improvement documentation
- `Claude.md` - Session-by-session development log (this file)
- `DEVELOPMENT.md` - General development guide

**Dev Commands:**
- Start server: `node dev-server.js` (port 3000)
- Build: `npm run build`
- Deploy: `vercel --prod --yes`
- Kill server: `pkill -f "node dev-server.js"`

**Environment Variables (already set):**
- GEMINI_API_KEY ✓
- GOOGLE_TRANSLATE_API_KEY ✓
- VITE_FIREBASE_* (all Firebase vars) ✓

