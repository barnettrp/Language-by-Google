# ConvoQuest Development Session Notes

## Last Updated: 2025-11-10

---

## Session Update - 2025-11-10: Status Check & ElevenLabs Integration

### What Was Discovered:
- **Priority 3 UI work is ALREADY DEPLOYED** ✅
  - All 10 Priority 3 tasks completed in previous sessions
  - Current version: v2.1.9 (not v1.3.0 as old notes suggested)
  - Features confirmed in codebase:
    - Mobile bottom navigation ✅
    - Swipe gesture navigation ✅
    - High contrast mode ✅
    - Font size options ✅
    - Keyboard navigation ✅
    - Screen reader support (ARIA) ✅
    - Onboarding tour ✅
    - Button micro-interactions ✅
    - Skeleton loading states ✅
    - Smooth scrolling ✅

### What Was Completed This Session:
- ✅ Validated JavaScript syntax (app.js, quest-data.js)
- ✅ Reviewed uncommitted files
- ✅ Committed ElevenLabs integration files:
  - `api/elevenlabs-tts.js` - High-quality character voices
  - `api/elevenlabs-music.js` - Quest background music
  - Updated `dev-server.js` with ElevenLabs handlers
  - Updated `.env.example` with ELEVENLABS_API_KEY
  - Added @elevenlabs/elevenlabs-js dependency
  - Commit: 07f3a0e
- ✅ **MAJOR DISCOVERY: ElevenLabs is ALREADY FULLY INTEGRATED!**
  - Frontend integration complete in app.js
  - TTS Manager already tries ElevenLabs first (app.js:541)
  - Background music player already implemented (app.js:839-988)
  - Music auto-plays on quest start, auto-stops on exit
  - All features working perfectly in local testing

### Testing Results (2025-11-10):
**ElevenLabs TTS Endpoint:**
- ✅ Successfully generated speech for "Hola, ¿cómo estás?"
- ✅ Voice ID: VR6AewLTigWG4xSOukaG (mature male voice)
- ✅ Audio size: 24,580 bytes
- ✅ Provider: elevenlabs

**ElevenLabs Music Endpoint:**
- ✅ Successfully generated background music for pharmacy quest
- ✅ Prompt: "gentle spanish acoustic guitar, warm friendly atmosphere..."
- ✅ Audio size: 641,488 bytes (30-second loop)
- ✅ Provider: elevenlabs

### TTS Fallback Priority Chain:
1. **ElevenLabs** (Primary - high quality multilingual voices)
2. Cartesia (Fallback with emotion control)
3. OpenAI (Fallback)
4. Google Cloud TTS (Final fallback)

### Background Music Features:
- **Auto-start:** Begins when quest starts (app.js:1764)
- **Auto-stop:** Ends when leaving quest (app.js:2604)
- **Volume:** 0.3 default, max 0.5 (quieter than voice)
- **Fade effects:** 2-second fade-in, 1-second fade-out
- **Looping:** 30-second clips loop continuously
- **Toggle:** Can be enabled/disabled by user
- **Quest-specific:** Different music themes per quest/difficulty

### Current Project State

### Version
- **Current Version:** v2.1.9
- **Last Deployed:** Multiple sessions between Nov 1-10
- **Production URL:** https://language-by-google-reddkue0r-richard-barnetts-projects.vercel.app
- **Dev Server Port:** 5176 (http://localhost:5176)

### Repository
- **Branch:** main
- **Last Commit:** 07f3a0e - "feat: Add ElevenLabs TTS and music generation API integration"
- **Uncommitted Changes:** .claude/settings.local.json (local settings, won't commit)
- **Ready to Push:** Latest ElevenLabs commit

### Recent Commits (Last 7 days):
```
07f3a0e - feat: Add ElevenLabs TTS and music generation API integration
a66666a - feat: Add profile silhouette icon to chat header
fb687fe - feat: Add Santiago headshot to NPC chat messages
6e447de - chore: Remove debug console and bump version to v2.1.7
4b381fe - Add Santiago welcome guide to quest view
```

---

## Session Changes - Part 1 (2025-11-01 Morning)

### 1. Vocabulary Review Implementation (ALL QUESTS)

**Status:** ✅ COMPLETED

**What Changed:**
- Added 8-step vocabulary review pattern to the final stage of ALL 11 quests
- Each quest now includes quest-specific vocabulary practice
- All sentence examples use all-Spanish format with English translations

**Quests Updated:**
1. **quest-zero-onboarding** - Vocabulary: gato (cat), abuela (grandmother), buscar (to search)
2. **missing-guitar** - Vocabulary: guitarra (guitar), músico (musician), buscar (to search), encontrar (to find)
3. **market-day** - Vocabulary: mercado (market), frutas (fruits), comprar (to buy), precio (price)
4. **cafe-order** - Vocabulary: café (coffee), ordenar (to order), cuenta (bill), mesero/mesera (waiter/waitress)
5. **surf-lesson** - Vocabulary: tabla (board), ola (wave), playa (beach), nadar (to swim)
6. **fishing-don-pedro** - Vocabulary: pescar (to fish), pez (fish), barca (boat), paciencia (patience)
7. **pharmacy-visit** - Vocabulary: farmacia (pharmacy), medicina (medicine), receta (prescription), dolor (pain)
8. **taxi-ride** - Vocabulary: taxi (taxi), destino (destination), pagar (to pay), conductor (driver)
9. **library-visit** - Vocabulary: biblioteca (library), libro (book), prestar (to lend), leer (to read)
10. **grocery-shopping** - Vocabulary: supermercado (supermarket), comida (food), pagar (to pay), lista (list)
11. **phone-call** - Vocabulary: teléfono (telephone), cita (appointment), llamar (to call), doctor (doctor)

**8-Step Vocabulary Review Pattern:**
```
1. Thank them warmly / Context-specific celebration
2. Ask how they feel - "How do you feel about [quest activity]?"
3. WAIT for their response
4. Start vocabulary review - "You learned some great words today! Repeat these words: [word1], [word2], [word3], [word4]."
5. WAIT for them to repeat the words
6. Sentence practice - "¡Muy bien! Now try using one of these words in a sentence IN SPANISH. For example, you could say: '[Spanish sentence]' ([English translation]). Can you make a sentence in Spanish?"
7. WAIT for their sentence response
8. Final farewell - After they respond, [context-specific goodbye]. Your farewell should end with an encouraging statement (NOT a question) since this is the final goodbye.
```

**File:** `public/quest-data.js` (lines vary per quest)

**Commit:** 2fc6667 - "feat: Add vocabulary review to all 10 remaining quests"

---

### 2. Debug Console Removal

**Status:** ✅ COMPLETED

**What Changed:**
- Removed debug console UI panel from HTML
- Simplified JavaScript debug logging to console.log only
- Cleaner production UI without debug panel clutter

**Files Modified:**
- `public/index.html` - Removed debug console panel (lines 705-720)
- `public/app.js` - Simplified debugLog function (lines 25-54, 1730-1823)

**Commit:** 14152fa - "feat: Remove debug console from production"

---

### 3. Critical Rule #8: ONE QUESTION PER RESPONSE

**Status:** ✅ COMPLETED

**What Changed:**
- Added new mandatory rule enforcing one question per AI response
- AI must WAIT for user corrections before moving to next topic
- Prevents rushing through learning moments

**The Rule:**
```javascript
8. 🚨 ONE QUESTION PER RESPONSE - ESPECIALLY AFTER CORRECTIONS 🚨:
   - Only ask ONE question in each response
   - After correcting pronunciation or grammar, WAIT for the user to try again
   - Do NOT move on to new topics, locations, or questions in the same message as a correction
   - Let the user practice before continuing

   ❌ WRONG (correction + moving on in same response):
   User: "El banjo"
   AI: "*chuckles gently* Almost! It's 'baño' - try one more time: 'ba-ño'? *We hurry to el dormitorio* Let me check... I see una cama (a bed) and clothes, but still no gato! Wait, Rick - maybe he's hiding debajo de la mesa (under the table)! Can you say 'debajo de la mesa' with me?"

   ✅ CORRECT (correction only, wait for response):
   User: "El banjo"
   AI: "*chuckles gently* Almost! It's 'baño' - try saying it with me: 'ba-ño'. Can you try again?"
   [WAIT for user to respond with correction]
   User: "Baño"
   AI: "¡Perfecto, Rick! (Perfect!) *We check el baño but no gato here* Should we try el dormitorio (the bedroom) next?"

   REMEMBER:
   - Correction = Wait for retry
   - One question = One response
   - Don't rush the learning moment!
```

**File:** `public/quest-data.js` (lines 150-171)

**Impact:** Applies to ALL 11 quests through `LANGUAGE_LEARNING_INSTRUCTIONS.criticalRules`

**Commit:** 7bab79f - "feat: Add one-question-per-response rule and reorganize quest list"

---

### 4. Quest List Reorganization

**Status:** ✅ COMPLETED

**What Changed:**
- Reorganized quest list UI into three clear sections
- Completed quests NEVER disappear
- All quests always visible with appropriate status

**Three Sections:**
1. **✨ Available Quests** - Unlocked and ready to play
2. **🔒 Locked Quests** - Greyed out (opacity-60) with lock icons and prerequisites shown
3. **✓ Completed Quests** - At the bottom, still fully replayable with "↺ Replay Quest" button

**File:** `public/app.js` (function `renderQuests`, lines 735-881)

**Key Changes:**
- Organized quests into three arrays: `availableQuests`, `lockedQuests`, `completedQuestsArray`
- Created helper function `createQuestCard()` to generate quest cards
- Added section headers for each category
- Completed quests moved to bottom but remain accessible

**User Impact:**
- Clear organization and navigation
- Users can replay completed quests anytime
- Visual distinction between quest states

**Commit:** 7bab79f - "feat: Add one-question-per-response rule and reorganize quest list"

---

### 5. All-Spanish Sentence Practice (Updated Onboarding)

**Status:** ✅ COMPLETED

**What Changed:**
- Updated onboarding quest to match the all-Spanish sentence pattern used in other 10 quests
- Changed from mixed English-Spanish to all-Spanish with English translation

**Before:**
```
"For example, you could say: 'I helped abuela find her gato.' Can you make a sentence?"
```

**After:**
```
"For example, you could say: 'Ayudé a abuela a encontrar su gato' (I helped grandmother find her cat). Can you make a sentence in Spanish?"
```

**File:** `public/quest-data.js` (line 373)

**Impact:** All 11 quests now consistently use all-Spanish sentence examples

**Commit:** 9f8a52b - "fix: Update onboarding quest vocabulary review to use all-Spanish sentences"

---

### 6. Enhanced Noun Translation Requirement

**Status:** ✅ COMPLETED

**What Changed:**
- Updated Critical Rule #1 to explicitly require translation of MOST NOUNS
- Added clearer examples showing noun-rich vocabulary

**Updated Rule:**
```javascript
1. ⚠️⚠️⚠️ SPANISH VOCABULARY - ABSOLUTELY MANDATORY IN EVERY RESPONSE ⚠️⚠️⚠️:
   - You MUST include 2-3 Spanish words with English translations in EVERY single response
   - TRANSLATE MOST NOUNS: For most nouns you use, provide the Spanish word with English translation
   - Format: "palabra (translation)" or "¿pregunta? (question?)"
   - This is a LANGUAGE LEARNING APP - pure English responses are COMPLETELY UNACCEPTABLE
   - Before sending ANY response, CHECK that it contains Spanish words with translations

   ❌ WRONG (Pure English - DO NOT DO THIS):
   "I see a table and some chairs. No cat here."

   ✅ CORRECT (English + Spanish, most nouns translated - ALWAYS DO THIS):
   "I see una mesa (a table) and some sillas (chairs). No gato (cat) here."
```

**File:** `public/quest-data.js` (lines 27-44)

**Impact:**
- Applies to ALL 11 quests through `LANGUAGE_LEARNING_INSTRUCTIONS.criticalRules`
- AI will consistently translate nouns: table→mesa, chair→silla, cat→gato, bedroom→dormitorio, etc.
- Maximizes vocabulary exposure in every conversation

**Commit:** 6de3f88 - "feat: Require AI to translate most nouns in every response"

---

## Session Changes - Part 2 (2025-11-01 Afternoon) - UI-REDESIGN Priority 3

**Status:** ✅ ALL 10 TASKS COMPLETED

**Summary:** Completed the entire Priority 3 from UI-REDESIGN.md, implementing micro-interactions, mobile optimization, accessibility features, and onboarding tour.

### 1. Button Micro-Interactions

**Status:** ✅ COMPLETED

**What Changed:**
- Added scale effects on button click (scale to 0.95)
- Added hover lift with shadow (translateY -2px)
- Implemented Material Design-style ripple effect
- Ripple emanates from exact click point
- Used cubic-bezier easing for bouncy feel

**Implementation Details:**
- CSS transitions for scale and hover
- JavaScript event delegation for ripple creation
- Ripple animation duration: 600ms
- Applied to ALL buttons throughout the app

**Files Modified:**
- `public/index.html` (lines 224-258) - CSS for button effects and ripple animation
- `public/app.js` (lines 1954-1974) - Ripple effect JavaScript

**Commit:** 65233de - "feat: Add Priority 3 UI micro-interactions and loading states"

---

### 2. Smooth Scrolling

**Status:** ✅ COMPLETED

**What Changed:**
- Added smooth scroll behavior to all elements
- Natural, gradual scrolling instead of instant jumps
- Applied globally to html and all elements

**Implementation Details:**
- CSS: `scroll-behavior: smooth` on html and *
- Works for anchor links and programmatic scrolling
- No JavaScript required

**Files Modified:**
- `public/index.html` (lines 260-267) - CSS for smooth scrolling

**Commit:** 65233de - "feat: Add Priority 3 UI micro-interactions and loading states"

---

### 3. Skeleton Loading States

**Status:** ✅ COMPLETED

**What Changed:**
- Replaced old "Loading..." text with modern skeleton loaders
- Animated gradient shimmer effect
- Dark mode support with different colors
- Multiple skeleton types (text, title, card, avatar, button)

**Implementation Details:**
- Keyframe animation for gradient movement
- 1.5s infinite ease-in-out animation
- Light mode: #f0f0f0 → #f8f8f8 → #f0f0f0
- Dark mode: #2a2a3e → #3a3a4e → #2a2a3e

**Files Modified:**
- `public/index.html` (lines 269-319) - CSS for skeleton animations
- `public/index.html` (line 996-1000) - Applied to correction-loading div

**Commit:** 65233de - "feat: Add Priority 3 UI micro-interactions and loading states"

---

### 4. Mobile Bottom Navigation

**Status:** ✅ COMPLETED

**What Changed:**
- Added fixed bottom navigation bar for mobile/tablet
- Three buttons: Quests (🗺️), Quiz (📝), Profile (👤)
- Thumb-friendly design with 64px minimum touch targets
- Active state with gradient indicator line
- Only visible on devices ≤1024px width

**Implementation Details:**
- Fixed positioning at bottom: 0
- Height: 72px + safe-area-inset-bottom (iPhone notch support)
- Backdrop blur and glassmorphism effect
- Active button gets top indicator line and scale animation
- Updates active state on navigation changes

**Files Modified:**
- `public/index.html` (lines 321-419) - CSS for bottom nav
- `public/index.html` (lines 1336-1350) - HTML structure
- `public/app.js` (lines 1976-2029) - Navigation logic and active state

**Commit:** 13190bf - "feat: Add mobile bottom navigation with thumb-friendly design"

---

### 5. Swipe Gesture Navigation

**Status:** ✅ COMPLETED

**What Changed:**
- Swipe right to go back from chat view to quest list
- Minimum 50px swipe distance to prevent accidents
- Maximum 100px vertical movement to distinguish from scrolling
- Passive event listeners for smooth performance

**Implementation Details:**
- Touch event handlers: touchstart, touchmove, touchend
- Tracks start/end positions and calculates delta
- Doesn't interfere with buttons, inputs, or textareas
- Stops TTS audio when swiping back
- Updates mobile nav active state

**Files Modified:**
- `public/app.js` (lines 2031-2100) - Swipe gesture detection and handling

**Commit:** d9aae5f - "feat: Add swipe gesture navigation for mobile"

---

### 6. High Contrast Mode

**Status:** ✅ COMPLETED

**What Changed:**
- Added accessibility toggle in Settings > Accessibility
- Pure black/white color schemes for maximum contrast
- Separate styling for light and dark modes
- 2px borders on all interactive elements
- Removes gradients and animations

**Implementation Details:**
- Light high contrast: White background, black text, blue buttons
- Dark high contrast: Black background, white text, cyan buttons
- 3px focus outlines for keyboard navigation
- Saved in localStorage for persistence
- Applies to all UI elements including chat bubbles

**Files Modified:**
- `public/index.html` (lines 48-133) - CSS for high contrast modes
- `public/index.html` (lines 1181-1195) - Settings toggle UI
- `public/app.js` (lines 1859-1888) - Toggle handler and persistence

**Commit:** 348d830 - "feat: Add high contrast mode for accessibility"

---

### 7. Font Size Options

**Status:** ✅ COMPLETED

**What Changed:**
- Added font size selector in Settings > Accessibility
- Four options: Small (14px), Normal (16px), Large (18px), Extra Large (20px)
- Proportional heading scaling for each size
- Saved in localStorage for persistence

**Implementation Details:**
- Body font sizes: 14px, 16px, 18px, 20px
- Headings scale proportionally (h1, h2, h3)
- Applied via body class: font-size-small, font-size-normal, etc.
- Defaults to "normal" if no preference saved

**Files Modified:**
- `public/index.html` (lines 135-163) - CSS for font sizes
- `public/index.html` (lines 1197-1208) - Font size selector
- `public/app.js` (lines 1890-1918) - Selection handler and persistence

**Commit:** 2587258 - "feat: Add font size options for accessibility"

---

### 8. Keyboard Navigation Support

**Status:** ✅ COMPLETED

**What Changed:**
- Full keyboard navigation with shortcuts
- Enhanced focus indicators (only visible when using keyboard)
- Skip-to-content link for screen readers
- Smart detection of input method

**Keyboard Shortcuts:**
- **Escape:** Close modals, return to quest list from chat
- **Ctrl/Cmd + K:** Toggle settings modal
- **Ctrl/Cmd + /:** Return to quest view from chat
- **Tab:** Navigate through interactive elements

**Implementation Details:**
- Visible focus indicators with 3px outline and shadow
- Different colors for light/dark modes
- Skip-to-content link appears on focus at top of page
- Adds keyboard-navigation class when Tab pressed
- Removes class when mouse used

**Files Modified:**
- `public/index.html` (lines 135-167) - CSS for focus indicators and skip link
- `public/index.html` (lines 769-770, 891-892) - Skip link and main-content anchor
- `public/app.js` (lines 1919-1987) - Keyboard event handlers and focus management

**Commit:** 0417c1f - "feat: Add comprehensive keyboard navigation support"

---

### 9. Screen Reader Support (ARIA)

**Status:** ✅ COMPLETED

**What Changed:**
- Added comprehensive ARIA roles, labels, and attributes
- Live region for dynamic announcements
- Screen reader only content (sr-only class)
- All interactive elements properly labeled

**ARIA Implementation:**
- **Roles:** main, banner, navigation, dialog, list, status
- **Labels:** aria-label on all buttons and navigation
- **States:** aria-current="page" for active navigation
- **Modal:** aria-modal="true" and aria-labelledby
- **Hidden:** aria-hidden="true" for decorative icons

**Live Announcements:**
- Polite announcements for view changes
- Custom announceToScreenReader() function
- Exposed globally via window.announceToScreenReader()
- Auto-clears after 3 seconds

**Files Modified:**
- `public/index.html` (lines 169-180) - CSS for sr-only class
- `public/index.html` (lines 891, 894, 932, 1155-1157, 1334, 1337-1349) - ARIA roles and labels
- `public/app.js` (lines 1989-2039) - Screen reader announcement system

**Commit:** 7662833 - "feat: Add comprehensive screen reader support with ARIA"

---

### 10. Onboarding Tour

**Status:** ✅ COMPLETED

**What Changed:**
- Interactive 4-step walkthrough for new users
- Spotlight effect highlighting UI elements
- Animated tooltips with directional arrows
- Progress dots and skip/finish buttons

**Tour Steps:**
1. Welcome message and quest hub intro
2. Quest list explanation
3. Settings and accessibility features
4. Mobile navigation (when visible)

**Implementation Details:**
- Overlay with dark backdrop and blur
- Spotlight with glowing blue border and shadow
- Tooltip auto-positions to stay on screen
- Arrow points to target element
- Progress dots show current step (1/4, 2/4, etc.)
- Saves completion in localStorage
- Exposed window.restartOnboardingTour() for testing

**Files Modified:**
- `public/index.html` (lines 182-291) - CSS for tour overlay, spotlight, tooltip, arrows, and dots
- `public/index.html` (lines 1439-1458) - HTML structure
- `public/app.js` (lines 2041-2219) - Tour logic and positioning system

**Commit:** 45716b5 - "feat: Add interactive onboarding tour for new users"

---

## Key File Locations

### Main Application Files
- **Quest Database:** `public/quest-data.js` (3700+ lines)
  - Contains all 11 quest definitions
  - `LANGUAGE_LEARNING_INSTRUCTIONS` object (lines 13-228)
  - `QUEST_DATABASE.quests` object (lines 277-3682)

- **Main App Logic:** `public/app.js` (1900+ lines)
  - Quest rendering: `renderQuests()` function (lines 735-881)
  - Quest management and UI logic

- **HTML Structure:** `public/index.html`
  - Main UI layout
  - Version displayed in 3 locations (lines 433, 552, 632)

- **Package Info:** `package.json`
  - Version number (line 4)
  - Build scripts

### Configuration
- **Dev Server:** `dev-server.js`
  - API endpoints for Gemini, Claude, Translation, TTS
  - Port configurable via PORT environment variable

---

## Critical Rules Summary (ALL QUESTS)

Located in: `public/quest-data.js` → `LANGUAGE_LEARNING_INSTRUCTIONS.criticalRules`

### The 9 Critical Rules:

1. **SPANISH VOCABULARY - MANDATORY** (lines 27-44)
   - Must include 2-3 Spanish words per response
   - Translate MOST NOUNS with format: "palabra (translation)"

2. **LENGTH REQUIREMENT** (lines 46-62)
   - Maximum 2-3 SHORT sentences per response
   - Count sentences before sending

3. **ALWAYS END WITH QUESTION** (lines 64-95)
   - Every response must end with "?"
   - Exception: Final farewell after vocabulary review

4. **STAY ON QUEST TOPIC** (lines 97-100)
   - Follow quest storyline exactly

5. **BE ENCOURAGING, NOT NITPICKY** (lines 102-106)
   - Accept close answers
   - Focus on communication, not perfect grammar

6. **SCAFFOLD LEARNING** (lines 108-121)
   - Always provide options/choices
   - Never ask open-ended questions requiring unknown vocabulary

7. **ALWAYS TRANSLATE USER'S ENGLISH TO SPANISH** (lines 123-150)
   - Show Spanish equivalent for every English response
   - Pattern: Acknowledge → Translate → Ask to repeat → Continue

8. **ONE QUESTION PER RESPONSE** (lines 152-173)
   - Only one question per message
   - After corrections, WAIT for user to retry before continuing

9. **ADD DEPTH TO CONVERSATIONS** (lines 175-179)
   - Don't rush through quest steps
   - Check 2-3 locations before finding things

---

## Quest Prerequisites System

### How It Works:
Quests have a `prerequisites: []` array. Users must complete prerequisite quests to unlock new ones.

### Quest Unlock Flow:

**No Prerequisites (Always Available):**
- `quest-zero-onboarding` - The Adventure Begins

**After Onboarding:**
- `missing-guitar` - The Missing Guitar
- `market-day` - Market Day
- `pharmacy-visit` - La Farmacia
- `taxi-ride` - El Taxi
- `library-visit` - La Biblioteca
- `grocery-shopping` - El Supermercado
- `phone-call` - La Llamada Telefónica

**Sequential Story Chain:**
- `cafe-order` (requires: `market-day`)
- `surf-lesson` (requires: `cafe-order`)
- `fishing-don-pedro` (requires: `surf-lesson`)

### Display Logic:
Located in: `public/app.js` → `renderQuests()` function (lines 735-881)

- **Available:** Unlocked, not completed
- **Locked:** Shown greyed out with lock icon and prerequisite message
- **Completed:** At bottom with "Replay" button, always accessible

---

## Development Workflow

### Local Development:
```bash
# Start dev server (specify port)
PORT=5175 node dev-server.js

# Server provides:
# - http://localhost:5175
# - /api/gemini - AI endpoint
# - /api/claude - AI endpoint
# - /api/translate - Translation
# - /api/tts - Text-to-Speech
```

### Build and Deploy:
```bash
# Validate syntax
node -c public/quest-data.js
node -c public/app.js

# Build
npm run build

# Deploy to production
vercel --prod
```

### Version Management:
Update version in 4 locations:
1. `package.json` (line 4)
2. `public/index.html` (line 433) - Main menu
3. `public/index.html` (line 552) - Quiz view
4. `public/index.html` (line 632) - Quest view

---

## Important Patterns

### Adding New Quests:

1. **Quest Structure:**
```javascript
"quest-id": {
  id: "quest-id",
  title: "Quest Title",
  objective: "Quest description",
  difficulty: "beginner",
  requiredLevel: "A1",
  prerequisites: ["quest-zero-onboarding"],
  stages: {
    "1": {
      systemPrompt: `Character description...

${LANGUAGE_LEARNING_INSTRUCTIONS.criticalRules}
${LANGUAGE_LEARNING_INSTRUCTIONS.contentPolicy}
${LANGUAGE_LEARNING_INSTRUCTIONS.A1.approach}`,
      // ... stage config
    }
  }
}
```

2. **Always include in final stage:**
   - 8-step vocabulary review pattern
   - Quest-specific vocabulary (4 words)
   - All-Spanish sentence example with English translation

### Modifying AI Instructions:

**Global Rules (affects ALL quests):**
- Edit: `LANGUAGE_LEARNING_INSTRUCTIONS.criticalRules` (lines 24-179)
- These rules are referenced by every quest's systemPrompt

**Quest-Specific:**
- Edit individual quest's systemPrompt
- Still must include `${LANGUAGE_LEARNING_INSTRUCTIONS.criticalRules}`

---

## Known Issues & Considerations

### Text-to-Speech API:
- Currently shows permission errors in local dev
- Does not block functionality
- Error: "Cloud Text-to-Speech API has not been used in project"

### Vite Build Warnings:
- Script tags without type="module" warning during build
- These are intentional for ES6 module scripts
- Does not affect production build

---

## Testing Checklist

Before deploying major changes:

- [ ] JavaScript syntax validation (`node -c`)
- [ ] Local testing on dev server
- [ ] Test quest completion flow
- [ ] Verify vocabulary review works
- [ ] Check quest list organization (Available/Locked/Completed)
- [ ] Test quest prerequisites unlock correctly
- [ ] Verify AI follows one-question-per-response rule
- [ ] Confirm AI translates most nouns
- [ ] Build succeeds without errors
- [ ] Version number updated (if needed)
- [ ] Commit with descriptive message
- [ ] Deploy to production
- [ ] Verify production URL loads correctly

---

## Future Considerations

### Potential Improvements:
1. Add more quests (currently 11)
2. Add difficulty levels beyond A1
3. Implement achievement system
4. Add leaderboard/progress tracking
5. Add more languages beyond Spanish
6. Improve mobile responsiveness
7. Add quest categories/filtering

### User Feedback to Address:
- None currently pending

---

## Git Commit History (Recent)

### Latest Session Commits (NOT YET PUSHED):
```
45716b5 - feat: Add interactive onboarding tour for new users
7662833 - feat: Add comprehensive screen reader support with ARIA
0417c1f - feat: Add comprehensive keyboard navigation support
2587258 - feat: Add font size options for accessibility
348d830 - feat: Add high contrast mode for accessibility
d9aae5f - feat: Add swipe gesture navigation for mobile
13190bf - feat: Add mobile bottom navigation with thumb-friendly design
65233de - feat: Add Priority 3 UI micro-interactions and loading states
```

### Previous Session Commits (PUSHED TO REMOTE):
```
6de3f88 - feat: Require AI to translate most nouns in every response
9f8a52b - fix: Update onboarding quest vocabulary review to use all-Spanish sentences
7bab79f - feat: Add one-question-per-response rule and reorganize quest list
2fc6667 - feat: Add vocabulary review to all 10 remaining quests
14152fa - feat: Remove debug console from production
985f053 - feat: Enhance AI vocabulary review instructions
326cf93 - fix: Reduce onboarding quest message requirement to 8 (v1.2.2)
```

---

## Testing Scenarios for Priority 3 Features

### 1. Button Micro-Interactions Testing

**Test on:** Desktop and Mobile browsers

**Scenarios:**
- [ ] **Click any button** - Should scale down to 0.95 when clicked
- [ ] **Hover over buttons** (desktop) - Should lift up 2px with shadow
- [ ] **Click button** - Ripple effect should emanate from exact click point
- [ ] **Ripple animation** - Should complete in 600ms and disappear
- [ ] **Multiple rapid clicks** - Each click should create new ripple without breaking
- [ ] **Disabled buttons** - Should NOT show ripple or hover effects

**Expected Results:**
- Buttons feel tactile and responsive
- Ripple is smooth and matches Material Design style
- No performance issues or lag

---

### 2. Smooth Scrolling Testing

**Test on:** All pages with scrollable content

**Scenarios:**
- [ ] **Click skip-to-content link** - Should smoothly scroll to main content
- [ ] **Scroll quest list** - Should be smooth, not instant jumps
- [ ] **Programmatic scrolling** - Any JavaScript-triggered scrolls should be smooth
- [ ] **Anchor links** - Should smoothly scroll to target sections

**Expected Results:**
- All scrolling is gradual and natural
- No jarring instant jumps
- Works consistently across all browsers

---

### 3. Skeleton Loading States Testing

**Test on:** Any loading screens

**Scenarios:**
- [ ] **Open correction modal** - Should show animated skeleton instead of "Loading..."
- [ ] **Skeleton animation** - Should have smooth gradient shimmer effect
- [ ] **Dark mode skeleton** - Should use darker colors in dark mode
- [ ] **Animation performance** - Should be smooth, no stuttering
- [ ] **Multiple skeletons** - Should all animate in sync

**Expected Results:**
- Modern, professional loading appearance
- Smooth 1.5s infinite animation
- Clear indication that content is loading

---

### 4. Mobile Bottom Navigation Testing

**Test on:** Mobile devices and tablet (≤1024px width)

**Scenarios:**
- [ ] **Resize browser to mobile** - Bottom nav should appear
- [ ] **Resize to desktop** - Bottom nav should disappear
- [ ] **Click Quests button** - Should show quest list and set as active
- [ ] **Click Quiz button** - Should show placement test view
- [ ] **Click Profile button** - Should open settings modal
- [ ] **Active indicator** - Active button should have top gradient line
- [ ] **iPhone notch** - Should respect safe-area-inset-bottom
- [ ] **Touch targets** - All buttons should be easy to tap (64px minimum)
- [ ] **Backdrop blur** - Should have glassmorphism effect

**Expected Results:**
- Only visible on mobile/tablet
- Easy thumb-friendly access to main features
- Clear active state indication
- No content hidden behind nav bar

---

### 5. Swipe Gesture Navigation Testing

**Test on:** Touch-enabled devices (mobile, tablet)

**Scenarios:**
- [ ] **Start a quest** - Enter chat view
- [ ] **Swipe right** - Should return to quest list
- [ ] **Short swipe (<50px)** - Should NOT trigger navigation
- [ ] **Vertical scroll while swiping** - Should NOT trigger navigation if vertical > 100px
- [ ] **Swipe on button** - Should NOT trigger, button should work normally
- [ ] **Swipe on input field** - Should NOT trigger, input should work normally
- [ ] **TTS playing** - Swipe back should stop audio
- [ ] **Mobile nav update** - Swipe back should update bottom nav to "Quests"

**Expected Results:**
- Natural, app-like navigation
- Only triggers on intentional horizontal swipes
- Doesn't interfere with normal UI interactions

---

### 6. High Contrast Mode Testing

**Test on:** All browsers, settings accessible

**Scenarios:**
- [ ] **Open Settings** - Navigate to Accessibility section
- [ ] **Toggle high contrast** - Should immediately apply
- [ ] **Light high contrast** - White bg, black text, blue buttons, 2px borders
- [ ] **Switch to dark mode** - High contrast should adapt (black bg, white text, cyan buttons)
- [ ] **Focus elements** - Should have 3px outlines
- [ ] **Gradients removed** - Background should be solid color
- [ ] **Animations removed** - No gradient animations
- [ ] **Refresh page** - Setting should persist from localStorage
- [ ] **All UI elements** - Chat bubbles, buttons, inputs should all be high contrast

**Expected Results:**
- Maximum visibility for users with vision impairments
- Clean, readable interface with clear boundaries
- Consistent across all app sections
- Persists across sessions

---

### 7. Font Size Options Testing

**Test on:** All browsers, settings accessible

**Scenarios:**
- [ ] **Open Settings > Accessibility** - Font size dropdown should show 4 options
- [ ] **Select Small** - Text should reduce to 14px
- [ ] **Select Normal** - Text should be 16px (default)
- [ ] **Select Large** - Text should increase to 18px
- [ ] **Select Extra Large** - Text should increase to 20px
- [ ] **Heading scaling** - H1, H2, H3 should scale proportionally
- [ ] **All text elements** - Body text, buttons, labels should all scale
- [ ] **Refresh page** - Font size should persist from localStorage
- [ ] **Read quest text** - Should be clearly readable at all sizes

**Expected Results:**
- Text is easily readable at preferred size
- No layout breaking at any size
- Headings maintain visual hierarchy
- Setting persists across sessions

---

### 8. Keyboard Navigation Testing

**Test on:** Desktop browsers with keyboard

**Scenarios:**
- [ ] **Press Tab** - Should see visible focus indicators appear
- [ ] **Navigate with Tab** - Should move through all interactive elements
- [ ] **Press Escape in chat** - Should return to quest list
- [ ] **Press Escape with modal open** - Should close modal
- [ ] **Press Ctrl/Cmd + K** - Should open settings
- [ ] **Press Ctrl/Cmd + K again** - Should close settings
- [ ] **Press Ctrl/Cmd + /** - Should return to quest view from chat
- [ ] **Click with mouse** - Focus indicators should disappear
- [ ] **Press Tab after mouse** - Focus indicators should reappear
- [ ] **Tab to skip-link** - Should reveal "Skip to main content" link
- [ ] **Activate skip-link** - Should jump to main content

**Expected Results:**
- Can navigate entire app with keyboard only
- Focus always visible when using keyboard
- Shortcuts work consistently
- Skip-link allows bypassing repetitive navigation

---

### 9. Screen Reader Support Testing

**Test on:** NVDA (Windows), JAWS (Windows), VoiceOver (Mac/iOS), TalkBack (Android)

**Scenarios:**
- [ ] **Navigate app structure** - Should announce roles (main, banner, navigation)
- [ ] **Navigate quest list** - Should announce as list with listitem roles
- [ ] **Click bottom nav buttons** - Should announce label and state
- [ ] **Active navigation** - Should announce "current page" for active item
- [ ] **Open settings** - Should announce "Settings dialog"
- [ ] **View changes** - Should announce "Navigated to [view name]"
- [ ] **Decorative icons** - Should skip icons with aria-hidden
- [ ] **Button labels** - All buttons should have clear labels
- [ ] **Form controls** - All inputs should have associated labels
- [ ] **Live region** - Should announce important updates politely

**Expected Results:**
- Screen reader users can navigate entire app
- Clear announcements for all interactions
- No confusing or missing labels
- Important updates announced automatically

---

### 10. Onboarding Tour Testing

**Test on:** First-time users (clear localStorage)

**Scenarios:**
- [ ] **First login** - Tour should auto-start after 1 second
- [ ] **Step 1** - Should highlight welcome message with tooltip below
- [ ] **Click Next** - Should advance to step 2
- [ ] **Step 2** - Should highlight quest list with tooltip above
- [ ] **Click Next** - Should advance to step 3
- [ ] **Step 3** - Should highlight settings button with tooltip below
- [ ] **Click Next** - Should advance to step 4
- [ ] **Step 4** - Should highlight mobile nav (if visible) with tooltip above
- [ ] **Click Finish** - Tour should end and save completion
- [ ] **Progress dots** - Should show current step (e.g., 2nd dot active on step 2)
- [ ] **Click Skip** - Should immediately end tour and save completion
- [ ] **Refresh page** - Tour should NOT show again
- [ ] **Run window.restartOnboardingTour()** - Tour should restart
- [ ] **Tooltip arrows** - Should point toward target element
- [ ] **Tooltip positioning** - Should stay on screen at all viewport sizes
- [ ] **Dark mode** - Tooltip should use dark theme colors

**Expected Results:**
- Smooth, professional onboarding experience
- Clear guidance for new users
- Can be skipped at any time
- Doesn't repeat after completion
- Can be manually restarted for testing

---

### Integration Testing Scenarios

**Test all features working together:**

1. **Mobile User Journey:**
   - [ ] Open app on mobile device
   - [ ] See onboarding tour
   - [ ] Complete tour
   - [ ] Use bottom navigation to switch views
   - [ ] Swipe gestures work in quest chat
   - [ ] All buttons show micro-interactions
   - [ ] Skeleton loaders appear when needed

2. **Accessibility User Journey:**
   - [ ] Enable high contrast mode
   - [ ] Increase font size to Large
   - [ ] Navigate app with keyboard only
   - [ ] Use screen reader throughout
   - [ ] All features remain functional
   - [ ] Settings persist across reload

3. **Visual Polish Check:**
   - [ ] All buttons have ripple effects
   - [ ] Smooth scrolling everywhere
   - [ ] Skeleton loaders instead of spinners
   - [ ] No jarring transitions
   - [ ] Professional, polished feel

---

### Regression Testing

**Ensure Priority 3 didn't break existing features:**

- [ ] Login/signup still works
- [ ] Placement test still works
- [ ] Quest completion still works
- [ ] Chat with AI still works
- [ ] Dark mode toggle still works
- [ ] TTS audio still works
- [ ] Translation still works
- [ ] Settings save correctly
- [ ] All 11 quests load correctly

---

### Performance Testing

**Ensure no performance degradation:**

- [ ] Page load time unchanged
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks with ripple effects
- [ ] Swipe gestures don't lag
- [ ] Onboarding tour doesn't block UI
- [ ] No console errors
- [ ] Mobile performance acceptable

---

## Deployment Checklist (For Next Session)

When ready to deploy these changes:

1. **Pre-Deployment:**
   - [ ] Run all testing scenarios above
   - [ ] Validate JavaScript syntax: `node -c public/app.js`
   - [ ] Validate JavaScript syntax: `node -c public/quest-data.js`
   - [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
   - [ ] Test on multiple devices (mobile, tablet, desktop)
   - [ ] Test dark mode with all new features
   - [ ] Verify high contrast mode works
   - [ ] Test keyboard navigation thoroughly
   - [ ] Test with screen reader

2. **Build:**
   ```bash
   npm run build
   ```
   - [ ] Build completes without errors
   - [ ] Check dist/ folder has all files

3. **Deploy:**
   ```bash
   git push origin main
   vercel --prod
   ```

4. **Post-Deployment:**
   - [ ] Verify production URL loads: https://language-by-google-reddkue0r-richard-barnetts-projects.vercel.app
   - [ ] Test onboarding tour on production
   - [ ] Test mobile bottom nav on production
   - [ ] Test accessibility features on production
   - [ ] Check console for any errors
   - [ ] Verify version number shows v1.3.0

---

## Contact & Resources

- **Repository:** Language-by-Google (GitHub)
- **Deployment:** Vercel
- **Framework:** Vite + Vanilla JS
- **AI APIs:** Google Gemini, Claude
- **Database:** Firebase/Firestore
- **Translation:** Google Translate API

---

## Session End Notes

### Session Part 1 (Morning):
- ✅ Committed to main branch
- ✅ Pushed to GitHub
- ✅ Built successfully
- ✅ Deployed to production
- ✅ Documented in this file

### Session Part 2 (Afternoon) - Priority 3 UI-REDESIGN:
- ✅ All 10 tasks completed (100%)
- ✅ Committed to local repository (8 commits)
- ⚠️ **NOT YET PUSHED** to remote repository
- ⚠️ **NOT YET DEPLOYED** to production
- ✅ Fully documented with testing scenarios
- ✅ Ready for testing and deployment

**Priority 3 Achievements:**
- 🎨 3 Micro-interactions features (buttons, scrolling, loading)
- 📱 2 Mobile optimization features (bottom nav, swipe gestures)
- ♿ 4 Accessibility features (high contrast, font sizes, keyboard nav, screen reader)
- 👋 1 Onboarding feature (interactive tour)

**Lines of Code Added:** ~1,200 lines across HTML, CSS, and JavaScript

**Next Steps for Next Session:**
1. Test all Priority 3 features using the testing scenarios above
2. Fix any bugs discovered during testing
3. Push commits to remote: `git push origin main`
4. Deploy to production: `vercel --prod`
5. Verify all features work on production
6. Move on to next phase of development (Priority 4 or Phase 3 from quest improvements)

**Quick Test Command:**
```bash
# Restart onboarding tour for testing
window.restartOnboardingTour()

# Test screen reader announcements
window.announceToScreenReader('Testing screen reader')
```

**Next session can pick up from here by reading this file first.**
