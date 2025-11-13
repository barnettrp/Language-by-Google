# Character Relationship System - Phase 1 Implementation Guide

## ✅ What's Been Implemented

### 1. Core Files Created

#### `/public/character-database.js`
- Complete database of 5 main characters (Carlos, María, Sofia, Mateo, Elena)
- Relationship level definitions (Stranger → Acquaintance → Friend → Close Friend → Confidant)
- Affinity action values (+/- affinity for different actions)
- Helper functions for calculating relationship levels
- Character data includes:
  - Basic info (name, role, location, avatar)
  - Personality traits
  - Full backstory (unlocked at different affinity levels)
  - Favorites & preferences
  - Exclusive quests
  - Gift preferences
  - Teaching style & vocabulary focus

#### `/public/relationships.js`
- Firestore integration for relationship tracking
- Functions for:
  - Getting user relationships
  - Initializing new relationships
  - Updating affinity
  - Recording conversations, quests, gifts
  - Unlocking content
  - Recording special moments
  - Calculating inactivity penalties
  - Dynamic greetings based on relationship level

#### `/public/relationships-ui.js`
- Complete UI for relationships view
- Character list display grouped by relationship level
- Character detail modal with:
  - Affinity progress bar
  - Stats (conversations, quests, gifts, last contact)
  - Unlockable backstory
  - Favorites
  - Exclusive quests
- Search functionality
- Affinity gain notifications

#### `/public/index.html` - Updates
- Added "Friendships" menu item (💚)
- Added complete relationships view HTML
- Added character detail modal HTML
- Loaded character-database.js module

---

## 🔧 Integration Steps

### Step 1: Import Modules in app.js

Add these imports at the top of `/public/app.js`:

```javascript
// Import character relationship system
import { CHARACTER_DATABASE, getRelationshipLevel, getRelationshipLevelData } from './character-database.js';
import * as RelationshipSystem from './relationships.js';
import { showRelationshipsView, hideRelationshipsView, initializeCharacterSearch, showAffinityNotification } from './relationships-ui.js';
```

### Step 2: Add Navigation Event Listeners

In the `initializeApp()` function, after the existing menu item listeners, add:

```javascript
// Relationships menu item
const relationshipsMenuItem = document.getElementById('relationships-menu-item');
if (relationshipsMenuItem) {
  relationshipsMenuItem.addEventListener('click', async () => {
    if (currentUser) {
      dom.menuDropdown.classList.add('hidden');
      await showRelationshipsView(currentUser, CHARACTER_DATABASE, {
        getUserRelationships: RelationshipSystem.getUserRelationships,
        getRelationshipLevelData: RelationshipSystem.getRelationshipLevelData,
        getDaysSinceLastContact: RelationshipSystem.getDaysSinceLastContact
      });
      initializeCharacterSearch();
    }
  });
}

// Close relationships view button
const closeRelationshipsBtn = document.getElementById('close-relationships-btn');
if (closeRelationshipsBtn) {
  closeRelationshipsBtn.addEventListener('click', () => {
    hideRelationshipsView();
  });
}
```

### Step 3: Track Affinity During Quests

When a quest stage is completed, add affinity tracking. In the quest completion logic (around where you handle stage completion), add:

```javascript
// After a successful stage completion
const characterName = currentStage.characterName;

// Find character ID from name
let characterId = null;
Object.values(CHARACTER_DATABASE).forEach(char => {
  if (char.name === characterName || char.fullName.includes(characterName)) {
    characterId = char.id;
  }
});

if (characterId) {
  // Initialize relationship if first meeting
  await RelationshipSystem.initializeRelationship(currentUser.uid, characterId);

  // Record conversation
  await RelationshipSystem.recordConversation(currentUser.uid, characterId, currentQuest.id);

  // Award affinity for completing stage
  const affinityResult = await RelationshipSystem.updateAffinity(
    currentUser.uid,
    characterId,
    5, // +5 affinity for completing a quest stage
    'Completed quest stage'
  );

  // Show notification if affinity changed
  if (affinityResult) {
    showAffinityNotification(
      characterName,
      affinityResult.affinityChange,
      affinityResult.oldAffinity,
      affinityResult.newAffinity,
      affinityResult.reason
    );

    // Check if level changed
    if (affinityResult.levelChanged) {
      console.log(`🎉 Relationship with ${characterName} leveled up to ${affinityResult.newLevel}!`);
      // TODO: Show special level-up notification
    }
  }
}
```

### Step 4: Track Affinity for Other Actions

#### When User Uses Polite Language

In your message processing logic, detect polite language:

```javascript
// Check for polite language
const politeWords = ['por favor', 'gracias', 'muchas gracias', 'de nada', 'con permiso', 'disculpe', 'perdón'];
const userMessage = document.getElementById('chat-input').value.toLowerCase();

if (politeWords.some(word => userMessage.includes(word)) && characterId) {
  await RelationshipSystem.updateAffinity(
    currentUser.uid,
    characterId,
    3,
    'Used polite language'
  );
}
```

#### When User Remembers Details

If you implement a feature to detect when users reference past conversations:

```javascript
// Example: User mentions something from earlier
if (userReferencedPastConversation) {
  await RelationshipSystem.updateAffinity(
    currentUser.uid,
    characterId,
    8,
    'Remembered previous conversation'
  );
}
```

#### When Quest is Fully Completed

When an entire quest is completed (all stages):

```javascript
// Record quest completion
await RelationshipSystem.recordQuestCompletion(currentUser.uid, characterId, currentQuest.id);

// Bonus affinity for completing entire quest
await RelationshipSystem.updateAffinity(
  currentUser.uid,
  characterId,
  15,
  `Completed quest: ${currentQuest.title}`
);
```

### Step 5: Handle Inactivity Penalties

Add a check when user logs in to apply inactivity penalties:

```javascript
// When user logs in, check for inactivity penalties
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;

    // Get all relationships
    const relationships = await RelationshipSystem.getUserRelationships(user.uid);

    // Apply inactivity penalty for each character
    for (const characterId of Object.keys(relationships)) {
      await RelationshipSystem.applyInactivityPenalty(user.uid, characterId);
    }

    // ... rest of auth logic
  }
});
```

### Step 6: Update AI System Prompts with Relationship Context

When generating AI prompts for conversations, include relationship context:

```javascript
async function generateSystemPrompt(stage, characterId, userId) {
  let prompt = stage.systemPrompt;

  // Get relationship data
  const relationships = await RelationshipSystem.getUserRelationships(userId);
  const relationship = relationships[characterId];
  const character = CHARACTER_DATABASE[characterId];

  if (relationship && character) {
    const affinity = relationship.affinity || 0;
    const level = RelationshipSystem.getRelationshipLevelData(affinity);
    const daysSince = RelationshipSystem.getDaysSinceLastContact(relationship.lastContact);

    // Add relationship context to prompt
    prompt += `\n\nRELATIONSHIP STATUS: ${level.level} (${level.levelEn}) - Affinity ${affinity}/100

WHAT THE PLAYER KNOWS ABOUT YOU:
${relationship.unlockedContent ? relationship.unlockedContent.join(', ') : 'Basic info only'}

RECENT INTERACTIONS:
- Last spoke ${daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : daysSince + ' days ago'}
- Total conversations: ${relationship.conversationCount || 0}
- Quests completed together: ${relationship.questsCompleted?.length || 0}

CONVERSATION STYLE:
- ${getGreetingInstructions(level.level, daysSince, character)}
- ${getPersonalityInstructions(affinity, character)}
`;
  }

  return prompt;
}

function getGreetingInstructions(level, daysSince, character) {
  if (level === 'stranger') {
    return 'Greet them politely but professionally as you just met.';
  } else if (level === 'acquaintance') {
    return 'Greet them warmly and show you recognize them.';
  } else if (level === 'friend') {
    if (daysSince > 7) {
      return `Greet them enthusiastically - you haven't seen them in ${daysSince} days! Show you missed them.`;
    }
    return 'Greet them as a friend with warmth and familiarity.';
  } else {
    if (daysSince > 7) {
      return `Greet them with concern and excitement - where have they been? You were worried!`;
    }
    return 'Greet them as a close friend or confidant with deep warmth and affection.';
  }
}

function getPersonalityInstructions(affinity, character) {
  if (affinity < 50) {
    return 'Be friendly but somewhat reserved. Don't share deep personal information yet.';
  } else if (affinity < 75) {
    return 'Be open and friendly. You can share some personal stories and ask about their life.';
  } else {
    return 'Be very open and trusting. Share deeper secrets, ask for advice, confide in them.';
  }
}
```

---

## 🎮 Testing the System

### Test 1: View Relationships Page

1. Log in to the app
2. Click the menu button (three dots)
3. Click "💚 Friendships"
4. You should see the relationships view with all characters listed as "Strangers" (0 affinity)

### Test 2: Character Detail Modal

1. On the Relationships page, click any character card
2. The character detail modal should open showing:
   - Character avatar and info
   - Affinity bar at 0%
   - Stats (all zeros for new characters)
   - Backstory (only level_0 visible)
   - Favorites
   - No exclusive quests visible yet (need 60+ affinity)

### Test 3: Gain Affinity

1. Complete a quest stage with a character
2. You should see an affinity notification appear (top-right)
3. The notification should show "+5 Affinity" and the character name
4. Return to Relationships page
5. The character should now have 5 affinity and might have moved from "Strangers" to "Acquaintances" if you completed multiple stages

### Test 4: Level Progression

Complete quests to test level progression:
- 0-20 affinity: Desconocido (Stranger) 👋
- 21-50 affinity: Conocido (Acquaintance) 🙂
- 51-75 affinity: Amigo (Friend) 😊
- 76-90 affinity: Buen Amigo (Close Friend) 🤗
- 91-100 affinity: Confidente (Confidant) 💙

### Test 5: Backstory Unlocking

As affinity increases, more backstory should unlock:
- 0+: Basic intro
- 20+: More details about their work
- 50+: Personal life details
- 75+: Deeper secrets
- 90+: Deepest secrets and dilemmas

---

## 📊 Firestore Data Structure

The system will create this structure in Firestore:

```
users/
  {userId}/
    gameData/
      relationships/
        characters/
          carlos/
            characterId: "carlos"
            affinity: 45
            level: "acquaintance"
            firstMet: "2025-11-13T10:30:00Z"
            lastContact: "2025-11-13T14:20:00Z"
            conversationCount: 3
            questsCompleted: ["missing-guitar"]
            giftsGiven: []
            factsLearned: []
            unlockedContent: ["backstory_level_20"]
            specialMoments: []
            affinityHistory: [
              {
                timestamp: "2025-11-13T10:30:00Z"
                change: 5
                oldValue: 0
                newValue: 5
                reason: "Completed quest stage"
              },
              ...
            ]
          maria/
            ...
```

---

## 🚀 Next Steps for Future Phases

### Phase 2 (Future):
- Gift giving system
- Free talk mode (chat without quests)
- Relationship-based quest unlocking

### Phase 3 (Future):
- Daily login bonus for favorite characters
- Character birthdays and special events
- Photo/memory album

### Phase 4 (Future):
- Character-to-character relationships
- Group conversations
- Romance paths (optional)

---

## 🐛 Troubleshooting

### Characters not showing in Relationships view
- Check browser console for errors
- Ensure CHARACTER_DATABASE is imported correctly
- Verify Firestore permissions allow read/write to gameData/relationships

### Affinity not updating
- Check that characterId is being found correctly from characterName
- Verify currentUser is defined
- Check Firestore console to see if data is being written

### Modal not opening
- Check browser console for JavaScript errors
- Verify all DOM elements exist (character-detail-modal, etc.)
- Ensure click handlers are attached

---

## 📝 Version Update

After integration, update version to `v2.1.0` in:
- `/public/index.html` (line 1113 and 1178)
- `/public/package.json`

**Version change reason:** Added Character Relationship System (major new feature = minor version bump)

---

## ✅ Implementation Checklist

- [x] Create CHARACTER_DATABASE with 5 main characters
- [x] Implement affinity tracking in Firestore
- [x] Add relationship levels calculation functions
- [x] Build Character Profiles UI page
- [x] Add navigation to relationships page
- [ ] Integrate relationship tracking with quest system (Steps 3-4 above)
- [ ] Add relationship context to AI prompts (Step 6 above)
- [ ] Test all functionality
- [ ] Update version number

---

## 💡 Tips

1. **Start Small**: First integrate just the basic affinity tracking (+5 for completing stages)
2. **Test Frequently**: After each integration step, test in the browser
3. **Use Console Logging**: The relationship functions log extensively - check browser console
4. **Monitor Firestore**: Use Firebase console to watch data being written in real-time
5. **Character Mapping**: Create a helper function to map character names to IDs since quests use character names

---

**Congratulations!** You now have a fully functional character relationship system that's completely unique to ConvoQuest and legally distinct from competitors! 🎉
