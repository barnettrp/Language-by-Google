N# Developer Mode Guide

## Overview
Developer Mode provides testing utilities to quickly move through quests without completing conversations, unlock all locations, and manipulate progress for testing purposes.

## Visual Developer Panel

A purple gradient panel appears at the bottom of the screen with the following controls:

### Quest Controls
- **✓ Complete Current Quest** - Instantly marks the active quest as complete and unlocks next locations
- **→ Skip to Next Stage** - Skips to the next stage of the current quest (coming soon)

### Location Controls
- **🔓 Unlock All Locations** - Unlocks all 10 locations on the map instantly
- **🔄 Reset All Progress** - Resets all quest completion and locks all locations except Plaza

### Level Controls
- **CEFR Level Dropdown** - Change your level from A1 to C2 to test level-gated content

### Status Display
Shows real-time stats:
- **Quests**: Number of quests completed
- **Level**: Current CEFR level
- **Locations**: Number of unlocked locations

### Debug Log
Shows recent actions and system messages

## Usage Instructions

### Testing a Single Quest
1. Start the app and log in
2. Click on a quest to start it
3. While in the quest, click **"✓ Complete Current Quest"** at the bottom
4. The quest will be marked complete and you'll return to the quest list
5. New locations will unlock automatically

### Testing Map Progression
1. Click the **"🗺️ Map"** tab to view the map
2. Notice only La Plaza Central is unlocked
3. Click **"🔓 Unlock All Locations"** in the dev panel
4. All locations will glow and become clickable
5. Click any location to see available quests

### Testing Level-Gated Content
1. Use the **CEFR Level** dropdown to change your level
2. Higher levels (B1, B2, C1, C2) will unlock more locations
3. Quest availability changes based on level

### Resetting for Clean Testing
1. Click **"🔄 Reset All Progress"**
2. Confirm the reset
3. All progress returns to default (A1 level, Plaza only)

## Console Commands

For power users, you can also use browser console commands:

```javascript
// Show available commands
devMode.help()

// Complete current quest
devMode.completeQuest()

// Unlock all locations
devMode.unlockAll()

// Set CEFR level
devMode.setLevel('B2')  // A1, A2, B1, B2, C1, or C2

// Reset all progress
devMode.reset()
```

## Panel Controls

### Minimize/Expand
Click the **"Minimize"** button to hide the controls and save screen space. Click **"Expand"** to show them again.

The panel persists across all views and updates in real-time.

## How It Works

### Quest Completion
When you complete a quest via dev mode:
1. Quest is added to completed list
2. Quest completion count increases
3. Dependent locations check their unlock requirements
4. If requirements met, location unlocks automatically
5. Map view refreshes to show newly unlocked locations

### Location Unlocking
Locations unlock based on:
- **CEFR Level**: Some locations require B1, B2, etc.
- **Quest Count**: Some require completing X number of quests
- **Specific Quests**: Some require completing certain prerequisite quests
- **Other Locations**: Some require unlocking other locations first

Dev mode bypasses all these requirements when you click "Unlock All".

## Quest Flow Testing

### Recommended Testing Order
1. **Start Fresh** - Reset all progress
2. **Test Plaza Quests** - Complete "Missing Guitar" and "Market Day"
3. **Check Unlocks** - Verify Café and Hotel unlock
4. **Test Café** - Complete "La Café Order" quest
5. **Check Beach** - Verify La Playa unlocks
6. **Test Surf** - Complete "Surf Lesson"
7. **Check Dock** - Verify El Muelle unlocks
8. **Test Fishing** - Complete "Fishing with Don Pedro"
9. **Check Music School** - Verify Escuela de Música unlocks

### Quick Full Unlock Testing
1. Click **"🔓 Unlock All Locations"**
2. Switch to **Map View**
3. Click through each location
4. Verify quests appear correctly
5. Start any quest to test conversations

## Tips & Tricks

- **Fast Navigation**: Use the complete button instead of typing conversations
- **Level Testing**: Change levels to see which quests/locations appear
- **Progress Tracking**: Watch the stats update in real-time
- **Clean Slate**: Reset before each major test to ensure consistency
- **Console Power**: Use console commands for automated testing scripts

## Troubleshooting

### Panel Not Showing
- Check browser console for JavaScript errors
- Verify dev-mode.js is loaded
- Refresh the page

### Complete Button Not Working
- Make sure you've started a quest first
- Check the debug log for error messages
- Verify quest tracking is working (check console)

### Locations Not Unlocking
- Try refreshing the map view
- Reset progress and unlock all again
- Check browser console for errors

## Disabling Developer Mode

To disable the panel in production:
1. Remove the dev panel HTML from index.html
2. Remove the dev-mode.js script tag
3. Remove initDevMode() call from app.js

Or simply hide it with CSS:
```css
#dev-panel { display: none !important; }
```

## Future Enhancements

Planned features:
- Stage-by-stage navigation
- Auto-complete all quests button
- Quest replay with conversation history
- Progress export/import for testing
- Time-travel debugging (undo/redo progress changes)
