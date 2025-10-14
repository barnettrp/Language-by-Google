# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Always Read and Update This File

**⚠️ CRITICAL**: When starting a new session or continuing work on this project:
1. **ALWAYS read this file FIRST** before making any changes
2. **ALWAYS update this file** when you add new features, modify architecture, or change implementation patterns
3. This ensures continuity across sessions and allows any AI assistant to pick up where work was left off
4. Document all significant changes in the relevant sections below

## Recent Changes

### October 2025 - Quest Descriptions Not Showing (Vercel Routing Fix)
**Status**: ✅ Fixed

**Problem**: Quest descriptions weren't appearing on the main quest selection page when deployed to Vercel. Debug logs showed `Number of quests: 0`.

**Root Cause**: The Vercel routing configuration had a catch-all route that was intercepting JavaScript file requests:
```json
{ "src": "/(.*)", "dest": "/index.html" }
```
This meant requests like `/quest-data.js` were returning the HTML file instead of the JavaScript file, causing `window.QUEST_DATABASE` to be undefined.

**Solution**: Added a specific route for JavaScript files BEFORE the catch-all route in `vercel.json`:
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*\\.js)$", "dest": "/$1" },  // NEW: Serve JS files correctly
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**Additional Improvements**:
1. Added debug logging to track when `QUEST_DATABASE`, `QUEST_IMAGES`, and `PLACEMENT_QUESTIONS` load
2. Modified quest loading to use a `getQuests()` function that refreshes from `window.QUEST_DATABASE` on each call
3. Updated `renderQuests()` to refresh the quests variable before rendering

**Files Modified**:
- `/vercel.json` - Added JS file route
- `/public/index.html` (lines 415-420, 657-672, 921) - Added debug logging and dynamic quest loading
- `/index.html` (same lines) - Synced changes

**Testing**: Build and deploy to Vercel, then check browser console for debug logs showing quest data loads correctly.

### January 2025 - Spanish-Only Dialogue with Click-to-Translate
**Status**: ✅ Complete and ready for testing

**What Changed**:
- Modified AI prompts to enforce Spanish-only dialogue across ALL proficiency levels
- Added level-based scaffolding where the AI adjusts vocabulary complexity, sentence length, and grammar usage based on user's CEFR level (A1-C2)
- Implemented click-to-translate feature using Google Translate API for instant translations
- Created non-obtrusive translation popup that appears when users click on Spanish text
- Users can select individual words, phrases, or entire sentences for translation
- Translation popup automatically hides when clicking elsewhere or scrolling

**Why This Improves Learning**:
- Immersive Spanish-only environment accelerates language acquisition
- Level-appropriate scaffolding keeps content challenging but not overwhelming
- On-demand translation provides safety net without interrupting flow
- Encourages users to try understanding Spanish first before translating

**How It Works**:
1. **AI Dialogue**: All AI responses are exclusively in Spanish, with difficulty automatically adjusted:
   - **A1**: Very simple vocabulary, short sentences, present tense focus
   - **A2**: Common vocabulary, clear sentences, basic past tense introduction
   - **B1**: Natural conversational Spanish with some idioms
   - **B2**: Nuanced expressions, cultural references, all tenses
   - **C1/C2**: Sophisticated vocabulary, literary expressions, complex structures

2. **Click-to-Translate**: Users click any AI message to get instant English translation:
   - Click without selection → translates entire message
   - Select text then click → translates only selection
   - Translation appears in sleek dark popover above clicked text
   - Works on words, phrases, or full sentences

**Files Modified**:
1. `/public/index.html` (lines 526-560) - Updated `AIManager.getResponse()` with Spanish-only prompts and level-based scaffolding
2. `/public/index.html` (lines 548-560) - Updated `AIManager.getCorrection()` to provide corrections in Spanish
3. `/public/index.html` (lines 585-639) - NEW: `TranslationManager` for handling Google Translate API calls
4. `/public/index.html` (lines 1071-1119) - Updated `addMessage()` to add click handlers to AI messages
5. `/public/index.html` (lines 1830-1841) - Added global click and scroll handlers to hide translation popup
6. `/public/index.html` (lines 31-50) - Added CSS styling for translation popover and chat bubble hover states
7. `/api/translate.js` - NEW: Serverless function for Google Translate API proxy

**Technical Implementation**:
- `TranslationManager.translate(text)`: Calls `/api/translate` endpoint with Spanish text
- `/api/translate` serverless function proxies request to Google Translate API
- API key stored securely in environment variable `GOOGLE_TRANSLATE_API_KEY`
- Translation popover positioned dynamically based on selection coordinates
- Loading state shown while translation is being fetched
- Fallback to "Translation unavailable" if API fails

**Environment Variable Required**:
Add to `.env` and Vercel:
```
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here
```
Note: The same Google API key used for Gemini can also enable Google Translate API.

**User Experience**:
- AI chat bubbles have subtle hover effect (darker background) indicating they're clickable
- Cursor changes to "help" icon when hovering over AI messages
- Translation popover has semi-transparent dark background with white text
- Smooth animation when popover appears
- Automatically dismisses when user interacts with other parts of the app

### January 2025 - Quest Story Arc Expansion
**Status**: 🚧 In progress (playable but expect future iterations)

**What Changed**:
- Extended "The Missing Guitar" quest into a 5-stage investigation that escalates from clue gathering to security protocols and a finale with Carlos backstage
- Expanded "Market Day" into a full community mission including supplier negotiations, permit approvals, and a live radio announcement
- Added richer objectives (trust building, negotiation, permit paperwork, public speaking) and new rewards/achievements that reflect the multi-step story arcs
- Language scaffolding now auto-adjusts after placement: B1+ users see vignettes/instructions in Spanish and AI replies/corrections stay in Spanish, while A1-A2 users still get English support when needed

**Gameplay Flow**:
1. Missing Guitar now flows Concierge → Vendor/Chef → Rival → Security → Carlos, emphasizing investigation and resolution steps
2. Market Day now flows Maria Inventory → Color Display → Supplier Negotiation → Permit Office → Radio Promotion, culminating in a community launch
3. New unlocks (`security_office_location`, `radio_station_location`, etc.) support guiding players through the longer missions

**Files Modified**:
1. `/public/quest-data.js` - Quest data, objectives, rewards, and stage progression updates

### January 2025 - Quest Image Rendering Fix
**Status**: ✅ Complete

**What Changed**:
- Added `stageImageGenerator` metadata to Market Day stages to map stages to SVG generators
- Reworked `initializeQuestImages()` to loop over all quests/stages, set images lazily, expose readiness via `window.questImagesReady`, and dispatch a `quest-images-ready` event
- Exposed `window.initializeQuestImages` to allow retries from the main app logic
- Updated both `index.html` files to request images via the shared initializer, listen for the readiness event, and inject the chat-stage image once available (avoids stale copies of stage data)
- Hardened SVG data URI generation to handle extended characters via `TextEncoder`-based base64 encoding with utf8 fallback
- Added inline SVG fallback rendering if image elements fail to load the generated data URIs
- Dev server now accepts `--port`, `--host`, and `--hmr-port` (or env vars) and forwards those values to both Express and Vite HMR so it can run on alternate ports inside Codespaces

**Why**:
- `currentStage` was created before the async image initializer completed, so the chat window never received the generated data URI and images did not render

**Files Modified**:
1. `/public/quest-data.js` - image initialization and metadata
2. `/index.html` & `/public/index.html` - chat stage image rendering helper logic

### December 2024 - Custom SVG Quest Images
**Status**: ✅ Complete and tested

**What Changed**:
- Added custom SVG image generation for quest stages using exact content matching
- Created `/public/quest-images.js` with SVG generator functions
- Modified quest data initialization to use generated SVG data URIs
- Images contain exactly what the AI asks users to count/identify

**Files Created/Modified**:
1. `/public/quest-images.js` - NEW: SVG generator functions for custom quest images
2. `/public/quest-data.js` - Added image initialization system with `initializeQuestImages()` function
3. `/index.html` - Added script tag to load quest-images.js before quest-data.js
4. `/public/index.html` - Same script loading changes (files must stay in sync)

**How It Works**:
1. `quest-images.js` exports `QUEST_IMAGES` object with generator functions
2. Each function returns SVG as base64-encoded data URI using `btoa()`
3. Quest stages initially have `stageImage: null`
4. `initializeQuestImages()` runs after scripts load and calls generator functions
5. Generated data URIs are assigned directly to stage `stageImage` properties
6. Retry mechanism ensures QUEST_IMAGES loads before initialization

**Why Custom SVGs**:
- Ensures images contain EXACTLY what the AI references (e.g., 8 apples, 12 oranges)
- No dependency on external image sources (Unsplash, etc.)
- Perfect pixel-level control over visual elements
- Bilingual labels in Spanish and English
- Culturally appropriate styling

**Technical Implementation**:
- SVG strings converted to data URIs: `'data:image/svg+xml;base64,' + btoa(svg.trim())`
- Initialization uses optional chaining to safely access quest properties
- Console logging confirms successful initialization: "✅ Quest images initialized"
- Images display in `startStage()` function (lines 808-820 in both index.html files)

**Current Custom Images**:
1. Market Day Stage 1: Fruit stand with exact inventory (8 apples, 12 oranges, 6 bananas, 15 strawberries, 3 watermelons)
2. Market Day Stage 2: Colorful fruits display organized by color sections

**Testing**:
- Test page available: `/test-images.html`
- Verified SVG generation produces valid base64 data URIs
- Confirmed images initialize correctly in QUEST_DATABASE
- Both stages display images properly in browser

## Project Overview

**ConvoQuest** is a language learning web application that uses role-playing game mechanics to teach Spanish. Users complete interactive quests by conversing with AI-powered characters, receiving corrections and feedback on their language usage.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), TailwindCSS (via CDN)
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Gemini API (accessed via backend proxy)
- **Build Tool**: Vite
- **Deployment**: Vercel

## Development Commands

### Local Development
```bash
npm run dev          # Start Vite dev server on port 5173
```

### Build
```bash
npm run build        # Build for production (output: /dist)
npm run preview      # Preview production build
```

### Installation
```bash
npm install          # Install dependencies (vite, firebase)
```

## Architecture

### Single-Page Application Structure

The application is built as a single HTML file (`index.html` in both root and `/public`) containing all UI, styles, and logic. The main architectural components are:

1. **View System**: The app uses a view-based navigation system with `.main-view` CSS classes
   - `auth-container`: Login/signup views
   - `placement-view`: Initial placement test (quiz + chat)
   - `main-app-view`: Main app with quest selection and chat interface

2. **Firebase Integration** (public/index.html:197-221):
   - Firebase modules are loaded via ESM imports from CDN
   - Configuration uses Vite environment variables (format: `%VITE_FIREBASE_API_KEY%`)
   - Firebase instances exposed globally via `window.firebaseInstances` and `window.firebaseFunctions`

3. **AI Backend Proxy** (`api/gemini.js`):
   - Serverless function that proxies requests to Google Gemini API
   - Keeps `GEMINI_API_KEY` secure on server side
   - Accepts `systemInstruction` and `contents` in POST body
   - Returns Gemini API response directly to client

4. **Quest System** (/public/quest-data.js):
   - **NEW**: Quests now defined in external `/public/quest-data.js` file for better organization
   - **NEW**: Enhanced data structure with rich metadata (difficulty, category, learning objectives, etc.)
   - Each quest has stages with characters, vignettes, system prompts, objectives, and rewards
   - Navigation: Quest selection → Map view → Vignette → Chat stage → Completion modal
   - **Currently available quests**: "The Missing Guitar" (3 stages), "Market Day" (2 stages)

5. **Chat/Conversation Flow**:
   - Messages stored in `messages` array (for quests) or `placementMessages` (for placement test)
   - AIManager handles all AI interactions via `/api/gemini` endpoint
   - History is limited to last 6 messages for context management (index.html:416)

### User Data Model (Firestore)

Users are stored at `users/{userId}` with fields:
- `name`, `email`, `createdAt`
- `xp`: Experience points
- `completedStages`: Object tracking quest progress
- `proficiencyLevel`: Determined by placement test (e.g., 'A1')
- `dialect`, `formality`, `vignetteLanguage`: User preferences

### Environment Variables

**Development** (create `.env` file):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**Production** (Vercel Environment Variables):
- All `VITE_*` variables above
- `GEMINI_API_KEY` (for serverless function)

Vite processes environment variables during build, replacing `%VITE_*%` placeholders in HTML.

## Deployment

The project is configured for Vercel deployment:
- `vercel.json` defines build settings and routes
- Static files route to `/index.html` for SPA behavior
- API routes (`/api/*`) are handled by serverless functions in `/api` directory

## Quest System Overhaul (October 2025)

The quest system has been significantly enhanced with a new data structure to support more robust features:

### Key Improvements
1. **Separate Data File**: Quests moved to `/public/quest-data.js` for better organization
2. **Rich Metadata**: Each quest now includes difficulty, category, learning objectives, tags
3. **Bilingual Vignettes**: Vignettes support both English and Spanish (user can choose)
4. **Learning Objectives**: Stages can define specific learning goals (vocabulary, grammar)
5. **Adaptive Difficulty**: Per-stage difficulty modifiers based on user proficiency level
6. **Enhanced Rewards**: Achievements, unlocked content, virtual items
7. **Flexible Branching**: Conditional next stages with labels

### Quest Data Structure (quest-data.js)
- `QUEST_DATABASE.quests`: Object containing all quest definitions
- `QUEST_CATEGORIES`: Category metadata (name, icon, color)
- `DIFFICULTY_LEVELS`: Difficulty tier definitions
- Exported to `window.QUEST_DATABASE` for use in main app

### Backward Compatibility
The app supports both old and new quest formats:
- Old: `vignette_en` string, `nextStages` as string array
- New: `vignette` object with `en`/`es` keys, `nextStages` as object array

### Current Status
- **Migration Complete**: Both index.html files updated to use external quest data
- **Available Quests**: 2 complete quests with 5 total stages
- **Ready for Expansion**: Easy to add new quests by editing quest-data.js

### Testing the Quest System
A comprehensive test suite is available to verify the quest system:

**Test Page**: http://localhost:5173/test-quest-system.html
- 15 automated tests validating quest structure
- Visual quest inspector showing all quest data
- Stage viewer with bilingual vignettes
- Quest cards with metadata display

**Test Documentation**: See `/TESTING_QUEST_SYSTEM.md` for:
- Complete 3-phase testing checklist
- Browser console test commands
- Troubleshooting guide
- Test results template

**To run tests**:
```bash
npm run dev
# Then visit: http://localhost:5173/test-quest-system.html
```

Expected: 15/15 tests pass, all quest data displays correctly.

### Future Enhancements
- QuestManager class for progress tracking and objective evaluation
- Quest filtering/discovery UI with category tabs
- Real-time objective tracking during conversations
- AI-powered objective completion detection
- Quest analytics and performance metrics

## Important Implementation Details

### Dual index.html Files
There are two nearly-identical `index.html` files:
- **Root `/index.html`**: Entry point for local development
- **`/public/index.html`**: Used for Vercel static builds

Both must be kept in sync when making UI changes.

### AIManager Pattern
All AI calls go through `AIManager` object (index.html:284-329) which:
- Formats system instructions and conversation history
- Sends requests to `/api/gemini` backend proxy
- Handles error responses and safety filters
- Provides specific methods: `getResponse()`, `getCorrection()`

### Firebase Auth State Management
The app uses `onAuthStateChanged` listener (index.html:486-493) to:
- Automatically redirect authenticated users to appropriate view
- Load user settings from Firestore on sign-in
- Show placement test if `proficiencyLevel` is null
- Show main app if user has completed placement

### Conversation Context Management
To avoid token limits, only the last 6 messages are sent to AI (index.html:416):
```javascript
const response = await AIManager.getResponse(messages.slice(-6), currentStage, userSettings);
```

### Stage Image Display System
**Added: December 2024 | Updated: Custom SVG Implementation**

Quests can now display custom-generated SVG images at the start of each stage to provide precise visual context for learning activities.

**Display Implementation** (index.html:808-820 and public/index.html:808-820):
- The `startStage()` function checks for `currentStage.stageImage`
- If present, creates an `<img>` element wrapped in a centered container
- Image is displayed at the top of the chat container before messages
- Styled with rounded corners, shadow, and max-height of 300px

**Creating Custom SVG Images** (`/public/quest-images.js`):

1. **Add SVG Generator Function**:
```javascript
const QUEST_IMAGES = {
  yourQuest_stage1_imageName: function() {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
        <!-- Your SVG content here -->
        <!-- Include exact elements the AI will reference -->
        <circle cx="100" cy="100" r="20" fill="red"/>
        <!-- Add bilingual labels -->
        <text x="100" y="150" text-anchor="middle">Manzana / Apple</text>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoa(svg.trim());
  }
};
```

2. **Initialize in Quest Data** (`/public/quest-data.js`):
```javascript
// In the quest stage definition:
"1": {
  id: "1",
  characterName: "Character Name",
  stageImage: null, // Will be initialized after QUEST_IMAGES loads
  systemPrompt: "You are... Point out specific items in the image above...",
  initialMessage: "Look at the display above!",
  // ... rest of stage
}

// In initializeQuestImages() function (at end of file):
function initializeQuestImages() {
  if (window.QUEST_IMAGES) {
    if (QUEST_DATABASE.quests["your-quest"]?.stages?.["1"]) {
      QUEST_DATABASE.quests["your-quest"].stages["1"].stageImage =
        window.QUEST_IMAGES.yourQuest_stage1_imageName();
    }
    console.log('✅ Quest images initialized');
  } else {
    setTimeout(initializeQuestImages, 100); // Retry if not loaded
  }
}
```

3. **Script Loading Order** (both index.html files):
```html
<!-- Quest Images MUST load BEFORE Quest Data -->
<script src="/quest-images.js"></script>
<script src="/quest-data.js"></script>
```

**Why Use Custom SVGs**:
- **Exact Content**: Image contains precisely what the AI asks about (e.g., exactly 8 apples)
- **No External Dependencies**: No reliance on Unsplash or other image services
- **Perfect Control**: Pixel-level control over visual elements
- **Bilingual Support**: Add Spanish and English labels directly in the SVG
- **Cultural Authenticity**: Style elements to match quest cultural context
- **Scalable**: SVGs scale perfectly at any resolution
- **Fast Loading**: Data URIs embed directly, no network requests

**SVG Best Practices**:
- Use viewBox="0 0 600 400" for consistent aspect ratio
- Include bilingual labels in Spanish and English
- Use semantic colors and clear visual distinction
- Add titles and section headers for context
- Keep SVG code readable with comments
- Test the base64 encoding: data URI should start with "data:image/svg+xml;base64,"

**Current Custom SVG Images**:
1. **Market Day Stage 1** - `marketDay_stage1_fruitStand()`: Fruit stand with exact inventory (8 red apples, 12 oranges, 6 bananas, 15 strawberries, 3 watermelons) with Spanish/English labels
2. **Market Day Stage 2** - `marketDay_stage2_colorfulFruits()`: Colorful fruits organized by color sections (rojo/red, amarillo/yellow, naranja/orange, verde/green, morado/purple, rosa/pink)

**Testing Images**:
- Run `npm run dev` and visit http://localhost:5173/test-images.html
- Check browser console for "✅ Quest images initialized" message
- Verify images display correctly in quest stages
- Confirm data URIs are valid base64-encoded SVG

## Adding New Features

### Adding a New Quest
1. Open `/public/quest-data.js`
2. Add quest object to `QUEST_DATABASE.quests` following the enhanced structure:
   ```javascript
   "quest-id": {
     id: "quest-id",
     title: "Quest Title",
     objective: "Brief description",
     difficulty: "beginner|intermediate|advanced",
     requiredLevel: "A1|A2|B1|B2|C1|C2",
     estimatedDuration: 15, // minutes
     category: "mystery|adventure|culture|daily-life",
     tags: ["tag1", "tag2"],
     thumbnailImage: "https://...",
     mapImage: "https://...",
     focusGrammar: ["grammar1", "grammar2"],
     focusVocabulary: ["vocab1", "vocab2"],
     prerequisites: [], // Other quest IDs required first
     stages: { /* stage definitions */ }
   }
   ```
3. Define stages with enhanced structure:
   ```javascript
   "1": {
     id: "1",
     characterName: "Character Name",
     characterAvatar: "👤",
     location: "Location Name",
     vignette: { en: "English text", es: "Spanish text" },
     stageImage: null,  // Will be initialized by initializeQuestImages() if custom SVG exists
     systemPrompt: "AI character instructions. Reference 'the image above' if stageImage is present.",
     initialMessage: "First message. Reference visual elements if stageImage is present.",
     objectives: [ /* learning objectives */ ],
     difficultyModifiers: { /* per-level adaptations */ },
     stageType: "conversation",
     completionCriteria: { minMessages: 3, objectivesRequired: 1 },
     reward: { clue: "...", xp: 50, achievements: [], items: [] },
     nextStages: [{ id: "2", condition: "default", label: "Next" }]
   }
   ```
4. **IMPORTANT - Visual Elements**: If the quest scenario involves visual elements (counting items, identifying objects, describing scenes, colors, etc.):

   **Step 4a: Create Custom SVG in `/public/quest-images.js`**:
   ```javascript
   const QUEST_IMAGES = {
     // ... existing images ...

     yourQuestId_stage1_descriptiveName: function() {
       const svg = `
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400">
           <!-- Create EXACT visual elements the AI will reference -->
           <!-- Example: If AI asks to count 5 apples, draw exactly 5 apples -->
           <!-- Include bilingual labels -->
         </svg>
       `;
       return 'data:image/svg+xml;base64,' + btoa(svg.trim());
     }
   };
   ```

   **Step 4b: Initialize Image in `/public/quest-data.js`**:
   - Set `stageImage: null` in the stage definition
   - Add initialization in `initializeQuestImages()` function:
   ```javascript
   if (QUEST_DATABASE.quests["your-quest-id"]?.stages?.["1"]) {
     QUEST_DATABASE.quests["your-quest-id"].stages["1"].stageImage =
       window.QUEST_IMAGES.yourQuestId_stage1_descriptiveName();
   }
   ```

   **Step 4c: Update Quest Prompts**:
   - **Update `systemPrompt`** to reference "the image above" when describing visual elements
   - **Update `initialMessage`** to direct user attention to the image (e.g., "Look at the display above!")
   - Ensure image content exactly matches what the AI will ask about

   **Step 4d: Theme and Style**:
   - Match quest location and cultural context
   - Use bilingual labels (Spanish/English)
   - Follow SVG best practices (see "Stage Image Display System" section)

5. Quest will automatically appear in quest selection view

### Adding New AI Interactions
1. Add method to `AIManager` object
2. Use `this.callAPI()` with appropriate `systemInstruction` and `contents`
3. Call from event handler or interaction flow

### Modifying User Settings
1. Update `initialSettings` objects in `setupNewUser()` and `loadUserSettings()` functions
2. Add UI controls in settings modal (index.html:138-148)
3. Update Firestore via `saveUserSettings()` function
