# Version Update Process

Every time we make changes to the app, update the version number so users can verify they're not seeing cached content.

## How to Update Version

1. **Update package.json**:
   - Change the `"version"` field to the new version number
   - Follow semantic versioning: MAJOR.MINOR.PATCH
     - MAJOR: Breaking changes
     - MINOR: New features (backward compatible)
     - PATCH: Bug fixes

2. **Update index.html** (4 locations):
   - Line ~433: Auth screen version (top-left corner)
   - Line ~548: Quest list view version (top-right header)
   - Line ~628: Chat view version (top-right header)
   - Search for `v1.2.0` and replace all occurrences

3. **Commit with version in message**:
   ```bash
   git add .
   git commit -m "feat: [Brief description] (v1.2.0)"
   git push
   ```

## Current Version

**v2.1.11** (2025-11-11)

### Changes in v2.1.11:
- **Enhanced Onboarding Tour**: Comprehensive interactive tour for new users
- **Tour Improvements**: Updated tour steps to cover all key features (Santiago, quest cards, difficulty badges, menu, progress tracking)
- **Manual Tour Restart**: Added "Restart Tour" option in menu dropdown for users who want to see the tour again
- **Better Guidance**: Tour now highlights Santiago's avatar, quest details, view toggles, menu options, and daily progress
- **6 Tour Steps**: Expanded from 4 to 6 steps covering essential app features
- **Smart Skip Logic**: Tour gracefully skips steps if elements aren't visible

### Changes in v2.1.10:
- **UI Cleanup**: Simplified quest page header for cleaner, more stylish appearance
- **Menu Consolidation**: Combined dark mode, settings, and logout into single dropdown menu
- **Improved UX**: Reduced visual clutter while maintaining all functionality
- **Version Display**: Moved version number to menu dropdown (still accessible)

### Changes in v1.6.0:
- **Voice System Overhaul**: Automatic voice provider with Cartesia → OpenAI → Google AI fallback chain
- **Mood-Based Voice Inflection**: Intelligent emotion detection that automatically adjusts voice speed and pitch
- **Removed Manual Voice Selection**: Voices now automatically selected based on character traits
- **Enhanced UX**: Simplified settings by removing provider/voice selection dropdowns
- **Emotional Voice Adaptation**: Detects 9 moods (excited, happy, urgent, sad, angry, calm, mysterious, curious, neutral)
- **Spanish Emotion Recognition**: Analyzes Spanish keywords and punctuation for mood detection

### Changes in v1.2.2:
- Reduced onboarding quest message requirement from 12 to 8 messages
- Prevents repetitive goodbye exchanges while maintaining conversation quality
- Quest now completes more naturally after meaningful conversation

### Changes in v1.2.1:
- **SECURITY**: Removed dev mode login bypass for production
- Added visible debug console panel next to chat
- Debug console with color-coded logging and minimize/maximize
- Added vocabulary review to quest farewell sequence
- Enhanced debug logging for quest completion tracking
- All quest progress now visible in real-time debug panel

### Changes in v1.2.0:
- Added comprehensive scaffolding instructions for AI
- Improved quest completion flow with auto-return
- Fixed correction formatting (strikethrough display)
- Added Claude API endpoint for better NPC conversations
- Reduced onboarding quest requirements for better UX
- Added version numbers to all app screens
- Enhanced "always end with question" rule enforcement

### Previous Versions:
- **v1.1.9**: Spanish mixing enforcement in NPC responses
- **v1.1.8**: Vercel deployment fixes
