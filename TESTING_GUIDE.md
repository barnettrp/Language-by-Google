# ConvoQuest - New Features Testing Guide

## 🚀 Server Setup
The development server is running at: **http://localhost:5173/**

---

## 📋 Testing Scenarios

### 1. Avatar Selection System

#### **Test Case 1.1: Avatar Selection During Signup**
**Steps:**
1. Navigate to http://localhost:5173/
2. Click "Don't have an account? Sign Up"
3. Look for the avatar selector button (shows 👤 by default)
4. Click the avatar button to open the avatar modal
5. Select different avatars from the grid (32 options available)
6. Confirm your selection
7. Complete the signup form with:
   - Name: Test User
   - Email: test@example.com (use a unique email)
   - Password: TestPass123!
   - Confirm Password: TestPass123!

**Expected Results:**
- ✅ Avatar modal opens with 4x8 grid of emoji avatars
- ✅ Selected avatar is highlighted with blue border
- ✅ Selected avatar displays in the signup form
- ✅ Avatar is saved to Firestore upon successful signup

#### **Test Case 1.2: Change Avatar in Settings**
**Steps:**
1. Login to your account
2. Click the settings gear icon (⚙️) in the top right
3. View your current avatar displayed at the top of settings
4. Click "Change Avatar"
5. Select a different avatar
6. Confirm the change

**Expected Results:**
- ✅ Current avatar displays in settings modal
- ✅ Avatar modal opens when "Change Avatar" is clicked
- ✅ New avatar saves to Firestore
- ✅ Avatar updates in settings display

---

### 2. Daily Goal Setting

#### **Test Case 2.1: Set Daily Goal**
**Steps:**
1. Login to your account
2. Open Settings (⚙️)
3. Find "Daily Goal (minutes)" input field
4. Enter a value (e.g., 30 minutes)
5. Click elsewhere to trigger save
6. Close settings modal

**Expected Results:**
- ✅ Input accepts values between 5-240 minutes
- ✅ Value saves to Firestore when changed
- ✅ Daily tracker updates to show new goal

#### **Test Case 2.2: Verify Goal Persistence**
**Steps:**
1. Set a daily goal (e.g., 20 minutes)
2. Logout
3. Login again
4. Open Settings

**Expected Results:**
- ✅ Daily goal value persists and displays correctly

---

### 3. Daily Progress Tracker

#### **Test Case 3.1: Tracker Display**
**Steps:**
1. Login to your account
2. Navigate to the main quest view (should see "Choose a Quest")
3. Look for the daily tracker banner below the header

**Expected Results:**
- ✅ Tracker displays with gradient blue background
- ✅ Shows "Daily Goal" with current/goal minutes (e.g., "0 / 15 min")
- ✅ Shows "Streak" with days count (e.g., "0 days")
- ✅ Progress bar displays at 0% initially
- ✅ Fire emoji (🔥) displays next to Daily Goal

#### **Test Case 3.2: Tracker Visibility**
**Steps:**
1. Login to an account
2. Open Settings
3. Set Daily Goal to 0
4. Check if tracker disappears
5. Set Daily Goal to 15
6. Check if tracker reappears

**Expected Results:**
- ✅ Tracker hides when goal is 0
- ✅ Tracker shows when goal > 0

---

### 4. Session Time Tracking

#### **Test Case 4.1: Complete a Quest Stage**
**Steps:**
1. Login to your account
2. Click on "The Missing Guitar" quest
3. Click a map location (📍)
4. Read the vignette and click "Start Stage"
5. Send a few messages in Spanish to the AI character
6. Wait at least 1 minute (actual conversation)
7. Click "Complete Stage"
8. Check the daily tracker

**Expected Results:**
- ✅ Session timer starts when stage begins
- ✅ Session timer stops when stage completes
- ✅ Daily progress updates (minutes increase)
- ✅ Progress bar advances based on time spent
- ✅ Changes save to Firestore

#### **Test Case 4.2: Multiple Sessions**
**Steps:**
1. Complete one quest stage (as above)
2. Note the minutes tracked (e.g., 2 minutes)
3. Start and complete another quest stage
4. Check daily tracker again

**Expected Results:**
- ✅ Minutes accumulate across multiple sessions
- ✅ Progress bar advances accordingly
- ✅ Total time reflects sum of all sessions

#### **Test Case 4.3: Goal Achievement**
**Steps:**
1. Set a low daily goal (e.g., 5 minutes)
2. Complete quest stages until you exceed the goal
3. Check the progress bar

**Expected Results:**
- ✅ Progress bar fills to 100% when goal is met
- ✅ Progress bar stays at 100% even if goal is exceeded
- ✅ Minutes continue to count beyond goal

---

### 5. Streak System

#### **Test Case 5.1: Initial Streak**
**Steps:**
1. Create a new account
2. Check the streak counter

**Expected Results:**
- ✅ Streak starts at 0 days

#### **Test Case 5.2: Meeting Daily Goal (Simulated)**
**Note:** This test requires modifying Firestore data or waiting until the next day
**Steps:**
1. Complete enough quest stages to meet your daily goal
2. Check `dailyProgress.minutes >= dailyGoal`
3. The next day, login and complete at least 1 quest stage

**Expected Results:**
- ✅ Streak increments to 1 day (when goal met yesterday and active today)
- ✅ Streak displayed correctly in tracker

#### **Test Case 5.3: Streak Break (Simulated)**
**Note:** This requires waiting 2+ days without activity
**Steps:**
1. Don't use the app for 2 days
2. Login and check streak

**Expected Results:**
- ✅ Streak resets to 0 if goal wasn't met or user was inactive

---

### 6. Data Persistence

#### **Test Case 6.1: Cross-Session Persistence**
**Steps:**
1. Complete a quest stage (track some time)
2. Logout
3. Login again
4. Check daily tracker

**Expected Results:**
- ✅ Daily progress persists (same day)
- ✅ Avatar persists
- ✅ Daily goal persists
- ✅ Streak persists

#### **Test Case 6.2: New Day Reset**
**Note:** This test requires waiting until midnight or modifying system clock
**Steps:**
1. Track some progress on Day 1
2. Login on Day 2
3. Check daily tracker

**Expected Results:**
- ✅ Daily minutes reset to 0 on new day
- ✅ Daily goal remains the same
- ✅ Streak updates based on previous day's completion

---

## 🐛 Known Issues to Check

### Potential Issues:
1. **Timezone handling**: Check if day reset happens at correct local time
2. **Concurrent sessions**: Test with multiple browser tabs open
3. **Firestore connection**: Verify behavior when offline
4. **Progress bar overflow**: Ensure bar doesn't exceed 100% visually
5. **Avatar persistence**: Check if avatar shows in all views after selection

---

## 🔍 Debug Console

The app includes a debug console at the bottom of the screen showing:
- Firebase initialization
- Auth state changes
- Settings load/save operations
- Session time tracking
- Daily tracker updates

**To use:**
- Scroll to bottom of app to see debug logs
- Look for messages like:
  - `⏱️ Session timer started`
  - `⏱️ Session ended. Duration: X minutes`
  - `📊 Updating daily tracker display`
  - `✅ Session time tracked and saved`

---

## 📊 Firestore Data Structure

### User Document (`users/{userId}`):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "avatar": "😊",
  "xp": 0,
  "proficiencyLevel": "A1",
  "dialect": "Mexico",
  "formality": "Casual",
  "vignetteLanguage": "English",
  "dailyGoal": 15,
  "dailyProgress": {
    "date": "2025-10-10",
    "minutes": 5,
    "lastUpdated": Timestamp
  },
  "streak": 0,
  "lastActiveDate": "2025-10-10",
  "completedStages": {},
  "createdAt": Timestamp
}
```

---

## ✅ Testing Checklist

- [ ] Avatar displays correctly in signup
- [ ] Avatar modal opens and allows selection
- [ ] Avatar persists after signup/login
- [ ] Avatar can be changed in settings
- [ ] Daily goal input accepts valid values (5-240)
- [ ] Daily goal persists across sessions
- [ ] Daily tracker displays when goal > 0
- [ ] Daily tracker hides when goal = 0
- [ ] Progress bar starts at 0%
- [ ] Session time tracking starts with stage
- [ ] Session time tracking stops when stage completes
- [ ] Daily progress updates after completing stage
- [ ] Progress bar advances proportionally
- [ ] Multiple sessions accumulate correctly
- [ ] Progress bar caps at 100%
- [ ] Streak counter displays correctly
- [ ] All data persists across logout/login
- [ ] Debug console shows relevant logs

---

## 🎯 Quick Test Scenario

**5-Minute Smoke Test:**
1. ✅ Signup with custom avatar
2. ✅ Set daily goal to 5 minutes
3. ✅ Verify tracker displays (0 / 5 min, 0 days)
4. ✅ Start and complete a quest stage
5. ✅ Verify tracker updates (e.g., 2 / 5 min)
6. ✅ Logout and login
7. ✅ Verify all data persisted

**Expected time to complete:** ~5 minutes

---

## 📝 Notes

- **Email Verification:** The app requires email verification. For testing, check spam folder or use the "Resend Verification Email" button.
- **Firebase Config:** Make sure Firebase credentials are properly set in the environment variables.
- **Session Duration:** Minimum tracked time is 1 minute (rounds up from seconds).
- **Avatar Options:** 32 safe, predefined emoji avatars across 3 categories (faces, animals, objects).

---

## 🆘 Troubleshooting

### Issue: Tracker not displaying
- Check if dailyGoal > 0 in Firestore
- Verify user is logged in
- Check browser console for errors

### Issue: Time not tracking
- Verify session timer starts (check debug console)
- Ensure stage completes properly (click "Complete Stage")
- Check Firestore permissions

### Issue: Avatar not saving
- Verify Firebase Auth is working
- Check Firestore write permissions
- Look for errors in debug console

### Issue: Progress not persisting
- Check Firestore connection
- Verify user document exists in Firestore
- Check browser console for save errors
