# ElevenLabs Integration Testing Scenario

**Version:** v2.2.0
**Date:** 2025-11-10
**Features to Test:** ElevenLabs TTS + Background Music

---

## 🎯 Testing Objectives

1. ✅ Verify ElevenLabs TTS is working (high-quality character voices)
2. ✅ Verify background music generates and plays
3. ✅ Test different character voices
4. ✅ Test mood-based voice adjustments
5. ✅ Test graceful fallback system

---

## 📋 Test Scenario 1: Basic TTS + Music Experience

### Setup:
1. **Open production URL:** https://language-by-google-96shfavsq-richard-barnetts-projects.vercel.app
2. **Login** with your account (or create new account)
3. **Complete placement test** if you're a new user

### Test Steps:

#### Step 1: Start the Onboarding Quest
1. After placement test, you'll auto-start "The Adventure Begins" quest
2. **Listen carefully** to the first message from Abuela
3. **Expected:** You should hear:
   - High-quality Spanish voice (much clearer than before)
   - Gentle background music fading in (acoustic guitar atmosphere)
   - Voice should sound natural and expressive

**✅ Pass Criteria:**
- Voice is clear and natural (not robotic)
- Background music is playing at low volume
- Music doesn't overpower the voice

**What to Listen For:**
- ElevenLabs voices have:
  - Better pronunciation of Spanish words
  - Natural intonation on questions (¿?)
  - Emotional expression
  - Smoother transitions between words

---

#### Step 2: Test Character Voice Consistency
1. Continue the onboarding conversation
2. Send multiple messages to Abuela
3. Each response should maintain the same voice

**✅ Pass Criteria:**
- Voice remains consistent across messages
- Background music continues looping smoothly
- No audio overlap or stuttering

---

#### Step 3: Test Background Music Loop
1. Stay in the quest for at least 60 seconds
2. Listen for the music to loop seamlessly
3. Expected: 30-second music clips loop continuously

**✅ Pass Criteria:**
- Music loops without gaps
- Volume stays consistent at ~30% of voice
- Fade effects are smooth

---

## 📋 Test Scenario 2: Different Character Voices

### Test Steps:

#### Step 1: Complete Onboarding
1. Finish the onboarding quest (find the cat, return it)
2. Return to quest selection screen

#### Step 2: Start "The Missing Guitar" Quest
1. Click on "The Missing Guitar" quest
2. Meet **Mateo the Concierge** (mature male voice)
3. **Expected:** Different voice than Abuela
   - Lower pitch
   - Professional/formal tone
   - ElevenLabs Voice ID: VR6AewLTigWG4xSOukaG

**✅ Pass Criteria:**
- Mateo sounds noticeably different from Abuela
- Voice fits a professional concierge character
- Background music changes (new theme for this quest)

#### Step 3: Start "La Farmacia" (Daily Quest)
1. Exit "The Missing Guitar" (swipe right or click back)
2. Start "La Farmacia" quest
3. Meet the pharmacist
4. **Expected:**
   - Another distinct voice
   - Background music: "gentle spanish acoustic guitar, warm friendly atmosphere"

**✅ Pass Criteria:**
- Each character has a unique voice
- Music themes match quest atmosphere
- Smooth transitions between quests

---

## 📋 Test Scenario 3: Mood-Based Voice Adjustments

### Test Steps:

#### Step 1: Test Excited/Happy Mood
1. In any quest, wait for an excited response from NPC
2. Look for messages with:
   - Multiple exclamation marks (¡¡!!)
   - Words like "¡Genial!", "¡Increíble!", "¡Perfecto!"
3. **Expected:** Voice should:
   - Speak faster (~1.15x speed)
   - Higher pitch
   - More energy

**✅ Pass Criteria:**
- Excited text sounds enthusiastic
- Speed increase is noticeable but natural
- Doesn't sound rushed or distorted

#### Step 2: Test Calm/Mysterious Mood
1. Look for responses with:
   - Words like "tranquilo", "despacio", "secreto"
   - Slower, contemplative text
2. **Expected:** Voice should:
   - Speak slower (~0.85-0.9x speed)
   - Lower pitch
   - More relaxed tone

**✅ Pass Criteria:**
- Calm text sounds soothing
- Mysterious text sounds intriguing
- Speed changes feel natural

---

## 📋 Test Scenario 4: Fallback System Test

### Test Steps:

#### Step 1: Monitor Browser Console
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Start any quest and watch for TTS logs

**Expected Console Output:**
```
[TTS] Calling ElevenLabs API
[TTS] ✓ ElevenLabs succeeded
[TTS] ✓ Successfully playing audio from elevenlabs provider
```

**✅ Pass Criteria:**
- Console shows "ElevenLabs succeeded"
- No fallback to Cartesia/OpenAI/Google
- No errors in console

#### Step 2: Simulate ElevenLabs Failure (Optional - Advanced)
**Note:** This requires temporarily removing the API key

1. If you see fallback logs, check:
```
[TTS] ✗ ElevenLabs failed, falling back to Cartesia
[TTS] ✓ Cartesia succeeded
```

**✅ Pass Criteria:**
- App gracefully falls back to next provider
- Audio still plays (no silence)
- User experience isn't broken

---

## 📋 Test Scenario 5: Background Music Controls

### Test Steps:

#### Step 1: Test Music Fade-In
1. Start any quest
2. Background music should:
   - Start at 0% volume
   - Fade in over 2 seconds
   - Reach 30% volume

**✅ Pass Criteria:**
- Fade-in is smooth and noticeable
- Music doesn't blast at full volume immediately

#### Step 2: Test Music Fade-Out
1. Exit the quest (swipe right or click back)
2. Background music should:
   - Fade out over 1 second
   - Reach 0% volume
   - Stop completely

**✅ Pass Criteria:**
- Fade-out is smooth
- Music stops cleanly (no abrupt cut)

#### Step 3: Test Music Persistence
1. Stay in a quest
2. Background music should continue playing while:
   - You send messages
   - NPC responds
   - You wait between messages

**✅ Pass Criteria:**
- Music never stops during quest
- Music volume stays consistent at 30%
- Music doesn't interfere with voice

---

## 📋 Test Scenario 6: Mobile Experience (If on Mobile)

### Test Steps:

#### Step 1: Mobile Audio Test
1. Open app on mobile device
2. Start a quest
3. **Expected:**
   - Audio auto-plays (if browser allows)
   - Background music plays
   - Volume is appropriate

**✅ Pass Criteria:**
- Audio works on mobile
- Swipe gestures still work
- Music doesn't drain battery excessively

---

## 🐛 Common Issues & Solutions

### Issue 1: No Audio Playing
**Symptoms:**
- Silence despite console showing "ElevenLabs succeeded"
- No background music

**Solutions:**
1. Check browser autoplay settings (some browsers block autoplay)
2. Interact with the page first (click/tap somewhere)
3. Check browser console for permission errors
4. Verify volume isn't muted

### Issue 2: ElevenLabs Fails, Uses Fallback
**Symptoms:**
- Console shows "ElevenLabs failed, falling back to Cartesia"

**Possible Causes:**
1. ELEVENLABS_API_KEY not set in Vercel
2. API key is invalid
3. ElevenLabs API quota exceeded
4. Network issue

**Solutions:**
1. Verify API key in Vercel dashboard
2. Check ElevenLabs account status
3. Wait a moment and try again

### Issue 3: Background Music Not Playing
**Symptoms:**
- Voice works but no music

**Possible Causes:**
1. Music generation took too long
2. ElevenLabs Music API issue
3. Browser autoplay blocked

**Solutions:**
1. Check console for music errors: `[Music]`
2. Refresh and try again
3. Interact with page before starting quest

### Issue 4: Audio Overlapping
**Symptoms:**
- Multiple audio tracks playing at once
- Echo effect

**Possible Causes:**
1. Rapid clicking/multiple requests
2. Audio cleanup issue

**Solutions:**
1. Refresh the page
2. Wait for current audio to finish before clicking
3. Report to developer if persists

---

## 📊 Quality Comparison: ElevenLabs vs Google TTS

### What to Compare:

| Feature | Google TTS | ElevenLabs |
|---------|-----------|------------|
| **Voice Quality** | Robotic, flat | Natural, expressive |
| **Spanish Pronunciation** | Good but mechanical | Excellent, native-like |
| **Emotion** | Minimal | Clear emotional tone |
| **Intonation** | Basic | Natural question/statement patterns |
| **Overall Experience** | Functional | Immersive |

**Listen for:**
- More natural breathing patterns
- Better emphasis on important words
- Smoother word transitions
- Less robotic cadence

---

## ✅ Final Checklist

After completing all test scenarios, verify:

- [ ] ElevenLabs TTS is working (check console logs)
- [ ] Background music plays and loops
- [ ] Different characters have different voices
- [ ] Mood-based adjustments are noticeable
- [ ] Fade-in/fade-out effects work smoothly
- [ ] No audio overlap or stuttering
- [ ] Fallback system works (if tested)
- [ ] Mobile experience is good (if applicable)
- [ ] Overall audio quality is noticeably better

---

## 🎓 Expected Production Behavior

**When Everything Works:**
1. User starts quest
2. Background music fades in (2 seconds)
3. NPC speaks with ElevenLabs voice (high quality)
4. Music continues looping at 30% volume
5. User can have full conversation with audio
6. User exits quest, music fades out (1 second)

**Voice Priority:**
- Voice is always louder than music (70% vs 30%)
- Music never overpowers dialogue
- Music adds atmosphere without distraction

---

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify ELEVENLABS_API_KEY is set in Vercel
3. Try refreshing the page
4. Try a different quest
5. Document the issue and browser/device info

---

**Happy Testing! 🎉**

Expected testing time: 15-20 minutes for all scenarios
