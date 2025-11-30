# Quest System Improvements - Testing Scenario

**Date:** 2025-11-23
**Server:** http://localhost:3000
**Features to Test:** Objective Tracking, Hint System, Quest Progression & Locking, Language Enforcement

---

## Pre-Test Setup

### 1. Access the Application
- Open your browser to: **http://localhost:3000**
- For the progression tests, it is recommended to use a new or reset user profile to ensure the onboarding flow is triggered.

### 2. User State
- **New User:** A user who has not completed any quests.
- **Existing User:** A user who has completed some quests.

---

## Test Scenario 1: Onboarding and Quest Progression 🚀

**Goal:** Verify that new users are correctly onboarded and that the quest locking system works as intended.

### Steps for a New User:
1.  Log in as a new user (or reset your user in the debug panel).
2.  After any placement questions, you should be automatically redirected to the "Quest Zero" onboarding quest.
3.  **EXPECTED RESULT:**
    *   The "Quest Zero" introduction card appears. You cannot access the main quest map.
4.  Complete the onboarding quest.
5.  After completion, you should be taken to the quest map.
6.  **EXPECTED RESULT:**
    *   The "Missing Guitar" quest should now be unlocked.
    *   Other quests that require "Missing Guitar" as a prerequisite should show a 🔒 lock icon and be unclickable.

### Steps for an Existing User:
1.  Log in as a user who has completed "Missing Guitar".
2.  Navigate to the quest map.
3.  **EXPECTED RESULT:**
    *   The quest that has "Missing Guitar" as a prerequisite should now be unlocked and clickable.

### Verification Checklist:
- [ ] New user is forced to start "Quest Zero".
- [ ] Locked quests are grayed out and display a 🔒 icon.
- [ ] Tooltip on a locked quest shows the prerequisites.
- [ ] Completing a prerequisite quest unlocks the subsequent quest on the map.
- [ ] User progress (completed quests, onboarding status) is saved and persists after a page refresh.

---

## Test Scenario 2: Objective Tracking System 🎯

**Goal:** Verify that the objective tracking system correctly identifies keywords, updates the UI, and respects completion criteria.

### Steps:
1.  Start the "Missing Guitar" quest (Stage 1).
2.  The quest instructions card should appear, listing the objectives (e.g., "Find out the musician's name", "Find out the location").
3.  The progress should show "0/2 objectives completed".
4.  Send a message containing a keyword for the first objective (e.g., "What is the musician's name?").
5.  **EXPECTED RESULT:**
    *   The progress UI updates to "1/2 objectives completed".
    *   The completed objective may change color or get a checkmark.
6.  Send a message that does **not** contain the second objective's keyword.
7.  **EXPECTED RESULT:**
    *   The stage should **not** complete, even if you meet the minimum message count.
8.  Send a message containing the keyword for the second objective (e.g., "Where is the plaza?").
9.  **EXPECTED RESULT:**
    *   The progress UI updates to "2/2 objectives completed".
    *   A success message like "All objectives complete!" may appear.
10. Send one more message to meet the `minMessages: 3` criteria.
11. **EXPECTED RESULT:**
    *   The stage completion notification appears, and the stage ends.

### Verification Checklist:
- [ ] Objective progress UI updates in real-time.
- [ ] Keyword detection is case-insensitive ("Carlos" and "carlos" both work).
- [ ] Stage does not complete if `objectivesRequired` are not met, regardless of message count.
- [ ] Stage does not complete if `minMessages` is not met, regardless of objective completion.
- [ ] Stage completes correctly when both `minMessages` and `objectivesRequired` are met.
- [ ] Objective tracking resets for the next stage.

---

## Test Scenario 3: Hint System 💡

**Goal:** Verify the hint system provides timely and useful hints when a user is stuck.

### Steps:
1.  Start a quest (e.g., "Missing Guitar").
2.  Send 5 messages that do **not** contain any objective keywords.
3.  **EXPECTED RESULT:**
    *   A hint banner should appear at the top of the chat.
    *   The hint should be relevant to one of the incomplete objectives (e.g., "💡 Hint: Try asking 'Who is the musician?'").
    *   The hint banner is "sticky" and stays at the top of the screen.
4.  Wait for 5-8 seconds.
5.  **EXPECTED RESULT:**
    *   The hint banner should auto-dismiss with a fade animation.
6.  If multiple objectives are incomplete, continue sending non-keyword messages.
7.  **EXPECTED RESULT:**
    *   A hint for the *other* incomplete objective should appear after a few more messages.
    *   The system should not show a hint that has already been shown in the current stage.

### Verification Checklist:
- [ ] Hint appears after 5 non-progressing messages.
- [ ] Hint is relevant to an incomplete objective.
- [ ] Hint is positioned at the top of the chat view.
- [ ] Hint auto-dismisses after a short period.
- [ ] The system cycles through hints for multiple incomplete objectives.
- [ ] A previously shown hint is not shown again in the same stage.

---

## Test Scenario 4: Language Enforcement 🇪🇸

**Goal:** Verify that the system blocks English messages and provides a Spanish correction.

### Steps:
1.  Start any quest.
2.  In the chat input, type a message in English (e.g., "Hello, how are you?").
3.  Try to send the message.
4.  **EXPECTED RESULT:**
    *   The message is **not** sent to the chat.
    *   A blue banner appears with a Spanish translation/suggestion (e.g., "Try saying: 'Hola, ¿cómo estás?'").
    *   The banner auto-dismisses after about 8 seconds.
5.  Type a message in Spanish (e.g., "Hola, cómo estás?").
6.  **EXPECTED RESULT:**
    *   The message is sent and appears in the chat normally.

### Verification Checklist:
- [ ] English messages are blocked from being sent.
- [ ] A correction prompt with a Spanish translation is displayed.
- [ ] The correction prompt auto-dismisses.
- [ ] Spanish messages are sent without issue.

---

## Test Scenario 5: "Quick Quest" Validation ⚡

**Goal:** Verify that the new, shorter "daily" quests are functional.

### Steps:
1.  From the quest map, select one of the new daily quests (e.g., "La Farmacia").
2.  **EXPECTED RESULT:**
    *   The quest starts normally with a character introduction.
3.  Play through the first stage, completing the 3 objectives.
4.  **EXPECTED RESULT:**
    *   The objective tracker and hint system work as expected.
    *   The stage completes after meeting the criteria.
5.  Proceed to the second stage and complete it.
6.  **EXPECTED RESULT:**
    *   The quest completes, and the celebration effects are shown.
    *   You are returned to the quest map.

### Verification Checklist:
- [ ] New daily quests can be started and completed.
- [ ] All quest system features (objectives, hints) function correctly within the new quests.
- [ ] The 2-stage structure works, and the quest finishes after the second stage.
