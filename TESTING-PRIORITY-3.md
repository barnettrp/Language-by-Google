# Priority 3 UI Features - Testing Scenarios

**Date:** 2025-11-02
**Version:** 1.3.0
**Server:** http://localhost:5176 (or your configured port)
**Features to Test:** Micro-interactions, Mobile Optimization, Accessibility Features, Onboarding Tour

---

## Overview

This document provides comprehensive testing scenarios for the 10 Priority 3 features implemented in the last session:

1. **Button Micro-Interactions** - Ripple effects, hover animations, click feedback
2. **Smooth Scrolling** - Natural scroll behavior throughout app
3. **Skeleton Loading States** - Modern loading animations
4. **Mobile Bottom Navigation** - Thumb-friendly navigation bar
5. **Swipe Gesture Navigation** - Mobile back gesture
6. **High Contrast Mode** - Accessibility feature for vision impairments
7. **Font Size Options** - User-configurable text sizes
8. **Keyboard Navigation** - Full keyboard support with shortcuts
9. **Screen Reader Support** - ARIA labels and announcements
10. **Onboarding Tour** - Interactive walkthrough for new users

---

## Pre-Test Setup

### Start the Development Server

```bash
PORT=5176 node dev-server.js
```

### Access the Application

1. Open your browser to: **http://localhost:5176**
2. Login or create an account

### Required Testing Devices

- **Desktop/Laptop** with keyboard (for keyboard navigation tests)
- **Mobile device** or mobile emulation (for swipe gestures, bottom nav)
- **Screen reader software** (optional but recommended):
  - Windows: NVDA (free) or JAWS
  - Mac: VoiceOver (built-in, Cmd+F5)
  - iOS: VoiceOver (Settings > Accessibility)
  - Android: TalkBack (Settings > Accessibility)

---

## Test Scenario 1: Button Micro-Interactions 🎯

**Goal:** Verify that all buttons have tactile, responsive feedback

### Desktop Testing

**Steps:**
1. Navigate to the Quest Selection screen
2. Hover over any quest card button
3. Click any button

**Expected Results:**
- [ ] **Hover Effect:**
  - Button lifts up 2px
  - Shadow appears beneath button
  - Smooth transition (not instant)

- [ ] **Click Effect:**
  - Button scales down to 0.95 (feels like it's being pressed)
  - Ripple effect emanates from exact click point
  - Ripple is circular and expands outward
  - Ripple fades out after 600ms

- [ ] **Ripple Colors:**
  - Primary buttons: Blue-tinted ripple
  - Different button types have appropriate ripple colors

### Multiple Interactions

**Steps:**
1. Click the same button rapidly 5 times
2. Click different buttons in quick succession

**Expected Results:**
- [ ] Each click creates a new ripple
- [ ] Multiple ripples can exist simultaneously
- [ ] Ripples don't interfere with each other
- [ ] No performance lag or stuttering
- [ ] All ripples clean up after animation completes

### Buttons to Test

Test ripple effects on all button types:
- [ ] "Start Quest" buttons on quest cards
- [ ] "Send" button in chat
- [ ] Settings modal buttons
- [ ] "Continue to Quest Selection" completion button
- [ ] Navigation buttons (Back, etc.)
- [ ] Mobile bottom nav buttons (if on mobile)

### Edge Cases

- [ ] **Disabled buttons** - Should NOT show ripple or hover effects
- [ ] **Small buttons** - Ripple should scale appropriately
- [ ] **Large buttons** - Ripple should cover entire button area

---

## Test Scenario 2: Smooth Scrolling 📜

**Goal:** Verify gradual, natural scrolling behavior throughout the app

### Quest List Scrolling

**Steps:**
1. Go to Quest Selection screen
2. If quest list doesn't fill screen, add more quests or shrink window
3. Use mouse wheel to scroll

**Expected Results:**
- [ ] Scrolling is smooth and gradual (not instant jumps)
- [ ] Scroll speed feels natural
- [ ] Works consistently across all browsers

### Chat View Scrolling

**Steps:**
1. Start a quest and have a conversation
2. Generate enough messages to require scrolling
3. Scroll up and down in chat

**Expected Results:**
- [ ] Chat scrolls smoothly
- [ ] Auto-scroll to new messages is smooth
- [ ] Manual scrolling doesn't conflict with auto-scroll

### Programmatic Scrolling

**Steps:**
1. Use keyboard Tab key to navigate between elements
2. Click the "Skip to main content" link (press Tab until it appears)

**Expected Results:**
- [ ] Keyboard navigation scrolls smoothly to focused elements
- [ ] Skip-to-content link scrolls smoothly to main content area
- [ ] No jarring jumps when focus changes

### Browser Compatibility

Test smooth scrolling in:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## Test Scenario 3: Skeleton Loading States 💀

**Goal:** Verify modern loading animations replace old "Loading..." text

### Where Skeletons Appear

**Current Implementation:**
- Correction/feedback loading in chat (when AI is processing)

**Steps:**
1. Start a quest conversation
2. Send a message that might trigger a correction or feedback
3. Observe the loading indicator

**Expected Results:**
- [ ] **Skeleton appears** instead of plain "Loading..." text
- [ ] **Shimmer animation:**
  - Smooth gradient moves from left to right
  - Animation loops infinitely (1.5s per cycle)
  - No stuttering or frame drops

- [ ] **Light mode colors:**
  - Skeleton uses #f0f0f0 → #f8f8f8 → #f0f0f0 gradient

- [ ] **Dark mode colors:**
  - Skeleton uses #2a2a3e → #3a3a4e → #2a3a3e gradient
  - (Toggle dark mode and check)

### Animation Performance

**Steps:**
1. Let skeleton animate for 10+ seconds
2. Observe CPU usage (F12 → Performance tab)

**Expected Results:**
- [ ] Animation runs smoothly at 60fps
- [ ] No excessive CPU usage
- [ ] Animation doesn't slow down over time

---

## Test Scenario 4: Mobile Bottom Navigation 📱

**Goal:** Verify thumb-friendly navigation on mobile devices

### Visibility Tests

**Steps:**
1. Open app on desktop (wide screen)
2. Open DevTools and toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device (iPhone 12, Pixel 5, etc.)

**Expected Results:**
- [ ] Bottom nav appears on mobile (≤1024px width)
- [ ] Bottom nav disappears on desktop (>1024px width)
- [ ] Transition is smooth when resizing

### Navigation Buttons

**Bottom nav should have 3 buttons:**
1. **🗺️ Quests** - Navigate to quest list
2. **📝 Quiz** - Navigate to placement test
3. **👤 Profile** - Open settings modal

**Steps:**
1. Ensure you're on mobile viewport (≤1024px)
2. Click each button

**Expected Results:**
- [ ] **Quests button:**
  - Shows quest list view
  - Button gets active state (top gradient line)
  - Icon/text color changes to indicate active

- [ ] **Quiz button:**
  - Shows placement test view
  - Button gets active state
  - Previous active button loses active state

- [ ] **Profile button:**
  - Opens settings modal
  - Button shows active state while modal is open
  - Modal appears properly on mobile

### Visual Design

**Expected Results:**
- [ ] Bottom nav has glassmorphism effect (backdrop blur)
- [ ] Background is semi-transparent with blur
- [ ] Bottom nav has subtle shadow for depth
- [ ] Active button has gradient indicator line at top
- [ ] Touch targets are at least 64px tall (thumb-friendly)
- [ ] Icons and labels are clearly visible

### iPhone Notch Support

**Steps:**
1. Switch device emulation to iPhone X or newer
2. Scroll to bottom of page

**Expected Results:**
- [ ] Bottom nav respects safe-area-inset-bottom
- [ ] Nav doesn't get hidden behind home indicator
- [ ] Content doesn't overlap with nav bar

### Interaction States

**Steps:**
1. Tap and hold a bottom nav button
2. Release

**Expected Results:**
- [ ] Button shows pressed state (scale down)
- [ ] Ripple effect appears on tap
- [ ] Smooth transition between states

---

## Test Scenario 5: Swipe Gesture Navigation 👆

**Goal:** Verify swipe-right gesture returns to quest list from chat

### Basic Swipe Test

**Steps:**
1. Use mobile device or device emulation
2. Start any quest to enter chat view
3. Place finger/cursor on left edge of screen
4. Swipe right at least 50px horizontally

**Expected Results:**
- [ ] Returns to quest list immediately
- [ ] Smooth transition (no jarring jumps)
- [ ] Bottom nav updates to show "Quests" as active
- [ ] If TTS audio was playing, it stops

### Swipe Distance Threshold

**Steps:**
1. Enter chat view
2. Swipe right only 30px (less than 50px minimum)

**Expected Results:**
- [ ] Nothing happens (swipe too short)
- [ ] Stays in chat view

### Vertical Movement Check

**Steps:**
1. Enter chat view
2. Swipe diagonally (right + down) with >100px vertical movement

**Expected Results:**
- [ ] Nothing happens (too much vertical movement)
- [ ] Gesture interpreted as scrolling, not navigation

### Non-Interfering Elements

**Steps:**
1. Enter chat view
2. Try swiping on these elements:
   - Send button
   - Text input field
   - Settings button
   - Any button or interactive element

**Expected Results:**
- [ ] Swipe does NOT trigger when starting on buttons
- [ ] Swipe does NOT trigger when starting on input fields
- [ ] Interactive elements work normally
- [ ] Only swiping on empty/non-interactive areas triggers navigation

### Multiple Swipes

**Steps:**
1. Enter chat view
2. Swipe right to return to quest list
3. Start another quest
4. Swipe right again

**Expected Results:**
- [ ] Works consistently every time
- [ ] No degradation or bugs after multiple uses

---

## Test Scenario 6: High Contrast Mode ♿

**Goal:** Verify maximum visibility for users with vision impairments

### Enabling High Contrast

**Steps:**
1. Open Settings (⚙️ button or Profile in mobile nav)
2. Navigate to "Accessibility" section
3. Find "High Contrast Mode" toggle
4. Toggle it ON

**Expected Results:**
- [ ] Interface immediately switches to high contrast
- [ ] No page reload required

### Light Mode High Contrast

**Ensure dark mode is OFF, then enable high contrast:**

**Expected Visual Changes:**
- [ ] **Background:** Pure white (#ffffff)
- [ ] **Text:** Pure black (#000000)
- [ ] **Buttons:** Bright blue with 2px borders
- [ ] **Containers:** White with thick black borders (2px)
- [ ] **Gradients removed:** All gradients replaced with solid colors
- [ ] **Focus indicators:** 3px solid outlines on focused elements

**Test Readability:**
- [ ] All text is easily readable
- [ ] Sufficient contrast ratio (≥7:1 for WCAG AAA)
- [ ] No washed-out or hard-to-see elements

### Dark Mode High Contrast

**Steps:**
1. Enable dark mode (🌙 toggle)
2. Keep high contrast ON
3. Observe changes

**Expected Visual Changes:**
- [ ] **Background:** Pure black (#000000)
- [ ] **Text:** Pure white (#ffffff)
- [ ] **Buttons:** Bright cyan with 2px borders
- [ ] **Containers:** Black with thick white borders (2px)
- [ ] **All elements clearly separated** by borders

### UI Elements in High Contrast

**Test each of these in high contrast mode:**
- [ ] Quest cards - Clear borders, readable text
- [ ] Chat bubbles - High contrast colors, clear separation
- [ ] Buttons - Obvious boundaries, easy to click
- [ ] Input fields - Clear focus states
- [ ] Navigation elements - Distinct and visible
- [ ] Modal/dialog backgrounds - High contrast with content

### Animations in High Contrast

**Expected Results:**
- [ ] Gradient animations removed/simplified
- [ ] Button ripples still work (if visible)
- [ ] Essential animations preserved for usability
- [ ] No distracting motion

### Persistence

**Steps:**
1. Enable high contrast mode
2. Refresh page (F5)

**Expected Results:**
- [ ] High contrast mode persists after refresh
- [ ] Setting saved in localStorage

---

## Test Scenario 7: Font Size Options 🔤

**Goal:** Verify user can adjust text size for readability

### Font Size Selector

**Steps:**
1. Open Settings > Accessibility
2. Find "Font Size" dropdown
3. Note available options

**Expected Options:**
- [ ] Small (14px)
- [ ] Normal (16px) - Default
- [ ] Large (18px)
- [ ] Extra Large (20px)

### Testing Each Size

**Steps:**
1. Select "Small"

**Expected Results:**
- [ ] Body text reduces to 14px immediately
- [ ] Headings scale proportionally smaller
- [ ] All text remains readable
- [ ] Layout doesn't break

**Steps:**
2. Select "Large"

**Expected Results:**
- [ ] Body text increases to 18px immediately
- [ ] Headings scale proportionally larger
- [ ] Text is more readable for vision impairments
- [ ] Layout adjusts gracefully (no overlaps)

**Steps:**
3. Select "Extra Large"

**Expected Results:**
- [ ] Body text increases to 20px
- [ ] Maximum readability
- [ ] Interface still usable (buttons, inputs still fit)

### Elements That Should Scale

**Verify these elements change size:**
- [ ] Chat message text
- [ ] Quest card descriptions
- [ ] Button labels
- [ ] Input placeholder text
- [ ] Settings menu text
- [ ] All body text throughout app

### Elements That Should Scale Proportionally

**Verify these scale appropriately:**
- [ ] H1 headings (larger increase)
- [ ] H2 headings
- [ ] H3 headings
- [ ] Line height adjusts for readability

### Layout Integrity

**Steps:**
1. Set font size to "Extra Large"
2. Navigate through all views:
   - Quest list
   - Chat view
   - Settings modal
   - Placement test

**Expected Results:**
- [ ] No text overflow or cut-off
- [ ] No overlapping elements
- [ ] Containers expand to fit larger text
- [ ] All content remains accessible

### Persistence

**Steps:**
1. Set font size to "Large"
2. Refresh page

**Expected Results:**
- [ ] Font size persists after refresh
- [ ] Setting saved in localStorage

---

## Test Scenario 8: Keyboard Navigation ⌨️

**Goal:** Verify full keyboard accessibility without mouse

### Focus Indicators

**Steps:**
1. Click anywhere on page
2. Press **Tab** key

**Expected Results:**
- [ ] Focus indicators appear (3px outline with shadow)
- [ ] Focus indicators are highly visible
- [ ] Indicator color contrasts with background:
  - Light mode: Blue outline with shadow
  - Dark mode: Cyan outline with shadow

**Steps:**
3. Click with mouse

**Expected Results:**
- [ ] Focus indicators disappear
- [ ] Only visible when using keyboard (class: keyboard-navigation)

**Steps:**
4. Press Tab again

**Expected Results:**
- [ ] Focus indicators reappear

### Tab Navigation

**Steps:**
1. Start from top of Quest Selection screen
2. Press Tab repeatedly

**Expected Flow:**
- [ ] Focus moves to "Skip to main content" link (appears at top)
- [ ] Focus moves to dark mode toggle
- [ ] Focus moves to settings button
- [ ] Focus moves to logout button
- [ ] Focus moves to first quest card button
- [ ] Focus cycles through all interactive elements
- [ ] Focus returns to top after last element

**Verification:**
- [ ] Focus order is logical (top to bottom, left to right)
- [ ] All interactive elements are reachable
- [ ] No focus traps (can always move forward/backward)

### Skip to Main Content

**Steps:**
1. Reload page
2. Press Tab once

**Expected Results:**
- [ ] "Skip to main content" link appears at top of page
- [ ] Link has clear focus indicator
- [ ] Pressing Enter activates link
- [ ] Page smoothly scrolls to main content area
- [ ] Focus moves to main content

### Keyboard Shortcuts

**Test each shortcut:**

**Escape Key:**
- [ ] **From chat view:** Pressing Esc returns to quest list
- [ ] **Settings modal open:** Pressing Esc closes modal
- [ ] **Character intro card:** Pressing Esc does NOT close (by design)

**Ctrl/Cmd + K:**
- [ ] Opens settings modal (from any view)
- [ ] Pressing again closes settings modal
- [ ] Works on Windows (Ctrl) and Mac (Cmd)

**Ctrl/Cmd + /:**
- [ ] Returns to quest view from chat
- [ ] Same as pressing Esc in chat

### Keyboard-Only User Flow

**Steps:**
1. Navigate to quest list (keyboard only)
2. Tab to a quest card's "Start Quest" button
3. Press Enter to start quest
4. In chat view, Tab to input field
5. Type a message
6. Tab to Send button
7. Press Enter to send
8. Complete quest using only keyboard
9. Press Esc to return to quest list

**Expected Results:**
- [ ] Entire flow possible without mouse
- [ ] All interactions work via keyboard
- [ ] No dead ends or unreachable elements

---

## Test Scenario 9: Screen Reader Support 🔊

**Goal:** Verify app is fully navigable with screen readers

### Screen Reader Setup

**Windows (NVDA - Free):**
1. Download NVDA from nvaccess.org
2. Install and launch
3. NVDA will start reading automatically

**Mac (VoiceOver - Built-in):**
1. Press Cmd + F5 to enable
2. VoiceOver begins speaking
3. Use Ctrl+Option+Arrow keys to navigate

**iOS (VoiceOver):**
1. Settings > Accessibility > VoiceOver > On
2. Double-tap to activate elements

**Android (TalkBack):**
1. Settings > Accessibility > TalkBack > On
2. Swipe to navigate, double-tap to activate

### Page Structure

**Steps:**
1. Enable screen reader
2. Navigate through page structure

**Expected Announcements:**
- [ ] "Banner" region (for header)
- [ ] "Main" region (for main content)
- [ ] "Navigation" region (for bottom nav on mobile)
- [ ] Regions are properly labeled

### Button and Link Labels

**Steps:**
1. Tab through interactive elements
2. Listen to screen reader announcements

**Expected Announcements:**
- [ ] Buttons announce their purpose:
  - "Start Quest, button"
  - "Send message, button"
  - "Open settings, button"
  - "Toggle dark mode, button"
- [ ] All buttons have clear, descriptive labels
- [ ] No buttons announced as "button" with no label

### Navigation Announcements

**Steps:**
1. On mobile viewport, navigate bottom nav
2. Activate each button

**Expected Announcements:**
- [ ] "Quests, navigation, current page" (for active button)
- [ ] "Quiz, navigation"
- [ ] "Profile, navigation"
- [ ] Active state is clearly announced

### Modal Dialogs

**Steps:**
1. Open settings modal
2. Screen reader should announce:

**Expected Announcements:**
- [ ] "Settings, dialog"
- [ ] Modal title is properly identified
- [ ] Focus moves into modal
- [ ] Can navigate within modal
- [ ] Escape closes modal and announces closure

### Live Regions

**Steps:**
1. Navigate between views (quest list → chat → quiz)
2. Listen for announcements

**Expected Announcements:**
- [ ] "Navigated to Quest Selection" (when showing quest list)
- [ ] "Navigated to Quest Chat" (when starting quest)
- [ ] "Navigated to Placement Test" (when showing quiz)
- [ ] Announcements are polite (don't interrupt current reading)

### Hidden Decorative Elements

**Steps:**
1. Navigate through quest cards
2. Screen reader should skip decorative icons

**Expected Results:**
- [ ] Emoji icons with aria-hidden="true" are not announced
- [ ] Only meaningful content is read aloud
- [ ] No confusion from decorative elements

### Screen Reader Only Content

**Steps:**
1. Press Tab until "Skip to main content" link appears
2. Screen reader should announce it

**Expected Results:**
- [ ] "Skip to main content, link" is announced
- [ ] Link is accessible to screen readers
- [ ] Link is visually hidden but readable by screen reader

### Full User Journey

**Steps (screen reader enabled):**
1. Navigate to Quest Selection
2. Find and activate a quest card
3. Listen to character introduction
4. Navigate to chat input
5. Type and send message
6. Navigate through chat messages
7. Complete quest
8. Navigate back to quest list

**Expected Results:**
- [ ] Every step is possible with screen reader
- [ ] All content is announced clearly
- [ ] Navigation is logical and intuitive
- [ ] No confusion or missing information

---

## Test Scenario 10: Onboarding Tour 👋

**Goal:** Verify interactive walkthrough guides new users

### First-Time User Experience

**Steps:**
1. Clear localStorage to simulate first-time user:
   - Open DevTools (F12)
   - Go to Application tab → Local Storage
   - Right-click → Clear
2. Refresh page
3. Login or wait after login

**Expected Results:**
- [ ] Tour starts automatically after 1 second
- [ ] Dark overlay appears with backdrop blur
- [ ] Spotlight highlights first target element
- [ ] Tooltip appears with tour content

### Tour Steps

**Step 1: Welcome Message**

**Expected Results:**
- [ ] Spotlight highlights the main content area
- [ ] Tooltip appears (below spotlight)
- [ ] Tooltip content:
  - "Welcome to ConvoQuest!" heading
  - Description of the app
  - "Next" button
  - "Skip" button
  - Progress dots: 1st dot active (●○○○)
- [ ] Tooltip arrow points toward spotlight

**Steps:**
- [ ] Click "Next" button

**Step 2: Quest List**

**Expected Results:**
- [ ] Spotlight moves to quest list area
- [ ] Tooltip repositions (above spotlight)
- [ ] Tooltip content:
  - "Browse Quests" heading
  - Description of quest cards
  - "Next" and "Skip" buttons
  - Progress dots: 2nd dot active (○●○○ or similar)
- [ ] Smooth transition from step 1 to step 2

**Steps:**
- [ ] Click "Next" button

**Step 3: Settings**

**Expected Results:**
- [ ] Spotlight moves to settings button (⚙️)
- [ ] Tooltip repositions appropriately
- [ ] Tooltip content:
  - "Settings & Accessibility" heading
  - Description of accessibility features
  - Progress dots: 3rd dot active
- [ ] Spotlight has glowing blue border

**Steps:**
- [ ] Click "Next" button

**Step 4: Mobile Navigation (if visible)**

**If on mobile viewport:**

**Expected Results:**
- [ ] Spotlight moves to bottom navigation
- [ ] Tooltip repositions above nav
- [ ] Tooltip content:
  - "Mobile Navigation" heading
  - Description of bottom nav
  - "Finish" button (instead of "Next")
  - Progress dots: 4th dot active (○○○●)

**If NOT on mobile:**
- [ ] This step is skipped
- [ ] Step 3 shows "Finish" instead of "Next"

**Steps:**
- [ ] Click "Finish" button

**After Completion:**

**Expected Results:**
- [ ] Tour overlay disappears
- [ ] App returns to normal state
- [ ] Tour completion saved in localStorage
- [ ] Can now use app normally

### Skip Functionality

**Steps:**
1. Restart tour (clear localStorage and refresh)
2. On Step 1, click "Skip" button

**Expected Results:**
- [ ] Tour immediately ends
- [ ] Overlay disappears
- [ ] Tour completion saved (won't show again)

### Tooltip Positioning

**Steps:**
1. Restart tour
2. Resize browser window during tour
3. Observe tooltip position

**Expected Results:**
- [ ] Tooltip repositions to stay on screen
- [ ] Tooltip never goes off-screen
- [ ] Arrow always points toward target element
- [ ] Works at various screen sizes

### Visual Design

**Expected Results:**
- [ ] **Overlay:** Dark semi-transparent background (rgba(0,0,0,0.8))
- [ ] **Spotlight:**
  - Clear cutout showing target element
  - Glowing blue border (box-shadow)
  - Rounded corners
- [ ] **Tooltip:**
  - White background (or dark in dark mode)
  - Rounded corners
  - Shadow for depth
  - Arrow pointing to target
  - Clear typography
- [ ] **Progress Dots:**
  - Current step is highlighted
  - Other dots are dimmed
  - Easy to understand progress (e.g., 2 of 4)

### Persistence

**Steps:**
1. Complete the tour
2. Refresh the page

**Expected Results:**
- [ ] Tour does NOT show again
- [ ] localStorage has `onboardingTourComplete: true`

**Steps:**
3. Open DevTools console
4. Run: `window.restartOnboardingTour()`

**Expected Results:**
- [ ] Tour restarts from step 1
- [ ] Can go through tour again
- [ ] Useful for testing/debugging

### Dark Mode Compatibility

**Steps:**
1. Enable dark mode
2. Restart tour

**Expected Results:**
- [ ] Tooltip uses dark theme colors
- [ ] Text is readable in dark mode
- [ ] Spotlight still clearly visible
- [ ] All elements properly styled for dark mode

---

## Integration Testing: All Features Together 🎯

**Goal:** Verify all Priority 3 features work harmoniously

### Mobile User Journey

**Steps:**
1. Open app on mobile device (or emulation)
2. Clear localStorage (simulate new user)
3. Login

**Expected Flow:**
- [ ] Onboarding tour starts automatically
- [ ] Complete tour (or skip)
- [ ] Bottom navigation is visible
- [ ] All buttons show ripple effects on tap
- [ ] Can navigate using bottom nav
- [ ] Start a quest using bottom nav
- [ ] Swipe right to go back
- [ ] Smooth scrolling throughout
- [ ] All features work together smoothly

### Accessibility User Journey

**Steps:**
1. Enable high contrast mode
2. Set font size to Large
3. Enable screen reader
4. Navigate app with keyboard only

**Expected Results:**
- [ ] High contrast mode + large fonts work together
- [ ] Focus indicators visible in high contrast
- [ ] Screen reader reads all content
- [ ] Keyboard navigation works with accessibility features
- [ ] All features remain functional
- [ ] Settings persist across page refresh

### Desktop Power User Journey

**Steps:**
1. Open app on desktop
2. Use only keyboard shortcuts:
   - Tab to navigate
   - Ctrl+K to open settings
   - Escape to close modals
   - Enter to activate buttons
3. Complete a quest without using mouse

**Expected Results:**
- [ ] Can perform all actions via keyboard
- [ ] Shortcuts work consistently
- [ ] Focus indicators guide navigation
- [ ] Skip-to-content link accessible
- [ ] Smooth scrolling on keyboard navigation
- [ ] Button micro-interactions work with Enter key

---

## Regression Testing: Verify Existing Features Still Work

**Goal:** Ensure Priority 3 changes didn't break Priority 1 & 2 features

### Priority 1 Features

- [ ] Chat interface displays correctly
- [ ] Quest cards render properly
- [ ] XP progress bar works
- [ ] AI responses arrive and display

### Priority 2 Features

- [ ] Typing indicators show before AI responses
- [ ] Character introduction cards appear
- [ ] Celebration effects trigger on quest completion
- [ ] Dark mode toggle still works
- [ ] TTS audio plays correctly

### Core Functionality

- [ ] Login/signup works
- [ ] Placement test works
- [ ] Quest completion saves to Firebase
- [ ] Quest prerequisites unlock correctly
- [ ] Translation feature works
- [ ] Settings persist in localStorage

---

## Performance Testing

**Goal:** Ensure new features don't degrade performance

### Load Time

**Steps:**
1. Clear cache
2. Reload page
3. Measure load time (DevTools → Network tab)

**Expected Results:**
- [ ] Page loads in under 3 seconds
- [ ] No console errors
- [ ] No 404 errors for resources

### Animation Performance

**Steps:**
1. Open DevTools → Performance tab
2. Start recording
3. Trigger multiple ripple effects
4. Let skeleton loaders animate
5. Navigate with swipe gestures
6. Stop recording

**Expected Results:**
- [ ] Animations run at 60fps (consistent)
- [ ] No frame drops or jank
- [ ] CPU usage remains reasonable
- [ ] No memory leaks

### Mobile Performance

**Steps:**
1. Test on actual mobile device (not just emulation)
2. Interact with bottom nav repeatedly
3. Perform multiple swipe gestures
4. Toggle settings multiple times

**Expected Results:**
- [ ] No lag or delay in interactions
- [ ] Smooth animations on mobile hardware
- [ ] Battery drain is reasonable
- [ ] App remains responsive

---

## Browser Compatibility Testing

**Test all features in multiple browsers:**

### Chrome/Edge (Chromium)
- [ ] All 10 features work correctly
- [ ] No console errors
- [ ] Animations smooth

### Firefox
- [ ] All 10 features work correctly
- [ ] Focus indicators display properly
- [ ] Keyboard shortcuts work

### Safari (if available)
- [ ] All 10 features work correctly
- [ ] CSS backdrop-filter works (glassmorphism)
- [ ] Touch gestures work on iOS

---

## Issue Reporting Template

If you encounter bugs, document:

**Bug Report:**
1. **Feature:** Which Priority 3 feature has the issue?
2. **Steps to Reproduce:**
   - Step 1
   - Step 2
   - Step 3
3. **Expected Result:** What should happen?
4. **Actual Result:** What actually happened?
5. **Browser & Device:** Chrome on Windows 11, iPhone 13 Pro, etc.
6. **Console Errors:** (F12 → Console tab, screenshot if possible)
7. **Screenshots/Video:** Visual evidence of the bug

---

## Testing Checklist Summary

### Micro-Interactions
- [ ] Button ripple effects work
- [ ] Smooth scrolling enabled
- [ ] Skeleton loaders display

### Mobile Optimization
- [ ] Bottom navigation shows on mobile
- [ ] Swipe gestures navigate back

### Accessibility
- [ ] High contrast mode works
- [ ] Font sizes adjustable
- [ ] Keyboard navigation functional
- [ ] Screen reader support complete

### Onboarding
- [ ] Tour shows for new users
- [ ] Can complete or skip tour
- [ ] Tour doesn't repeat after completion

### Integration
- [ ] All features work together
- [ ] No conflicts between features
- [ ] Performance remains good

### Regression
- [ ] Priority 1 & 2 features still work
- [ ] Core functionality intact
- [ ] No new bugs introduced

---

## Deployment Readiness

**After all tests pass:**

- [ ] All 10 Priority 3 features tested
- [ ] All tests marked as passed
- [ ] No critical bugs found
- [ ] Performance is acceptable
- [ ] Browser compatibility confirmed
- [ ] Mobile testing complete
- [ ] Accessibility verified

**Ready to deploy!**

---

## Next Steps After Testing

1. **If bugs found:**
   - Document all issues
   - Fix critical bugs before deployment
   - Re-test fixed issues

2. **If all tests pass:**
   - Validate JavaScript syntax:
     ```bash
     node -c public/app.js
     node -c public/quest-data.js
     ```
   - Build for production:
     ```bash
     npm run build
     ```
   - Push commits to remote:
     ```bash
     git push origin main
     ```
   - Deploy to Vercel:
     ```bash
     vercel --prod
     ```
   - Verify production deployment
   - Test critical features on production
   - Update documentation

3. **Future considerations:**
   - Gather user feedback on new features
   - Monitor analytics for feature usage
   - Plan Priority 4 or next phase

---

**Testing Complete!** ✅

Once all scenarios pass, Priority 3 is production-ready and can be deployed with confidence.
