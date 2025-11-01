# ConvoQuest Development Session Notes

## Last Updated: 2025-11-01

---

## Current Project State

### Version
- **Current Version:** 1.2.5
- **Last Deployed:** 2025-11-01
- **Production URL:** https://language-by-google-reddkue0r-richard-barnetts-projects.vercel.app
- **Dev Server Port:** 5175 (http://localhost:5175)

### Repository
- **Branch:** main
- **Last Commit:** 6de3f88 - "feat: Require AI to translate most nouns in every response"
- **Uncommitted Changes:** None (all changes committed and deployed)

---

## Recent Session Changes (2025-11-01)

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

## Contact & Resources

- **Repository:** Language-by-Google (GitHub)
- **Deployment:** Vercel
- **Framework:** Vite + Vanilla JS
- **AI APIs:** Google Gemini, Claude
- **Database:** Firebase/Firestore
- **Translation:** Google Translate API

---

## Session End Notes

All changes from this session have been:
- ✅ Committed to main branch
- ✅ Pushed to GitHub
- ✅ Built successfully
- ✅ Deployed to production
- ✅ Documented in this file

**Next session can pick up from here by reading this file first.**
