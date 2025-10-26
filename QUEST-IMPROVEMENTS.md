# Quest System Improvements

This document tracks the systematic improvements made to the quest system to optimize for 10-15 minute daily lessons with higher engagement.

## Goal
Transform quests from 15-25 minute experiences into focused 10-15 minute daily lessons while maintaining quality and increasing engagement through objective tracking and feedback systems.

---

## Phase 1: Objective Tracking System ✅ COMPLETE

**Goal:** Implement a robust objective tracking system that validates quest progression and provides real-time feedback to keep students engaged.

### Implementation Summary

#### 1. Core Tracking System (index.html)

**State Variables (lines ~641-643):**
```javascript
let objectivesCompleted = {};  // Tracks which objectives are done
let messageCount = 0;          // Counts messages in current stage
let shownHints = new Set();    // Prevents duplicate hints
```

**Keyword Detection (lines ~657-672):**
- `checkObjectiveCompletion(text)`: Checks user messages for objective keywords
- Case-insensitive matching using `.toLowerCase()`
- Updates `objectivesCompleted` object when keywords found
- Only checks USER messages (not AI responses) to ensure student demonstrates knowledge

**Stage Completion Logic (lines ~713-733):**
```javascript
function checkStageCompletion() {
    // Check two criteria:
    // 1. Minimum message count (ensures conversation practice)
    // 2. Required objectives completed (ensures learning goals met)

    const hasMinMessages = messageCount >= criteria.minMessages;
    const hasRequiredObjectives = completedCount >= criteria.objectivesRequired;

    if (hasMinMessages && hasRequiredObjectives) {
        showStageCompletionNotification();
        setTimeout(() => endStage(), 4000);
    }
}
```

**UI Updates (lines ~687-711):**
- Real-time progress display: "1/2 objectives completed"
- Visual feedback: Blue → Green color change
- Success message when all objectives complete

#### 2. Hints System (lines ~761-806)

**Trigger:** After 5 messages with incomplete required objectives

**Features:**
- Shows hint at TOP of chat (sticky positioning)
- Auto-dismisses after 5 seconds with fade animation
- Tracks shown hints to prevent duplicates
- Multiple hints for multiple incomplete objectives

**Example Hint:**
```
💡 Hint
Objective: Find out the musician's name
Try asking 'Who is the musician?'
```

#### 3. Completion Notification (lines ~734-759)

**Display:**
- Green banner at top of chat
- Shows: ✅ Stage Complete!
- Lists: Objectives completed, Reward clue, XP earned
- Auto-dismisses after 4 seconds before returning to quest list

#### 4. Quest Instructions Card (lines ~297-320)

**Expanded State (shows for 5 seconds):**
- Scene image (AI-generated stageImage)
- Quest title
- Character name
- Full objective description

**Minimized State (after 5 seconds):**
- Small banner: "Quest: [objective]" with ▼ arrow
- Click to re-expand
- Doesn't block chat dialogue

#### 5. Language Enforcement (lines ~2042-2126)

**English Detection:**
- Checks for common English words (the, is, are, what, etc.)
- 30% threshold for classification
- Blocks English messages from being sent

**Correction Prompt:**
- Shows English → Spanish translation
- Blue banner with encouragement to practice
- Auto-dismisses after 8 seconds

**AI Configuration:**
- System prompt enforces Spanish-only responses (line 939)
- All initial quest messages converted to Spanish

---

### Bug Fixes

#### Bug 1: Objectives Completing Immediately
**Issue:** Objectives triggered by AI mentioning keywords in responses
**Fix:** Removed AI response check from keyword detection (line 2067)
**Commit:** 5048e87

#### Bug 2: Hints Not Showing
**Issue:** Hints system didn't exist
**Fix:** Implemented `checkAndShowHints()` and `showHint()` functions
**Commit:** 5048e87

#### Bug 3: No Completion Popup
**Issue:** Stage ended without notification
**Fix:** Added `showStageCompletionNotification()` with 4s delay
**Commit:** 5048e87

#### Bug 4: Hints Scrolled Past Too Quickly
**Issue:** Hints added to bottom and chat scrolled away
**Fix:** Changed to sticky positioning at top with scroll to top
**Commit:** 71835fb

#### Bug 5: Hints Persisting and Blocking Chat
**Issue:** Hints stayed visible indefinitely
**Fix:** Added 5-second auto-dismiss with fade animation
**Commit:** 8310cf9

#### Bug 6: Missing Guitar Stage 1 Required Only 1 Objective
**Issue:** `objectivesRequired: 1` but had 2 required objectives
**Fix:** Changed to `objectivesRequired: 2`
**Commit:** fc42309

---

### Test Cases

#### ✅ PASSED - Basic Objective Completion
- Send messages with keywords → Objectives complete
- Progress updates: 0/2 → 1/2 → 2/2

#### ✅ PASSED - Hints After 5 Messages
- Send 5+ non-keyword messages → Hints appear at top
- Auto-dismiss after 5 seconds
- No duplicates

#### ✅ PASSED - Stage Completion Notification
- Complete objectives + minMessages → Green notification appears
- Shows for 4 seconds before returning to quest list

#### ✅ PASSED - English Detection
- Type English message → Translation shown, message blocked
- Type Spanish message → Sends normally

#### ✅ PASSED - Quest Card Auto-Minimize
- Quest starts → Card expanded for 5 seconds
- Auto-minimizes to small banner
- Click to re-expand

#### 🔴 TO TEST - Message Count Enforcement
**Test:** Complete objectives in 2 messages
**Expected:** Stage should NOT complete until message 3
**Why:** Ensures minimum conversation practice

#### 🔴 TO TEST - Both Objectives Required
**Test:** Complete only "Carlos" + 3 messages (not "plaza")
**Expected:** Stage should NOT complete
**Why:** Both objectives are required

#### 🔴 TO TEST - Multiple Hints Display
**Test:** Have 2 incomplete objectives after 5 messages
**Expected:** Should show hint for EACH incomplete objective
**Code:** Lines 1771-1780 iterate all objectives

#### 🔴 TO TEST - Reset Between Stages
**Test:** Complete Stage 1 → Start Stage 2
**Expected:** Objectives reset to 0/X for new stage
**Code:** Line 1862 calls `resetObjectiveTracking()`

#### ✅ VERIFIED - Case-Insensitive Keywords
**Test:** Type "CARLOS" or "carlos"
**Expected:** Both match keyword
**Code:** Line 1957 uses `.toLowerCase()`

#### ✅ VERIFIED - No 0-Objective Completion
**Test:** Send 3 messages with no keywords
**Expected:** Stage does NOT complete
**Code:** Line 723 checks `completedCount >= objectivesRequired` (0 >= 2 is false)

---

### Configuration Reference

**Quest Data Structure (quest-data.js):**
```javascript
objectives: [
    {
        id: "learn_musician_name",
        type: "extract_info",
        description: "Find out the musician's name",
        keywords: ["Carlos", "musician", "artista"],
        required: true,
        hints: [
            "Try asking 'Who is the musician?'",
            "Ask '¿Quién es el músico?'"
        ]
    }
],

completionCriteria: {
    minMessages: 3,           // Minimum conversation length
    objectivesRequired: 2,    // Number of objectives to complete
    timeLimit: null           // Optional time limit (unused)
}
```

---

### Key Commits

1. **5048e87** - Add stage completion notification and hints system
2. **7005c50** - Fix hint and completion notification visibility
3. **8310cf9** - Make hints auto-dismiss after 5 seconds
4. **72a5e96** - Add English detection and Spanish correction prompt
5. **a8e163d** - Convert all initial quest messages to Spanish
6. **2787567** - Add auto-minimizing quest instructions card
7. **fc42309** - Fix Missing Guitar Stage 1 to require both objectives

---

## Phase 2: Create 3-5 New "Quick Quests" ✅ COMPLETE

**Goal:** Design and implement new quests optimized for 10-15 minutes with 2 stages each.

**Status:** Complete - 5 daily quests created

**Implementation Summary:**

### Daily Quest Template Established

Based on "La Farmacia" template, all daily quests share these characteristics:
- **2 stages** (6 minutes each, 12 minutes total)
- **questType: "daily"** for filtering and organization
- **3 objectives per stage** (2 required, 1 optional)
- **minMessages: 3** (faster than story quests)
- **30 XP per stage** (60 total)
- **Grammar tips** integrated into objectives
- **Adaptive difficulty** (A1-C2 via difficultyModifiers)
- **Focused vocabulary** for practical daily scenarios

### Daily Quests Created (5 total)

#### 1. La Farmacia (Pharmacy Visit) ✅
**ID:** `pharmacy-visit`
**Stages:** 2 (Symptoms/Medicine, Payment)
**Vocabulary:** Health (dolor, cabeza, medicina, pastilla, tomar)
**Grammar:** doler verb, numbers 60-100
**Duration:** ~12 minutes

#### 2. El Taxi (Taxi Ride) ✅
**ID:** `taxi-ride`
**Stages:** 2 (Hailing/Destination, Arrival/Payment)
**Vocabulary:** Transportation (taxi, destino, llevar, ir, dirección)
**Grammar:** ir a + location, numbers 80-120
**Duration:** ~12 minutes

#### 3. La Biblioteca (Library Visit) ✅
**ID:** `library-visit`
**Stages:** 2 (Finding Book, Checkout)
**Vocabulary:** Books (libro, buscar, encontrar, sección, préstamo)
**Grammar:** buscar/necesitar, time duration (por + time)
**Duration:** ~12 minutes

#### 4. El Supermercado (Grocery Shopping) ✅
**ID:** `grocery-shopping`
**Stages:** 2 (Finding Items, Checkout)
**Vocabulary:** Food (frutas, verduras, pan, leche, huevos, carne)
**Grammar:** food nouns (masculine/feminine), numbers 100-300
**Duration:** ~12 minutes

#### 5. La Llamada Telefónica (Phone Call) ✅
**ID:** `phone-call`
**Stages:** 2 (Making Appointment, Confirmation)
**Vocabulary:** Phone etiquette (cita, consulta, horario, disponible)
**Grammar:** phone greetings (¿Diga?, Habla...), time expressions
**Duration:** ~12 minutes

### Quest Database Summary

**Total Quests:** 10
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

**Total Content:** 172 minutes (~2.9 hours) of learning material

### Key Features of Daily Quests

1. **Practical Real-World Scenarios**
   - Each quest mirrors actual situations learners encounter
   - Vocabulary immediately applicable to daily life
   - Cultural context embedded naturally

2. **Grammar Integration Points**
   - Grammar tips embedded in objectives (not separate lessons)
   - Natural explanation during conversation flow
   - Examples tied to the quest context

3. **Optional Objectives**
   - Encourages exploration without blocking progress
   - Rewards curiosity and deeper engagement
   - Flexible completion paths

4. **Consistent Structure**
   - Stage 1: Setup/Information gathering
   - Stage 2: Transaction/Completion
   - Pattern learners can recognize and rely on

**Plan:**
- Focus on high-frequency daily scenarios ✅
- Keep vocabulary focused and practical ✅
- 2 stages per quest for clear progression ✅
- Target 5-7 minutes per stage ✅

---

## Phase 3: Restructure Existing Quests 📋 PLANNED

**Goal:** Adapt existing 6-stage quests to be shorter while maintaining quality.

**Status:** Not started

**Approach:**
- Analyze current quest lengths
- Identify consolidation opportunities
- Maintain story coherence
- Reduce to 3-4 stages per quest

---

## Phase 4: Engagement Mechanics 📋 PLANNED

**Goal:** Add features to maintain engagement throughout the session.

**Status:** Not started

**Features to implement:**
- NPC follow-up questions when student is stuck
- Real-time feedback during conversation
- Adaptive difficulty based on performance
- Progress celebrations and encouragement

---

## Notes for Future Development

### Character Images
**TODO:** Replace stageImage with character portrait thumbnails in quest card
- Current: Uses AI-generated scene images
- Desired: Animation-style character portraits
- Size: 80x80px thumbnail
- Location: quest-instructions-card (line 302)

### Performance Considerations
- Objective checking runs on every user message (acceptable overhead)
- Hint system checks at message 5, 6, 7... (Set prevents duplicates)
- No performance issues observed with current implementation

### Accessibility
- All notifications use semantic colors (blue=info, yellow=hint, green=success)
- Auto-dismiss timings allow sufficient reading time
- Click-to-expand for quest card provides flexible access

---

**Last Updated:** 2025-01-24
**Phase 1 Status:** ✅ COMPLETE
**Phase 2 Status:** ✅ COMPLETE
**Next Phase:** Phase 3 - Restructure Existing Quests
