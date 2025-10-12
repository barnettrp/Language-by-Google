# Quest System Testing Guide

## 🧪 Test Environment Setup Complete!

The development server is now running at: **http://localhost:5173/**

## Quick Test Access

### Test Page
- **URL**: http://localhost:5173/test-quest-system.html
- **Purpose**: Automated test suite with visual quest inspector

### Main App
- **URL**: http://localhost:5173/
- **Purpose**: Full application testing

---

## 📋 Test Checklist

### ✅ Phase 1: Automated Tests (test-quest-system.html)

Visit http://localhost:5173/test-quest-system.html and verify:

**Expected: 15/15 tests should pass (100%)**

1. ✅ Quest data file loads
2. ✅ QUEST_DATABASE has quests property
3. ✅ At least 2 quests exist
4. ✅ "missing-guitar" quest exists
5. ✅ "market-day" quest exists
6. ✅ Quests have required properties
7. ✅ Stages have enhanced structure
8. ✅ Vignettes support bilingual format
9. ✅ Stages have objectives array
10. ✅ Stages have difficulty modifiers
11. ✅ QUEST_CATEGORIES exported
12. ✅ DIFFICULTY_LEVELS exported
13. ✅ Stage flow is properly defined
14. ✅ Market Day quest has 2 stages
15. ✅ Missing Guitar quest has 3 stages

---

### ✅ Phase 2: Visual Inspection (test-quest-system.html)

On the same test page, scroll down to verify:

**Quest Data Inspector:**
- [ ] Both quests display with correct metadata
- [ ] Difficulty badges show: "beginner"
- [ ] Category shows: "mystery" and "daily-life"
- [ ] Stage counts show: 3 and 2 respectively
- [ ] Required levels show: "A1"

**Visual Quest Cards:**
- [ ] Both quests render with thumbnail images
- [ ] Category icons display (🔍 for mystery, 🏠 for daily-life)
- [ ] Duration shows "15 min" and "12 min"
- [ ] Tags appear as blue badges

**Stage Viewer:**
- [ ] Dropdown lists both quests
- [ ] Selecting "The Missing Guitar" shows 3 stages
- [ ] Selecting "Market Day" shows 2 stages
- [ ] Each stage displays character avatar and name
- [ ] Both English and Spanish vignettes visible
- [ ] Learning objectives list appears
- [ ] XP rewards show correctly
- [ ] Next stage indicators accurate

---

### ✅ Phase 3: Main App Integration Testing

Visit http://localhost:5173/ and test the full app:

#### 1. **Quest Selection Screen**
- [ ] After login/placement, main quest view loads
- [ ] Both quests appear as clickable cards
- [ ] Quest titles: "The Missing Guitar" and "Market Day"
- [ ] Quest objectives display correctly

#### 2. **Quest Map View**
- [ ] Click a quest card → Map modal opens
- [ ] Quest title and objective show at top
- [ ] Map image loads
- [ ] At least one 📍 location marker appears
- [ ] Markers are clickable

#### 3. **Vignette Display**
- [ ] Click a location marker → Vignette modal opens
- [ ] Character name displays (e.g., "Mateo, the Concierge")
- [ ] Vignette text appears in user's preferred language
- [ ] "Start Stage" button present

#### 4. **Vignette Language Switching**
To test bilingual vignettes:
- [ ] Go to Settings (⚙️)
- [ ] Change "Vignette Language" to "Spanish"
- [ ] Close settings, go back to quest
- [ ] Click location → Vignette now in Spanish
- [ ] Change back to "English" → Vignette in English

#### 5. **Stage Progression**
- [ ] Click "Start Stage" → Chat view opens
- [ ] Character name in header
- [ ] Initial greeting message appears
- [ ] Type a message → AI responds in character
- [ ] Click "Complete Stage" → Completion modal appears
- [ ] Clue text displays
- [ ] XP gain shows
- [ ] Click "Continue Quest" → Returns to map with next stages

#### 6. **Multiple Paths (Missing Guitar)**
- [ ] Complete Stage 1
- [ ] Map should show 2 new locations (stages 2a and 2b)
- [ ] Both are clickable
- [ ] Each leads to different character

#### 7. **Quest Completion**
- [ ] Complete all stages of a quest
- [ ] Final stage completion shows "Quest Complete! 🎉"
- [ ] No next stages available

---

## 🔍 Advanced Testing

### Browser Console Tests

Open browser console (F12) and run:

```javascript
// Test 1: Check quest data loaded
console.log('Quest Database:', window.QUEST_DATABASE);

// Test 2: Count quests
console.log('Total Quests:', Object.keys(window.QUEST_DATABASE.quests).length);

// Test 3: Inspect Missing Guitar
console.log('Missing Guitar:', window.QUEST_DATABASE.quests['missing-guitar']);

// Test 4: Check stage 1 structure
const stage1 = window.QUEST_DATABASE.quests['missing-guitar'].stages['1'];
console.log('Stage 1 Character:', stage1.characterName);
console.log('Stage 1 Vignette (EN):', stage1.vignette.en);
console.log('Stage 1 Vignette (ES):', stage1.vignette.es);
console.log('Stage 1 Objectives:', stage1.objectives);

// Test 5: Check categories
console.log('Categories:', window.QUEST_CATEGORIES);

// Test 6: Check difficulty levels
console.log('Difficulty Levels:', window.DIFFICULTY_LEVELS);
```

Expected output:
- All properties should be defined
- No `undefined` or `null` values for required fields
- Vignettes have both `en` and `es` keys
- Objectives is an array with items

---

## 🐛 Troubleshooting

### Issue: Test page shows 0/15 tests
**Solution**: Check browser console for JavaScript errors. Verify quest-data.js loaded.

### Issue: Quests don't appear in main app
**Solution**:
1. Check if Firebase auth is working (you need to be logged in)
2. Check browser console for errors
3. Verify `/quest-data.js` script tag is in index.html

### Issue: Vignettes only in English
**Solution**:
1. Verify Settings → Vignette Language option exists
2. Check quest-data.js has `vignette: { en: "...", es: "..." }` format
3. Try clearing browser cache

### Issue: "Quest Complete" not appearing
**Solution**:
1. Verify stage has empty `nextStages` array or no `nextStages` property
2. Check stage is marked as final stage in quest-data.js

---

## 📊 Success Criteria

**Quest System is working if:**
- ✅ 15/15 automated tests pass
- ✅ Both quests visible in main app
- ✅ Vignettes display in both languages
- ✅ Can complete at least one full quest
- ✅ Stage progression works correctly
- ✅ No JavaScript errors in console

---

## 📝 Test Results Template

Copy and fill out after testing:

```
Date: [DATE]
Tester: [NAME]

Phase 1 - Automated Tests: [X]/15 passed
Phase 2 - Visual Inspection: [PASS/FAIL]
Phase 3 - Main App Integration:
  - Quest Selection: [PASS/FAIL]
  - Map View: [PASS/FAIL]
  - Vignette Display: [PASS/FAIL]
  - Language Switching: [PASS/FAIL]
  - Stage Progression: [PASS/FAIL]
  - Multiple Paths: [PASS/FAIL]
  - Quest Completion: [PASS/FAIL]

Overall Status: [PASS/FAIL]
Notes: [Any observations or issues]
```

---

## 🎯 Next Steps After Testing

Once all tests pass:
1. Consider adding more quests to quest-data.js
2. Implement QuestManager class for objective tracking
3. Add quest filtering UI by category
4. Create quest analytics dashboard
5. Build objective completion detection system

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify all files are saved
3. Clear browser cache and reload
4. Restart dev server: `npm run dev`
5. Check CLAUDE.md for documentation
