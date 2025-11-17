// app.js - Main application logic
console.log('🟢 app.js module loading...');

import { auth, db, isFirebaseConfigured } from './firebase.js';
console.log('🟢 Firebase imports loaded');

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
console.log('🟢 Firebase auth imports loaded');

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
console.log('🟢 Firebase firestore imports loaded');

// Import character relationship system
import { CHARACTER_DATABASE, getRelationshipLevel } from './character-database.js';
import * as RelationshipSystem from './relationships.js';
import { showRelationshipsView, hideRelationshipsView, initializeCharacterSearch, showAffinityNotification } from './relationships-ui.js';
// getRelationshipLevelData is available as RelationshipSystem.getRelationshipLevelData
console.log('🟢 Relationship system imports loaded');

// Debug logging helper
// Logs to browser console (for debugging with F12 Developer Tools)
function debugLog(msg) {
    console.log(msg);
}

// Initialize the application
export function initializeApp() {
  debugLog('🚀 initializeApp started.');
  if (!isFirebaseConfigured()) {
    console.error('[ConvoQuest] Firebase is not configured properly.');
    // Display a user-friendly error message
    document.body.innerHTML = '<div style="color: red; text-align: center; margin-top: 50px; padding: 20px;">Critical Error: App could not load. Firebase is not configured correctly.<br><br>Please check your environment variables and ensure all Firebase configuration values are set properly.</div>';
    return;
  }

  console.log('[ConvoQuest] Starting application initialization...');

  // Application variables
  let currentUser = null;
  let userSettings = {};
  let currentQuest = null;
  let currentStage = null;
  let messages = [];
  let placementMessages = [];

  // Dev mode detection (set once, used throughout)
  const isDevMode = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

  // Objective tracking variables
  let stageMessageCount = 0;
  let completedObjectives = new Set();
  let shownHints = new Set();
  let stageCompleted = false;
  let farewellSent = false;
  let stageStartTime = null;
  let lastObjectiveAttemptCount = {}; // Track failed attempts per objective

  // TTS state
  let autoplayEnabled = true;
  let currentAudio = null;
  let persistentAudioElement = null; // Reusable audio element to avoid autoplay blocks
  let currentBlobUrl = null; // Track current blob URL for cleanup
  let isSpeaking = false; // Prevent concurrent speak() calls
  let lastTTSBlob = null; // Store last TTS audio for repeat functionality

  // Placement test state
  let placementQuestions = [];
  let currentQuestionIndex = 0;
  let selectedAnswer = null;
  let placementAnswers = [];
  let placementScore = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };

  // DOM elements (defined early to ensure availability)
  debugLog('🔍 Looking up DOM elements...');
  const dom = {
    authContainer: document.getElementById('auth-container'),
    mainAppView: document.getElementById('main-app-view'),
    placementView: document.getElementById('placement-view'),
    loginView: document.getElementById('login-view'),
    signupView: document.getElementById('signup-view'),
    loginEmailInput: document.getElementById('login-email-input'),
    loginPasswordInput: document.getElementById('login-password-input'),
    loginBtn: document.getElementById('login-btn'),
    signupEmailInput: document.getElementById('signup-email-input'),
    signupPasswordInput: document.getElementById('signup-password-input'),
    signupDisplayNameInput: document.getElementById('signup-display-name-input'),
    signupBtn: document.getElementById('signup-btn'),
    showSignupBtn: document.getElementById('show-signup-btn'),
    showLoginBtn: document.getElementById('show-login-btn'),
    userDisplayName: document.getElementById('user-display-name'),
    welcomeMessage: document.getElementById('welcome-message'),
    logoutBtn: document.getElementById('logout-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    menuToggleBtn: document.getElementById('menu-toggle-btn'),
    menuDropdown: document.getElementById('menu-dropdown'),
    relationshipsMenuItem: document.getElementById('relationships-menu-item'),
    preferencesMenuItem: document.getElementById('preferences-menu-item'),
    voiceMenuItem: document.getElementById('voice-menu-item'),
    accessibilityMenuItem: document.getElementById('accessibility-menu-item'),
    logoutMenuItem: document.getElementById('logout-menu-item'),
    settingsModal: document.getElementById('settings-modal'),
    voiceModal: document.getElementById('voice-modal'),
    accessibilityModal: document.getElementById('accessibility-modal'),
    darkModeSetting: document.getElementById('dark-mode-setting'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    closeVoiceBtn: document.getElementById('close-voice-btn'),
    closeAccessibilityBtn: document.getElementById('close-accessibility-btn'),
    dialectSelect: document.getElementById('dialect-select'),
    formalitySelect: document.getElementById('formality-select'),
    voiceSpeedSlider: document.getElementById('voice-speed-slider'),
    voiceSpeedValue: document.getElementById('voice-speed-value'),
    voicePitchSlider: document.getElementById('voice-pitch-slider'),
    voicePitchValue: document.getElementById('voice-pitch-value'),
    testVoiceBtn: document.getElementById('test-voice-btn'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    questList: document.getElementById('quest-list-container'),
    questView: document.getElementById('quest-view'),
    chatView: document.getElementById('chat-view'),
    chatTitle: document.getElementById('chat-title'),
    backToQuestsBtn: document.getElementById('end-session-btn'),
    questTitle: document.getElementById('quest-title'),
    questObjective: document.getElementById('quest-objective'),
    questMapImage: document.getElementById('quest-map-image'),
    characterName: document.getElementById('character-name'),
    vignette: document.getElementById('vignette'),
    chatContainer: document.getElementById('chat-container'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    micBtn: document.getElementById('mic-btn'),
    hintBtn: document.getElementById('hint-btn'),
    objectivesProgress: document.getElementById('objectives-progress'),
    objectivesCount: document.getElementById('objectives-count'),
    submitSentenceBtn: document.getElementById('submit-sentence-btn'),
    translationPopover: document.getElementById('translation-popover'),
    correctionModal: document.getElementById('correction-modal'),
    closeCorrectionBtn: document.getElementById('close-correction-btn'),
    originalSentenceEl: document.getElementById('original-sentence-el'),
    correctedSentenceEl: document.getElementById('corrected-sentence-el'),
    explanationContainer: document.getElementById('explanation-container'),
    explanationText: document.getElementById('explanation-text'),
    explainRuleBtn: document.getElementById('explain-rule-btn'),
    correctionLoading: document.getElementById('correction-loading'),
    placementQuizView: document.getElementById('placement-quiz-view'),
    submitQuizBtn: document.getElementById('submit-quiz-btn'),
    completePlacementBtn: document.getElementById('complete-placement-btn'),
    questionText: document.getElementById('question-text'),
    quizOptions: document.getElementById('quiz-options'),
    currentQuestionNum: document.getElementById('current-question-num'),
    totalQuestions: document.getElementById('total-questions'),
    placementProgressBar: document.getElementById('placement-progress-bar'),
    estimatedLevel: document.getElementById('estimated-level'),
    placementChatView: document.getElementById('placement-chat-view'),
    placementChatContainer: document.getElementById('placement-chat-container'),
    characterIntroOverlay: document.getElementById('character-intro-overlay'),
    characterIntroAvatar: document.getElementById('character-intro-avatar'),
    characterIntroName: document.getElementById('character-intro-name'),
    characterIntroQuest: document.getElementById('character-intro-quest'),
    characterIntroDescription: document.getElementById('character-intro-description'),
    characterIntroContinueBtn: document.getElementById('character-intro-continue-btn'),
    placementChatInput: document.getElementById('placement-chat-input'),
    placementSendBtn: document.getElementById('placement-send-btn'),
    retakePlacementBtn: document.getElementById('retake-placement-btn'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    devModeIndicator: document.getElementById('dev-mode-indicator')
  };

  // Check for critical missing elements
  const criticalElements = ['authContainer', 'mainAppView', 'loginView', 'chatView'];
  const missingElements = criticalElements.filter(key => !dom[key]);
  if (missingElements.length > 0) {
    debugLog(`❌ Missing critical elements: ${missingElements.join(', ')}`);
  } else {
    debugLog('✅ All critical DOM elements found');
  }

  // Dev mode bypass - execute AFTER DOM elements are loaded
  if (isDevMode) {
    console.log('🔧 DEV MODE: Bypassing authentication, going straight to app');

    // Hide auth container and show main app immediately
    if (dom.authContainer) {
      dom.authContainer.style.display = 'none';
      dom.authContainer.classList.remove('active');
      console.log('🔧 DEV MODE: Auth container hidden');
    }
    if (dom.mainAppView) {
      dom.mainAppView.style.display = 'flex';
      dom.mainAppView.classList.add('active');
      console.log('🔧 DEV MODE: Main app view shown');
    }

    // Set a fake current user for dev mode
    currentUser = {
      uid: 'dev-user',
      displayName: 'Dev User',
      email: 'dev@convoquest.local'
    };

    if (dom.userDisplayName) {
      dom.userDisplayName.textContent = 'Dev User';
    }
    if (dom.welcomeMessage) {
      dom.welcomeMessage.textContent = 'Welcome, Dev User!';
    }

    console.log('✅ DEV MODE: Bypass complete - main app should be visible');
  }

  // Content Moderation System
  const ContentModerator = {
    // List of inappropriate words and phrases
    // This is a basic filter - can be expanded as needed
    inappropriatePatterns: [
      // Profanity
      /\b(fuck|shit|damn|hell|ass|bitch|crap|piss)\b/i,
      // Slurs and offensive terms (keeping it minimal for demonstration)
      /\b(stupid|idiot|dumb|hate)\b/i,
      // Explicit content indicators
      /\b(sex|porn|nude)\b/i,
    ],

    // Check if message contains inappropriate content
    checkContent(message) {
      const lowerMessage = message.toLowerCase().trim();

      // Check against patterns
      for (const pattern of this.inappropriatePatterns) {
        if (pattern.test(lowerMessage)) {
          return {
            isAppropriate: false,
            reason: 'inappropriate-language'
          };
        }
      }

      // Check for excessive caps (might indicate shouting/aggression)
      const upperCaseCount = (message.match(/[A-Z]/g) || []).length;
      const totalLetters = (message.match(/[A-Za-z]/g) || []).length;
      if (totalLetters > 10 && upperCaseCount / totalLetters > 0.7) {
        return {
          isAppropriate: false,
          reason: 'excessive-caps'
        };
      }

      return {
        isAppropriate: true
      };
    },

    // Get user-friendly warning message
    getWarningMessage(reason) {
      const messages = {
        'inappropriate-language': '⚠️ Please keep your language respectful and appropriate. ConvoQuest is a friendly learning environment for all ages.',
        'excessive-caps': '⚠️ Please avoid using excessive capital letters. Let\'s keep our conversation calm and respectful.',
        'default': '⚠️ Please keep your messages respectful and appropriate. Let\'s focus on learning Spanish together!'
      };
      return messages[reason] || messages['default'];
    }
  };

  // AI Manager for secure backend communication
  // Uses Claude 3.5 Sonnet for better rule-following in NPC conversations
  const AIManager = {
    async callAPI(systemInstruction, contents, retries = 3, delay = 1000) {
      try {
        const response = await fetch('/api/claude', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemInstruction, contents })
        });

        if (response.status === 429 && retries > 0) {
          console.warn(`[AIManager] Rate limited. Retrying in ${delay / 1000}s... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.callAPI(systemInstruction, contents, retries - 1, delay * 2); // Exponential backoff
        }

        if (!response.ok) {
          const errorBody = await response.json();
          console.error("API Error:", errorBody);
          const errorMessage = `Error: ${errorBody.error || 'Unknown API error'}. Please try again later.`;
          addMessage('system', errorMessage); // Notify user of the error
          return null; // Return null to indicate failure
        }

        // Try to parse JSON response with better error handling
        let result;
        try {
          const responseText = await response.text();
          console.log('[API] Response text length:', responseText.length);
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error('[API] JSON Parse Error:', parseError);
          console.error('[API] Response status:', response.status);
          console.error('[API] Response headers:', Object.fromEntries(response.headers.entries()));
          const errorMessage = "Sorry, I received an invalid response from the server. Please try again.";
          addMessage('system', errorMessage);
          return null;
        }

        // Safely access the response text
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
          return result.candidates[0].content.parts[0].text;
        } else {
          console.warn("API returned no candidates. Full response:", result);
          return "I'm sorry, I couldn't generate a response for that. Please try something else.";
        }
      } catch (error) {
        console.error("[API] Fetch Error:", error);
        console.error("[API] Error name:", error.name);
        console.error("[API] Error message:", error.message);
        console.error("[API] Error stack:", error.stack);
        const errorMessage = "Sorry, there was a network error. Please check your connection and try again.";
        addMessage('system', errorMessage); // Notify user of the error
        return null; // Return null to indicate failure
      }
    },

    async sendMessage(text) {
      const systemInstruction = "You are a helpful Spanish language tutor.";
      const contents = [{ role: "user", parts: [{ text }] }];
      return this.callAPI(systemInstruction, contents);
    }
  };

  // Initialize persistent audio element for better autoplay support
  const initPersistentAudio = () => {
    if (persistentAudioElement) return;

    persistentAudioElement = new Audio();
    persistentAudioElement.preload = 'auto';

    // Set up event handlers
    persistentAudioElement.onended = () => {
      console.log('[TTS] Audio playback ended');
      // Clean up blob URL when audio finishes
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
      }
      currentAudio = null;
      // CRITICAL: Release the lock when audio finishes
      isSpeaking = false;
      console.log('[TTS] Lock released (playback ended), isSpeaking = false');
    };

    persistentAudioElement.onerror = (err) => {
      console.error('[TTS] Audio error:', err);
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
      }
      currentAudio = null;
      // CRITICAL: Release the lock on error
      isSpeaking = false;
      console.log('[TTS] Lock released (error), isSpeaking = false');
    };

    console.log('[TTS] Persistent audio element initialized');
  };

  // Audio unlock for browser autoplay policy
  let audioUnlocked = false;
  const unlockAudio = () => {
    if (audioUnlocked) return;

    // Initialize persistent audio element
    initPersistentAudio();

    // Play silent audio to unlock
    if (persistentAudioElement) {
      persistentAudioElement.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwP////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAQKAAAAAAAAA4S/C8yPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAAQVTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMQpg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
      persistentAudioElement.volume = 0;
      persistentAudioElement.play().then(() => {
        audioUnlocked = true;
        console.log('[TTS] Audio unlocked for autoplay');
      }).catch(() => {
        // Silently fail - will try again on next interaction
      });
    }
  };

  // Add unlock audio on any user interaction
  ['click', 'touchstart', 'keydown'].forEach(event => {
    document.addEventListener(event, unlockAudio, { once: true });
  });

  // TTS Manager for natural AI voice output
  const TTSManager = {
    // Clean text for TTS - remove translations and actions
    _cleanTextForSpeech(text) {
      // Remove text in parentheses (translations)
      let cleaned = text.replace(/\([^)]*\)/g, '');

      // Remove text in asterisks only if it's a short action description
      // Keep longer dialogue/narrative text in asterisks
      // Actions: "*leans in closer*" - short, no sentence punctuation
      // Dialogue: "*You're almost there...*" - longer, has punctuation
      cleaned = cleaned.replace(/\*([^*]+)\*/g, (match, content) => {
        // Keep if content is long (> 50 chars) or contains sentence punctuation
        if (content.length > 50 || /[.!?]/.test(content)) {
          return content; // Remove asterisks but keep content
        }
        return ''; // Remove both asterisks and content (it's an action)
      });

      // Convert ellipsis to period for proper pause (TTS engines don't interpret ... as pauses)
      // "Please, tell me..." becomes "Please, tell me."
      cleaned = cleaned.replace(/\.{2,}/g, '.');

      // Handle Spanish inverted exclamation marks
      // Add a subtle pause before them: "¡Rick!" becomes ". ¡Rick!"
      // This helps TTS engines separate the exclamation from preceding text
      cleaned = cleaned.replace(/\s*¡/g, '. ¡');

      // Emphasize questions for better intonation
      // Add a subtle pause before Spanish question marks: "¿quién eres?" becomes ", ¿quién eres?"
      cleaned = cleaned.replace(/\s*¿/g, ', ¿');

      // Double question marks help TTS recognize question intonation
      // "¿quién eres?" becomes "¿quién eres??"
      cleaned = cleaned.replace(/\?(?!\?)/g, '??');

      // Double exclamation marks for emphasis
      // "¡Rick!" becomes "¡Rick!!"
      cleaned = cleaned.replace(/!(?!!)/g, '!!');

      // Ensure proper spacing after punctuation
      cleaned = cleaned.replace(/([.!?,;:])\s*/g, '$1 ');

      // Clean up multiple periods in a row (caused by our ¡ handling)
      cleaned = cleaned.replace(/\.{2,}/g, '.');

      // Clean up extra spaces and leading punctuation
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      cleaned = cleaned.replace(/^[,.\s]+/, ''); // Remove leading comma/period if text starts with ¡ or ¿

      return cleaned;
    },

    // Detect emotional mood from text content
    _detectMood(text) {
      const lowerText = text.toLowerCase();

      // Excited/Happy indicators
      if (lowerText.includes('!') && (lowerText.match(/!/g) || []).length >= 2) {
        return 'excited';
      }
      if (/\b(genial|increíble|fantástico|maravilloso|excelente|perfecto|feliz|alegr|content)\b/.test(lowerText)) {
        return 'happy';
      }

      // Urgent/Hurried indicators
      if (/\b(rápid|prisa|urgent|ahora|ya|inmediatamente|corre|deprisa)\b/.test(lowerText)) {
        return 'urgent';
      }

      // Sad/Disappointed indicators
      if (/\b(triste|lament|perdón|disculp|lo siento|desafortunad|pena)\b/.test(lowerText)) {
        return 'sad';
      }

      // Angry/Frustrated indicators
      if (/\b(molest|enfadad|furioso|inaceptable|terrible|ridícul)\b/.test(lowerText)) {
        return 'angry';
      }

      // Calm/Peaceful indicators
      if (/\b(tranquil|calm|relaj|paz|suave|despacio|lentamente)\b/.test(lowerText)) {
        return 'calm';
      }

      // Mysterious/Whisper indicators
      if (/\b(secreto|susurr|silencio|misteriosa?|oculto|escondid)\b/.test(lowerText)) {
        return 'mysterious';
      }

      // Question/Curious indicators
      if (lowerText.includes('?') || /\b(pregunt|curiosidad|interesante|por qué|cómo|qué|cuál)\b/.test(lowerText)) {
        return 'curious';
      }

      return 'neutral';
    },

    // Calculate voice parameter adjustments based on mood
    _getMoodAdjustments(mood) {
      const adjustments = {
        // Speed multiplier (0.7 = slower, 1.3 = faster)
        // Pitch adjustment (-3 = lower, +3 = higher) - for Google TTS fallback
        // Cartesia emotions (using Cartesia's native emotion control)
        excited: { speedMult: 1.15, pitchAdj: 2, cartesiaEmotion: ['positivity:high', 'curiosity'] },
        happy: { speedMult: 1.05, pitchAdj: 1, cartesiaEmotion: ['positivity:high'] },
        urgent: { speedMult: 1.25, pitchAdj: 1, cartesiaEmotion: ['surprise:high'] },
        sad: { speedMult: 0.85, pitchAdj: -2, cartesiaEmotion: ['sadness:high'] },
        angry: { speedMult: 1.1, pitchAdj: 0, cartesiaEmotion: ['anger:high'] },
        calm: { speedMult: 0.9, pitchAdj: -1, cartesiaEmotion: ['positivity:low'] },
        mysterious: { speedMult: 0.85, pitchAdj: -2, cartesiaEmotion: ['curiosity:low'] },
        curious: { speedMult: 1.0, pitchAdj: 1, cartesiaEmotion: ['curiosity:high'] },
        neutral: { speedMult: 1.0, pitchAdj: 0, cartesiaEmotion: [] }
      };

      return adjustments[mood] || adjustments.neutral;
    },

    async speak(text, characterName, characterGender) {
      console.log('[TTS] ===== NEW SPEAK REQUEST =====');
      console.log('[TTS] isSpeaking flag:', isSpeaking);

      // CRITICAL: If already speaking, stop current audio and wait for it to fully stop
      if (isSpeaking) {
        console.log('[TTS] ⚠️ Already speaking! Interrupting current audio...');
        this.stop();
        // Force release the lock
        isSpeaking = false;
        // Wait for cleanup to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('[TTS] Previous audio interrupted and cleaned up');
      }

      // Set flag immediately to block any other calls
      isSpeaking = true;
      console.log('[TTS] Lock acquired, isSpeaking = true');

      // Aggressively stop any audio that might be playing (safety check)
      this.stop();

      try {
        console.log(`[TTS] Original text: "${text.substring(0, 50)}..."`);

        // Clean text for speech (remove translations and actions)
        const cleanedText = this._cleanTextForSpeech(text);
        console.log(`[TTS] Cleaned text: "${cleanedText.substring(0, 50)}..."`);

        if (!cleanedText || cleanedText.trim().length === 0) {
          console.log('[TTS] No speakable text after cleaning, skipping TTS');
          isSpeaking = false;
          console.log('[TTS] Lock released (no text), isSpeaking = false');
          return;
        }

        // Detect mood from original text (before cleaning) and apply voice adjustments
        const mood = this._detectMood(text);
        const moodAdjustments = this._getMoodAdjustments(mood);
        console.log(`[TTS] Detected mood: ${mood} (speed: ${moodAdjustments.speedMult}x, pitch: ${moodAdjustments.pitchAdj > 0 ? '+' : ''}${moodAdjustments.pitchAdj})`);

        // Always use Cartesia -> OpenAI -> Google fallback order for best quality
        let data = null;

        // Try Cartesia first (best quality native Spanish voices)
        data = await this._tryCartesia(cleanedText, characterName, characterGender, moodAdjustments);

        if (data) {
          console.log('[TTS] ✓ Cartesia succeeded');
        }

        // Fallback to OpenAI if Cartesia fails
        if (!data) {
          console.log('[TTS] ✗ Cartesia failed, falling back to OpenAI');
          data = await this._tryOpenAI(cleanedText, characterName, characterGender, moodAdjustments);
          if (data) {
            console.log('[TTS] ✓ OpenAI succeeded');
          }
        }

        // Final fallback to Google if both Cartesia and OpenAI fail
        if (!data) {
          console.log('[TTS] ✗ OpenAI failed, falling back to Google');
          data = await this._tryGoogle(cleanedText, characterName, characterGender, moodAdjustments);
          if (data) {
            console.log('[TTS] ✓ Google succeeded');
          }
        }

        // Play audio if we got it from either provider
        if (data && data.audioContent) {
          // Ensure persistent audio element is initialized
          initPersistentAudio();

          // CRITICAL: Completely destroy and recreate audio element to prevent overlap
          if (persistentAudioElement) {
            console.log('[TTS] Destroying previous audio element...');
            persistentAudioElement.pause();
            persistentAudioElement.currentTime = 0;
            persistentAudioElement.src = '';
            persistentAudioElement.load(); // Force abort of any loading
          }

          // Clean up old blob URL
          if (currentBlobUrl) {
            URL.revokeObjectURL(currentBlobUrl);
            currentBlobUrl = null;
          }

          // Brief wait for cleanup (load() already aborted any loading)
          await new Promise(resolve => setTimeout(resolve, 50));

          try {
            console.log('[TTS] Loading new audio...');

            // Convert base64 to blob for better memory management
            const byteCharacters = atob(data.audioContent);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mp3' });

            // Store the last TTS audio for repeat functionality
            lastTTSBlob = blob;
            // Enable repeat button
            const repeatBtn = document.getElementById('repeat-tts-btn');
            if (repeatBtn) repeatBtn.disabled = false;

            // Create blob URL and set as source
            currentBlobUrl = URL.createObjectURL(blob);
            persistentAudioElement.src = currentBlobUrl;
            persistentAudioElement.volume = 1;
            persistentAudioElement.load(); // Explicitly load the new audio
            currentAudio = persistentAudioElement;

            console.log('[TTS] Attempting to play...');

            // Play the audio
            const playPromise = persistentAudioElement.play();

            if (playPromise !== undefined) {
              await playPromise.then(() => {
                console.log(`[TTS] ✓ Successfully playing audio from ${data.provider || 'unknown'} provider`);
              }).catch(err => {
                console.error('[TTS] Playback error:', err);
                if (err.name === 'NotAllowedError') {
                  console.warn('[TTS] Autoplay blocked. Please interact with the page.');
                }
                isSpeaking = false;
                console.log('[TTS] Lock released (playback error), isSpeaking = false');
              });
            }
          } catch (err) {
            console.error('[TTS] Error preparing audio:', err);
            isSpeaking = false;
            console.log('[TTS] Lock released (preparation error), isSpeaking = false');
          }
        } else {
          console.error('[TTS] All TTS providers failed to generate audio');
          isSpeaking = false;
          console.log('[TTS] Lock released (no audio), isSpeaking = false');
        }
      } catch (error) {
        console.error('[TTS] Error:', error);
        isSpeaking = false;
        console.log('[TTS] Lock released (exception), isSpeaking = false');
      }
      // Note: isSpeaking will be released by the onended event handler
    },

    async _tryOpenAI(text, characterName, characterGender, moodAdjustments = { speedMult: 1.0, pitchAdj: 0 }) {
      try {
        // Apply mood-based speed adjustment on top of user preference
        const finalSpeed = (userSettings.voiceSpeed || 1.0) * moodAdjustments.speedMult;

        const response = await fetch('/api/openai-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            characterName: characterName || 'Unknown',
            characterGender: characterGender || 'unknown',
            speedMultiplier: finalSpeed,
            preferredVoice: 'auto'
          })
        });

        if (!response.ok) {
          console.warn('[TTS] OpenAI API error:', response.status);
          return null;
        }

        return await response.json();
      } catch (error) {
        console.warn('[TTS] OpenAI error:', error);
        return null;
      }
    },

    async _tryGoogle(text, characterName, characterGender, moodAdjustments = { speedMult: 1.0, pitchAdj: 0 }) {
      try {
        // Apply mood-based adjustments on top of user preferences
        const finalSpeed = (userSettings.voiceSpeed || 1.0) * moodAdjustments.speedMult;
        const finalPitch = (userSettings.voicePitch || 0) + moodAdjustments.pitchAdj;

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            characterName: characterName || 'Unknown',
            characterGender: characterGender || 'unknown',
            speedMultiplier: finalSpeed,
            pitchAdjustment: finalPitch
          })
        });

        if (!response.ok) {
          console.warn('[TTS] Google API error:', response.status);
          return null;
        }

        const data = await response.json();
        return { ...data, provider: 'google' };
      } catch (error) {
        console.warn('[TTS] Google error:', error);
        return null;
      }
    },

    async _tryCartesia(text, characterName, characterGender, moodAdjustments = { speedMult: 1.0, pitchAdj: 0, cartesiaEmotion: [] }) {
      try {
        // Apply mood-based speed adjustment on top of user preference
        const finalSpeed = (userSettings.voiceSpeed || 1.0) * moodAdjustments.speedMult;

        console.log('[TTS] Calling Cartesia API with emotions:', moodAdjustments.cartesiaEmotion || []);
        const response = await fetch('/api/cartesia-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            characterName: characterName || 'Unknown',
            characterGender: characterGender || 'unknown',
            speedMultiplier: finalSpeed,
            preferredVoice: 'auto',
            emotions: moodAdjustments.cartesiaEmotion || []
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('[TTS] Cartesia API error:', response.status, errorData);
          return null;
        }

        const data = await response.json();
        console.log('[TTS] Cartesia response received:', data.provider, `(${data.audioContent ? data.audioContent.length : 0} bytes)`);
        return data;
      } catch (error) {
        console.warn('[TTS] Cartesia error:', error);
        return null;
      }
    },

    stop() {
      console.log('[TTS] stop() called');
      if (persistentAudioElement) {
        persistentAudioElement.pause();
        persistentAudioElement.currentTime = 0;
        persistentAudioElement.src = ''; // Clear source completely
        persistentAudioElement.load(); // Abort any ongoing loading
      }

      // Clean up blob URL
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
      }

      currentAudio = null;
      console.log('[TTS] Audio stopped, cleared, and loading aborted');
    },

    repeat() {
      if (!lastTTSBlob) {
        console.log('[TTS] No audio to repeat');
        return;
      }

      console.log('[TTS] Repeating last TTS audio');

      // Stop current audio if playing
      this.stop();

      // Initialize audio if needed
      initPersistentAudio();

      // Clean up old blob URL
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
      }

      // Create new blob URL from stored blob
      currentBlobUrl = URL.createObjectURL(lastTTSBlob);
      persistentAudioElement.src = currentBlobUrl;
      persistentAudioElement.volume = 1;
      persistentAudioElement.load();
      currentAudio = persistentAudioElement;

      // Play the audio
      persistentAudioElement.play().then(() => {
        console.log('[TTS] ✓ Repeat playback started');
      }).catch(err => {
        console.error('[TTS] Repeat playback error:', err);
      });
    }
  };

  // Placement Test Manager
  const PlacementTestManager = {
    // Initialize the placement test with adaptive questions
    init() {
      if (typeof PLACEMENT_QUESTIONS === 'undefined') {
        console.error('[PlacementTest] PLACEMENT_QUESTIONS not loaded!');
        debugLog('❌ PLACEMENT_QUESTIONS not loaded');
        return false;
      }

      // Reset state
      placementQuestions = [];
      currentQuestionIndex = 0;
      selectedAnswer = null;
      placementAnswers = [];
      placementScore = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };

      // Start with A1 questions (3 questions per level)
      this.selectQuestionsForLevel('A1', 3);

      // Update UI
      if (dom.totalQuestions) dom.totalQuestions.textContent = '15';
      if (dom.currentQuestionNum) dom.currentQuestionNum.textContent = '1';

      // Display first question
      this.displayQuestion();

      debugLog('✅ Placement test initialized');
      return true;
    },

    // Select random questions from a specific level
    selectQuestionsForLevel(level, count) {
      const levelQuestions = PLACEMENT_QUESTIONS[level] || [];
      const shuffled = [...levelQuestions].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, count);

      selected.forEach(q => {
        placementQuestions.push({ ...q, level });
      });
    },

    // Display current question
    displayQuestion() {
      const question = placementQuestions[currentQuestionIndex];
      if (!question) {
        console.error('[PlacementTest] No question at index', currentQuestionIndex);
        return;
      }

      // Update question text
      if (dom.questionText) {
        dom.questionText.textContent = question.q;
      }

      // Update progress
      if (dom.currentQuestionNum) {
        dom.currentQuestionNum.textContent = currentQuestionIndex + 1;
      }
      if (dom.placementProgressBar) {
        const progress = ((currentQuestionIndex + 1) / placementQuestions.length) * 100;
        dom.placementProgressBar.style.width = `${progress}%`;
      }

      // Clear selected answer
      selectedAnswer = null;

      // Render options
      if (dom.quizOptions) {
        dom.quizOptions.innerHTML = '';
        question.opts.forEach((option, index) => {
          const optionBtn = document.createElement('button');
          optionBtn.className = 'w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all';
          optionBtn.textContent = option;
          optionBtn.addEventListener('click', () => this.selectOption(index, optionBtn));
          dom.quizOptions.appendChild(optionBtn);
        });

        // Add "I don't know" option
        const dontKnowBtn = document.createElement('button');
        dontKnowBtn.className = 'w-full text-left p-3 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-600 italic';
        dontKnowBtn.textContent = "No sé (I don't know)";
        dontKnowBtn.addEventListener('click', () => this.selectOption(-1, dontKnowBtn));
        dom.quizOptions.appendChild(dontKnowBtn);
      }

      // Disable submit button until an option is selected
      if (dom.submitQuizBtn) {
        dom.submitQuizBtn.disabled = true;
      }

      // Update estimated level display
      this.updateEstimatedLevel();
    },

    // Handle option selection
    selectOption(index, buttonElement) {
      selectedAnswer = index;

      // Remove selection from all options
      const allOptions = dom.quizOptions.querySelectorAll('button');
      allOptions.forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-100');
        btn.classList.add('border-gray-200');
      });

      // Highlight selected option
      buttonElement.classList.remove('border-gray-200');
      buttonElement.classList.add('border-blue-500', 'bg-blue-100');

      // Enable submit button
      if (dom.submitQuizBtn) {
        dom.submitQuizBtn.disabled = false;
      }
    },

    // Submit answer and move to next question
    submitAnswer() {
      if (selectedAnswer === null) return;

      const question = placementQuestions[currentQuestionIndex];
      // selectedAnswer is -1 for "don't know", which will always be incorrect
      const isCorrect = selectedAnswer === question.ans;
      const isDontKnow = selectedAnswer === -1;

      // Record answer
      placementAnswers.push({
        question: question.q,
        selectedAnswer,
        correctAnswer: question.ans,
        isCorrect,
        isDontKnow,
        level: question.level
      });

      // Update score
      if (isCorrect) {
        placementScore[question.level]++;
      }

      // Move to next question
      currentQuestionIndex++;

      // Adaptive logic: Add questions based on performance
      if (currentQuestionIndex === 3 && isCorrect) {
        // If doing well on A1, add A2 questions
        this.selectQuestionsForLevel('A2', 3);
      } else if (currentQuestionIndex === 6 && placementScore.A2 >= 2) {
        // If doing well on A2, add B1 questions
        this.selectQuestionsForLevel('B1', 3);
      } else if (currentQuestionIndex === 9 && placementScore.B1 >= 2) {
        // If doing well on B1, add B2 questions
        this.selectQuestionsForLevel('B2', 3);
      } else if (currentQuestionIndex === 12 && placementScore.B2 >= 2) {
        // If doing well on B2, add C1 questions
        this.selectQuestionsForLevel('C1', 3);
      }

      // Check if test is complete
      if (currentQuestionIndex >= placementQuestions.length || currentQuestionIndex >= 15) {
        this.completeTest();
      } else {
        this.displayQuestion();
      }
    },

    // Update estimated level display
    updateEstimatedLevel() {
      if (!dom.estimatedLevel) return;

      const level = this.calculateCurrentLevel();
      dom.estimatedLevel.textContent = level ? `Estimated: ${level}` : '';
    },

    // Calculate current estimated level
    calculateCurrentLevel() {
      const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      let estimatedLevel = 'A1';

      for (const level of levels) {
        const levelAnswers = placementAnswers.filter(a => a.level === level);
        const correctCount = levelAnswers.filter(a => a.isCorrect).length;
        const accuracy = levelAnswers.length > 0 ? correctCount / levelAnswers.length : 0;

        if (accuracy >= 0.6) {
          estimatedLevel = level;
        } else {
          break; // Stop if accuracy drops below 60%
        }
      }

      return estimatedLevel;
    },

    // Complete the placement test
    async completeTest() {
      const finalLevel = this.calculateCurrentLevel();
      debugLog(`✅ Placement test complete. Level: ${finalLevel}`);

      // Save to Firebase (skip in dev mode)
      if (!isDevMode && currentUser && currentUser.uid) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await setDoc(userDocRef, {
            placementLevel: finalLevel,
            placementCompleted: true,
            placementDate: serverTimestamp(),
            placementAnswers: placementAnswers.length,
            placementScore: placementScore
          }, { merge: true });

          console.log('[PlacementTest] Results saved to Firebase');
        } catch (error) {
          console.error('[PlacementTest] Error saving results:', error);
        }
      } else if (isDevMode) {
        console.log('[DEV MODE] Skipping Firebase save for placement test');
      }

      // Show results
      alert(`Placement Test Complete!\n\nYour Spanish level: ${finalLevel}\n\nLet's start your language adventure!`);

      // Hide placement view and start onboarding quest
      if (dom.placementView) dom.placementView.style.display = 'none';
      if (dom.mainAppView) dom.mainAppView.style.display = 'flex';

      // Always start with the onboarding quest after placement
      debugLog('[PlacementTest] Starting onboarding quest');
      startQuest('quest-zero-onboarding');
    }
  };

  // Load quests from QUEST_DATABASE
  function getQuests() {
    if (typeof QUEST_DATABASE !== 'undefined' && QUEST_DATABASE.quests) {
      debugLog(`✅ QUEST_DATABASE loaded with ${Object.keys(QUEST_DATABASE.quests).length} quests`);
      return QUEST_DATABASE.quests;
    }
    // Fallback to inline quest if QUEST_DATABASE not loaded
    debugLog('⚠️ QUEST_DATABASE not found, using fallback quest');
    return {
      "missing-guitar": {
        id: "missing-guitar",
        title: "The Missing Guitar",
        objective: "A famous musician's guitar is missing. Find it before his show!",
        mapImage: "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?q=80&w=1887&auto=format&fit=crop",
        stages: {
          "1": {
            characterName: "Mateo, the Concierge",
            vignette: { en: "You're in a hotel lobby. Your goal: Find out who the musician is and where he was last seen." },
            systemPrompt: "You are Mateo, a professional but worried hotel concierge in Bogotá.",
            objectives: [],
            completionCriteria: { minMessages: 3, objectivesRequired: 0 },
            reward: { clue: "Musician 'Carlos' was last seen at the plaza.", xp: 50 },
            nextStages: [{ id: "2a", condition: "default" }],
            initialMessage: "Good morning. How can I help you today?"
          }
        }
      }
    };
  }

  const quests = getQuests();
  debugLog(`📚 Quests object has ${Object.keys(quests).length} quests`);

  // Utility functions
  // Show auth views (login, signup, email verification)
  function showAuthView(viewId) {
    debugLog(`🔄 showAuthView called with: ${viewId}`);

    // Hide all auth views
    if (dom.loginView) dom.loginView.style.display = 'none';
    if (dom.signupView) dom.signupView.style.display = 'none';
    const emailVerificationView = document.getElementById('email-verification-view');
    if (emailVerificationView) emailVerificationView.style.display = 'none';

    // Show the requested view
    const viewElement = document.getElementById(viewId);
    if (viewElement) {
      viewElement.style.display = 'block';
      debugLog(`✅ Showing auth view: ${viewId}`);
    }
  }

  function showView(viewId) {
    debugLog(`🔄 showView called with: ${viewId}`);

    // If it's an auth view, use showAuthView instead
    if (viewId === 'login-view' || viewId === 'signup-view' || viewId === 'email-verification-view') {
      showAuthView(viewId);
      return;
    }

    document.querySelectorAll('.main-view').forEach(view => {
      if (view.id === viewId) {
        view.style.display = 'flex';
        view.classList.add('active');
        debugLog(`✅ Showing view: ${viewId}`);
      } else {
        view.style.display = 'none';
        view.classList.remove('active');
      }
    });

    // Initialize placement test when showing placement view
    if (viewId === 'placement-view') {
      setTimeout(() => {
        PlacementTestManager.init();
      }, 100);
    }
  }

  // Authentication functions
  debugLog('📝 Setting up authentication functions...');
  async function handleLogin() {
    console.log('🔐 handleLogin called');
    const email = dom.loginEmailInput?.value?.trim() || '';
    const password = dom.loginPasswordInput?.value || '';

    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);

    if (!email || !password) {
      console.warn('⚠️ Missing email or password');
      alert('Please fill in all fields');
      return;
    }

    try {
      console.log('🔄 Attempting to sign in...');
      if (dom.loginBtn) {
        dom.loginBtn.disabled = true;
        dom.loginBtn.textContent = 'Signing In...';
      }

      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Sign in successful - onAuthStateChanged will handle UI update');
      // onAuthStateChanged will handle the UI update
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      alert('Login failed: ' + error.message);
    } finally {
      if (dom.loginBtn) {
        dom.loginBtn.disabled = false;
        dom.loginBtn.textContent = 'Login';
      }
    }
  }

  async function handleSignup() {
    const email = dom.signupEmailInput.value.trim();
    const password = dom.signupPasswordInput.value;
    const displayName = dom.signupDisplayNameInput.value.trim();

    if (!email || !password || !displayName) {
      alert('Please fill in all fields');
      return;
    }

    try {
      dom.signupBtn.disabled = true;
      dom.signupBtn.textContent = 'Creating Account...';
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName,
        email,
        createdAt: serverTimestamp(),
        settings: {
          dialect: 'Mexico',
          formality: 'Casual',
          voiceSpeed: 1.0,
          voicePitch: 0
        },
        placementCompleted: false,
        onboardingQuestCompleted: false,
        completedQuests: []
      });
      
      // onAuthStateChanged will handle the UI update
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed: ' + error.message);
    } finally {
      dom.signupBtn.disabled = false;
      dom.signupBtn.textContent = 'Sign Up';
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      // onAuthStateChanged will handle the UI update
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed: ' + error.message);
    }
  }

  // Load user data from Firestore
  async function loadUserData(user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userSettings = {
          ...userSettings, // Keep defaults
          ...userData.settings,
          completedQuests: userData.completedQuests || []
        };

        // Update UI with user settings
        dom.dialectSelect.value = userSettings.dialect;
        dom.formalitySelect.value = userSettings.formality;

        // Update voice sliders
        const voiceSpeed = userSettings.voiceSpeed || 1.0;
        const voicePitch = userSettings.voicePitch || 0;
        dom.voiceSpeedSlider.value = voiceSpeed;
        dom.voiceSpeedValue.textContent = `${voiceSpeed.toFixed(1)}x`;
        dom.voicePitchSlider.value = voicePitch;
        const pitchLabels = ['Much Lower', 'Lower', 'Slightly Lower', 'Normal', 'Slightly Higher', 'Higher', 'Much Higher'];
        dom.voicePitchValue.textContent = pitchLabels[voicePitch + 3] || 'Normal';

        return userData;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
    return null;
  }

  // Render quest list
  function renderQuests() {
    dom.questList.innerHTML = '';
    const completedQuests = userSettings.completedQuests || [];

    // Organize quests into categories
    const availableQuests = [];
    const lockedQuests = [];
    const completedQuestsArray = [];

    Object.entries(quests).forEach(([questKey, quest]) => {
      const prerequisites = quest.prerequisites || [];
      const isLocked = !prerequisites.every(prereq => completedQuests.includes(prereq));
      const isCompleted = completedQuests.includes(questKey);

      const questData = { questKey, quest, isLocked, isCompleted, prerequisites };

      if (isCompleted) {
        completedQuestsArray.push(questData);
      } else if (isLocked) {
        lockedQuests.push(questData);
      } else {
        availableQuests.push(questData);
      }
    });

    // Helper function to create quest card
    const createQuestCard = ({ questKey, quest, isLocked, isCompleted, prerequisites }) => {
      // Get difficulty badge styling
      const difficultyColors = {
        'beginner': 'bg-green-100 text-green-700 border-green-300',
        'intermediate': 'bg-yellow-100 text-yellow-700 border-yellow-300',
        'advanced': 'bg-red-100 text-red-700 border-red-300'
      };
      const difficultyColor = difficultyColors[quest.difficulty] || difficultyColors['beginner'];

      const questEl = document.createElement('div');
      questEl.className = `quest-card group relative overflow-hidden rounded-xl transition-all duration-300 ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:shadow-2xl'
      }`;

      questEl.innerHTML = `
        <!-- Card Background with Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-teal-500/10"></div>

        <!-- Thumbnail Image -->
        ${quest.thumbnailImage ? `
          <div class="relative h-32 overflow-hidden">
            <img src="${quest.thumbnailImage}" alt="${quest.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            ${isCompleted ? '<div class="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"><span>✓</span> Completed</div>' : ''}
            ${isLocked ? '<div class="absolute inset-0 bg-black/50 flex items-center justify-center"><span class="text-5xl">🔒</span></div>' : ''}
          </div>
        ` : ''}

        <!-- Card Content -->
        <div class="relative bg-white p-4">
          <!-- Title and Badges -->
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-bold ${isLocked ? 'text-gray-400' : 'text-gray-800 group-hover:text-purple-600'} transition-colors">
              ${quest.title}
            </h3>
          </div>

          <!-- Tags/Badges Row -->
          <div class="flex flex-wrap gap-2 mb-2">
            <span class="text-xs px-2 py-1 rounded-full border ${difficultyColor} font-semibold">
              ${quest.difficulty || 'beginner'}
            </span>
            ${quest.estimatedDuration ? `
              <span class="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                ⏱️ ${quest.estimatedDuration} min
              </span>
            ` : ''}
            ${quest.requiredLevel ? `
              <span class="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                📚 ${quest.requiredLevel}
              </span>
            ` : ''}
          </div>

          <!-- Description -->
          <p class="text-gray-600 text-sm mb-3 line-clamp-2">${quest.objective}</p>

          <!-- Lock Message -->
          ${isLocked ? `
            <div class="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-xs text-red-600 font-medium">🔒 Requires: ${prerequisites.join(', ')}</p>
            </div>
          ` : ''}

          <!-- CTA Button (only for unlocked quests) -->
          ${!isLocked && !isCompleted ? `
            <button class="mt-3 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-blue-600 transition-all transform group-hover:scale-105 shadow-md">
              Start Quest →
            </button>
          ` : ''}
          ${!isLocked && isCompleted ? `
            <button class="mt-3 w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 rounded-lg font-semibold text-sm hover:from-green-600 hover:to-teal-600 transition-all">
              ↺ Replay Quest
            </button>
          ` : ''}
        </div>
      `;

      if (!isLocked) {
        questEl.addEventListener('click', () => {
          console.log(`🎯 Quest card clicked: ${questKey}`);
          startQuest(questKey);
        });
      } else {
        console.log(`🔒 Quest is locked: ${questKey}`);
      }

      return questEl;
    };

    // Render Available Quests
    if (availableQuests.length > 0) {
      const availableHeader = document.createElement('h2');
      availableHeader.className = 'text-lg font-bold text-gray-800 mb-3 mt-2';
      availableHeader.textContent = '✨ Available Quests';
      dom.questList.appendChild(availableHeader);

      availableQuests.forEach(questData => {
        dom.questList.appendChild(createQuestCard(questData));
      });
    }

    // Render Locked Quests
    if (lockedQuests.length > 0) {
      const lockedHeader = document.createElement('h2');
      lockedHeader.className = 'text-lg font-bold text-gray-500 mb-3 mt-6';
      lockedHeader.textContent = '🔒 Locked Quests';
      dom.questList.appendChild(lockedHeader);

      lockedQuests.forEach(questData => {
        dom.questList.appendChild(createQuestCard(questData));
      });
    }

    // Render Completed Quests
    if (completedQuestsArray.length > 0) {
      const completedHeader = document.createElement('h2');
      completedHeader.className = 'text-lg font-bold text-green-600 mb-3 mt-6';
      completedHeader.textContent = '✓ Completed Quests';
      dom.questList.appendChild(completedHeader);

      completedQuestsArray.forEach(questData => {
        dom.questList.appendChild(createQuestCard(questData));
      });
    }
  }

  // Start a quest
  function startQuest(questKey) {
    console.log(`📍 startQuest called with: ${questKey}`);
    debugLog(`📍 startQuest called with: ${questKey}`);
    currentQuest = questKey;
    currentStage = "1";
    messages = [];

    // Reset objective tracking
    stageMessageCount = 0;
    completedObjectives.clear();
    shownHints.clear();
    stageCompleted = false;
    farewellSent = false;
    stageStartTime = Date.now(); // Track when stage started
    lastObjectiveAttemptCount = {}; // Reset attempt tracking

    console.log(`🔍 Looking for quest in quests object...`);
    console.log(`📚 Available quests:`, Object.keys(quests));
    const quest = quests[currentQuest];
    if (!quest) {
      console.error(`❌ Quest not found: ${questKey}`);
      console.error(`Available quests are:`, Object.keys(quests));
      debugLog(`❌ Quest not found: ${questKey}`);
      alert(`Quest "${questKey}" not found. Available quests: ${Object.keys(quests).join(', ')}`);
      return;
    }
    console.log(`✅ Quest found:`, quest.title);

    const stage = quest.stages[currentStage];
    if (!stage) {
      console.error(`Stage not found: ${currentStage} for quest ${questKey}`);
      debugLog(`❌ Stage not found: ${currentStage}`);
      return;
    }

    debugLog(`✅ Starting quest: ${quest.title}, Stage: ${currentStage}`);

    // Set all quest information (with null checks)
    if (dom.chatTitle) dom.chatTitle.textContent = quest.title;
    if (dom.questTitle) dom.questTitle.textContent = quest.title;
    if (dom.questObjective) dom.questObjective.textContent = quest.objective;
    if (dom.questMapImage) dom.questMapImage.src = quest.mapImage || quest.thumbnailImage || '';
    if (dom.characterName) dom.characterName.textContent = stage.characterName;

    // Populate minimized quest card
    const characterEmojiMini = document.getElementById('character-emoji-mini');
    const characterNameMini = document.getElementById('character-name-mini');
    const questObjectiveMini = document.getElementById('quest-objective-mini');
    const characterAvatarExpanded = document.getElementById('character-avatar-expanded');

    if (characterEmojiMini) characterEmojiMini.textContent = stage.characterAvatar || '🎭';
    if (characterNameMini) characterNameMini.textContent = stage.characterName || 'Character';
    if (questObjectiveMini) questObjectiveMini.textContent = quest.objective || '';
    if (characterAvatarExpanded) characterAvatarExpanded.textContent = stage.characterAvatar || '🎭';

    // Handle vignette (support both old and new format)
    const vignetteText = stage.vignette?.en || stage.vignette_en || '';
    if (dom.vignette) dom.vignette.textContent = vignetteText;

    if (dom.chatContainer) {
      dom.chatContainer.innerHTML = '';
      if (stage.initialMessage) {
        addMessage('npc', stage.initialMessage);
      }
    }

    // Re-enable chat input for new quest
    if (dom.chatInput) {
      dom.chatInput.disabled = false;
      dom.chatInput.placeholder = "Type your reply...";
    }
    if (dom.sendBtn) {
      dom.sendBtn.disabled = false;
    }

    // Update objectives UI
    updateObjectivesUI();

    // Track quest start in dev mode
    if (typeof window.devTrackQuestStart === 'function') {
      window.devTrackQuestStart(questKey, currentStage);
    }

    // Show character introduction card first
    showCharacterIntroCard(quest, stage);

    // Show chat view
    if (dom.questView) dom.questView.style.display = 'none';
    if (dom.chatView) dom.chatView.style.display = 'flex';

    // Show XP progress bar fully at start, then minimize after 5 seconds
    const xpBar = document.getElementById('xp-progress-bar');
    if (xpBar) {
      xpBar.classList.remove('minimized');
      xpBar.style.display = 'block';

      // After 5 seconds, minimize the XP bar
      setTimeout(() => {
        xpBar.classList.add('minimized');
      }, 5000);
    }

    debugLog(`✅ Quest started successfully: ${quest.title}`);
  }

  // Dark Mode functions
  function initDarkMode() {
    // Check if dark mode is saved in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      updateDarkModeIcon(true);
    }
  }

  function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeIcon(isDarkMode);
  }

  function updateDarkModeIcon(isDarkMode) {
    // Update main app icon
    const icon = document.querySelector('.dark-mode-icon');
    if (icon) {
      icon.textContent = isDarkMode ? '☀️' : '🌙';
    }
    // Update auth screen icon
    const authIcon = document.querySelector('.auth-dark-mode-icon');
    if (authIcon) {
      authIcon.textContent = isDarkMode ? '☀️' : '🌙';
    }
  }

  // Character Introduction Card functions
  function showCharacterIntroCard(quest, stage) {
    if (!dom.characterIntroOverlay) return;

    // Set character avatar
    dom.characterIntroAvatar.textContent = stage.characterAvatar || '🎭';

    // Set character name
    dom.characterIntroName.textContent = stage.characterName || 'Character';

    // Set quest name
    dom.characterIntroQuest.textContent = quest.title || 'Quest';

    // Set character description from vignette
    const description = stage.vignette?.en || stage.vignette || 'Meet this character and begin your conversation!';
    dom.characterIntroDescription.textContent = description;

    // Show the overlay
    dom.characterIntroOverlay.classList.remove('hidden');
  }

  function hideCharacterIntroCard() {
    if (dom.characterIntroOverlay) {
      dom.characterIntroOverlay.classList.add('hidden');
    }
  }

  // Typing indicator functions
  let typingIndicatorElement = null;

  function showTypingIndicator() {
    if (!dom.chatContainer || typingIndicatorElement) return;

    // Get character info for avatar
    let avatar = '🎭';
    let characterName = 'NPC';
    if (currentQuest && currentStage) {
      const quest = quests[currentQuest];
      const stage = quest?.stages?.[currentStage];
      avatar = stage?.characterAvatar || '🎭';
      characterName = stage?.characterName || 'NPC';
    }

    // Create typing indicator wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'typing-indicator active flex items-center gap-2';
    wrapper.id = 'typing-indicator-wrapper';

    // Add character avatar
    const avatarEl = document.createElement('div');
    avatarEl.className = 'flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-lg shadow-md';
    avatarEl.textContent = avatar;
    avatarEl.title = characterName;
    wrapper.appendChild(avatarEl);

    // Add typing indicator bubble
    const bubble = document.createElement('div');
    bubble.className = 'flex items-center gap-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl px-4 py-3 shadow-sm';

    // Add three animated dots
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'typing-dot';
      bubble.appendChild(dot);
    }

    wrapper.appendChild(bubble);

    typingIndicatorElement = wrapper;
    dom.chatContainer.appendChild(wrapper);
    dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    if (typingIndicatorElement && dom.chatContainer) {
      dom.chatContainer.removeChild(typingIndicatorElement);
      typingIndicatorElement = null;
    }
  }

  // Format corrections with strikethrough
  function formatCorrections(text) {
    // Helper to escape HTML in specific parts
    const escapeHtml = (str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    // Helper to create correction HTML safely
    const makeStrikethrough = (text) => {
      return `<span style="text-decoration: line-through; opacity: 0.6;">${escapeHtml(text)}</span>`;
    };

    const makeCorrect = (text) => {
      return `<strong style="color: #10b981;">${escapeHtml(text)}</strong>`;
    };

    const makeHighlight = (text) => {
      return `<strong style="color: #10b981; background: #d1fae5; padding: 2px 6px; border-radius: 4px;">${escapeHtml(text)}</strong>`;
    };

    let formatted = text;

    // Pattern 1: "not X, Y" -> strikethrough X, highlight Y
    formatted = formatted.replace(/\bnot\s+([^,]+),\s*([^.!?]+)/gi, (match, incorrect, correct) => {
      return `not ${makeStrikethrough(incorrect.trim())}, ${makeCorrect(correct.trim())}`;
    });

    // Pattern 2: "not X but Y" -> strikethrough X, highlight Y
    formatted = formatted.replace(/\bnot\s+([^,]+)\s+but\s+([^.!?]+)/gi, (match, incorrect, correct) => {
      return `not ${makeStrikethrough(incorrect.trim())} but ${makeCorrect(correct.trim())}`;
    });

    // Pattern 3: "it's X, not Y" -> highlight X, strikethrough Y
    formatted = formatted.replace(/it'?s\s+([^,]+),\s*not\s+([^.!?-]+)/gi, (match, correct, incorrect) => {
      return `it's ${makeCorrect(correct.trim())}, not ${makeStrikethrough(incorrect.trim())}`;
    });

    // Pattern 4: "*word" (asterisk correction pattern)
    formatted = formatted.replace(/\*(\w+)/g, (match, word) => {
      return makeCorrect(`*${word}`);
    });

    // Pattern 5: "You meant X" or "Did you mean X"
    formatted = formatted.replace(/(you meant|did you mean)\s+([^.!?,]+)/gi, (match, phrase, correction) => {
      return `${escapeHtml(phrase)} ${makeCorrect(correction.trim())}`;
    });

    // Pattern 6: "Actually, it's X"
    formatted = formatted.replace(/actually,?\s+it'?s\s+([^.!?,]+)/gi, (match, correction) => {
      return `actually, it's ${makeCorrect(correction.trim())}`;
    });

    // Pattern 7: "(correct: X)" or "(correction: X)"
    formatted = formatted.replace(/\((correct|correction):\s*([^)]+)\)/gi, (_match, _label, correction) => {
      return makeHighlight(correction.trim());
    });

    // Escape any remaining unformatted HTML
    // First, protect our formatted HTML by replacing it with placeholders
    const protectedSections = [];
    formatted = formatted.replace(/(<[^>]+>)/g, (match) => {
      const index = protectedSections.length;
      protectedSections.push(match);
      return `__PROTECTED_${index}__`;
    });

    // Now escape any remaining HTML
    formatted = escapeHtml(formatted);

    // Restore protected sections
    protectedSections.forEach((section, index) => {
      formatted = formatted.replace(`__PROTECTED_${index}__`, section);
    });

    return formatted;
  }

  // Add message to chat
  function addMessage(sender, text) {
    if (!dom.chatContainer) {
      debugLog('⚠️ chatContainer not found, cannot add message');
      return;
    }

    // Store message in conversation history (skip system messages)
    if (sender === 'user' || sender === 'npc') {
      messages.push({
        role: sender === 'user' ? 'user' : 'model',
        text: text
      });
    }

    // Get character avatar if available
    let avatar = '';
    let characterName = '';
    if (sender === 'npc' && currentQuest && currentStage) {
      const quest = quests[currentQuest];
      const stage = quest?.stages?.[currentStage];
      avatar = stage?.characterAvatar || '🎭';
      characterName = stage?.characterName || 'NPC';
    }

    // Create message wrapper with flex layout
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `flex items-end gap-2 mb-3 ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

    // Add avatar for NPC messages
    if (sender === 'npc' && avatar) {
      const avatarEl = document.createElement('div');
      avatarEl.className = 'flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-lg shadow-md';
      avatarEl.textContent = avatar;
      avatarEl.title = characterName;
      messageWrapper.appendChild(avatarEl);
    }

    // Create message bubble
    const messageEl = document.createElement('div');
    let senderClass = 'npc-message';
    if (sender === 'user') {
      senderClass = 'user-message';
    } else if (sender === 'system') {
      senderClass = 'system-message';
    }

    messageEl.className = `message ${senderClass}`;

    // Apply correction formatting for NPC messages
    if (sender === 'npc') {
      messageEl.innerHTML = formatCorrections(text);
    } else {
      messageEl.textContent = text;
    }

    messageWrapper.appendChild(messageEl);

    // Add user avatar
    if (sender === 'user') {
      const userAvatarEl = document.createElement('div');
      userAvatarEl.className = 'flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md';
      userAvatarEl.textContent = '👤';
      messageWrapper.appendChild(userAvatarEl);
    }

    dom.chatContainer.appendChild(messageWrapper);
    dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;

    // Auto-play TTS for NPC messages if enabled
    if (sender === 'npc' && autoplayEnabled) {
      const quest = quests[currentQuest];
      const stage = quest?.stages?.[currentStage];
      const characterGender = stage?.characterGender || 'unknown';

      TTSManager.speak(text, characterName, characterGender);
    }
  }

  // Send chat message
  async function sendChatMessage() {
    const message = dom.chatInput.value.trim();
    if (!message) return;

    // Unlock audio on user message send (for autoplay policy)
    unlockAudio();

    // Prevent sending messages after quest completion
    if (stageCompleted && farewellSent) {
      console.log('Quest already completed, blocking message');
      return;
    }

    // Check for inappropriate content before processing
    const moderationResult = ContentModerator.checkContent(message);
    if (!moderationResult.isAppropriate) {
      // Show warning message and don't process the message
      const warningMessage = ContentModerator.getWarningMessage(moderationResult.reason);
      addMessage('system', warningMessage);
      dom.chatInput.value = '';
      return;
    }

    addMessage('user', message);
    dom.chatInput.value = '';
    dom.sendBtn.disabled = true;
    dom.sendBtn.textContent = 'Sending...';

    // Increment message count
    stageMessageCount++;

    // Check objectives against user message
    checkObjectives(message);

    // Check if stage is complete right after objectives check
    checkStageCompletion();
    console.log(`[Completion Check] After user message: stageCompleted=${stageCompleted}, messages=${stageMessageCount}, objectives=${completedObjectives.size}`);

    // Show typing indicator while waiting for AI response
    showTypingIndicator();

    try {
      const quest = quests[currentQuest];
      const stage = quest.stages[currentStage];

      // Build conversation history for context
      // Convert messages array to Gemini API format
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      // Add information about completed objectives to help AI progress conversation
      const completedObjectivesList = Array.from(completedObjectives).join(', ');
      let objectivesContext = completedObjectivesList
        ? `\n\nOBJECTIVES COMPLETED: ${completedObjectivesList}. Move the conversation forward based on what has been accomplished.`
        : '';

      // If stage is complete and farewell hasn't been sent, ask AI to send farewell
      if (stageCompleted && !farewellSent) {
        objectivesContext += `\n\n🎉 QUEST COMPLETE - TIME TO CELEBRATE AND WRAP UP! 🎉
ALL OBJECTIVES ACHIEVED! The user has successfully completed this quest.

YOUR NEXT RESPONSE SHOULD:
1. Warmly congratulate them on completing the mission (1 sentence with Spanish)
2. Include "¡Bienvenido a ConvoQuest! (Welcome to ConvoQuest!)"
3. Ask how they feel about completing their primera misión (first mission)
4. END with a friendly question to invite their response

✅ PERFECT Example:
"¡Increíble trabajo! (Amazing work!) You successfully completed your primera misión (first mission)! ¡Bienvenido a ConvoQuest! (Welcome to ConvoQuest!) How do you feel about helping abuela? ¿Feliz? (Happy?)"

After they respond to your question (especially if they say goodbye/thanks/adiós), you can bid them farewell warmly.

REMEMBER: Always end responses with a question mark (?) to keep conversation flowing naturally.`;
      }

      const response = await AIManager.callAPI(
        stage.systemPrompt + objectivesContext,
        conversationHistory
      );

      // If callAPI returned null (due to an error), stop processing
      if (response === null) {
        hideTypingIndicator();
        return;
      }

      // Hide typing indicator before showing actual response
      hideTypingIndicator();

      addMessage('npc', response);

      // If this was the farewell message, mark it as sent and show completion
      console.log(`[Farewell Check] After AI response: stageCompleted=${stageCompleted}, farewellSent=${farewellSent}, messages=${stageMessageCount}, objectives=${completedObjectives.size}`);

      if (stageCompleted && !farewellSent) {
        console.log('🎊 [Farewell] QUEST COMPLETE - Disabling chat and scheduling completion notification');
        console.log(`[Farewell] Criteria met - Messages: ${stageMessageCount}, Objectives: ${completedObjectives.size}/${stage.objectives?.length || 0}`);
        farewellSent = true;

        // Disable chat input to prevent further messages
        dom.chatInput.disabled = true;
        dom.chatInput.placeholder = "Quest completing...";
        dom.sendBtn.disabled = true;

        // Show completion notification after a delay to let user read farewell
        console.log('[Farewell] Scheduling completion notification in 4.5 seconds');
        setTimeout(() => {
          console.log('[Farewell] Timeout fired, calling showStageCompletionNotification()');
          showStageCompletionNotification();
        }, 4500);
      } else {
        console.log(`[Farewell Check] NOT showing completion - stageCompleted=${stageCompleted}, farewellSent=${farewellSent}`);
        if (!stageCompleted) {
          const criteria = stage.completionCriteria || {};
          console.log(`[Farewell Check] Still need - Messages: ${stageMessageCount}/${criteria.minMessages || 0}, Objectives: ${completedObjectives.size}/${criteria.objectivesRequired || 0}`);
        }
      }

      // Update UI after response
      updateObjectivesUI();

      // Check if stage is complete (this will set stageCompleted flag)
      checkStageCompletion();

      // Show hints if needed (only if stage not complete)
      if (!stageCompleted) {
        checkAndShowHints();
      }

    } catch (error) {
      console.error('Error sending message:', error);
      hideTypingIndicator();
      addMessage('npc', 'Sorry, I couldn\'t understand that. Could you try again?');
    } finally {
      // Only re-enable if quest isn't complete
      if (!farewellSent) {
        dom.sendBtn.disabled = false;
        dom.sendBtn.textContent = 'Send';
      }
    }
  }

  // Check if user message matches objective keywords
  function checkObjectives(userMessage) {
    const quest = quests[currentQuest];
    const stage = quest.stages[currentStage];

    if (!stage.objectives) return;

    const messageLower = userMessage.toLowerCase();

    stage.objectives.forEach(objective => {
      // Skip if already completed
      if (completedObjectives.has(objective.id)) return;

      // Check if any keyword matches
      const hasMatch = objective.keywords?.some(keyword =>
        messageLower.includes(keyword.toLowerCase())
      );

      if (hasMatch) {
        completedObjectives.add(objective.id);
        debugLog(`🎯🎯🎯 OBJECTIVE COMPLETED 🎯🎯🎯`);
        debugLog(`   ✅ ${objective.description}`);
        debugLog(`   📊 Progress: ${completedObjectives.size}/${stage.objectives.length} objectives`);
        debugLog(`   📝 Messages: ${stageMessageCount} sent`);
      }
    });
  }

  // Update objectives progress UI
  function updateObjectivesUI() {
    // Check if objectives UI elements exist (they may have been removed)
    if (!dom.objectivesProgress || !dom.objectivesCount) {
      return; // Silently skip if UI elements don't exist
    }

    const quest = quests[currentQuest];
    const stage = quest.stages[currentStage];

    if (!stage.objectives || stage.objectives.length === 0) {
      dom.objectivesProgress.classList.add('hidden');
      return;
    }

    const totalObjectives = stage.objectives.length;
    const completed = completedObjectives.size;

    dom.objectivesProgress.classList.remove('hidden');
    dom.objectivesCount.textContent = `${completed}/${totalObjectives}`;
  }

  // Check if stage completion criteria are met
  function checkStageCompletion() {
    const quest = quests[currentQuest];
    const stage = quest.stages[currentStage];

    if (!stage.completionCriteria) {
      console.log('[Completion Check] No completion criteria defined for this stage');
      return;
    }

    const criteria = stage.completionCriteria;
    const minMessagesMet = stageMessageCount >= (criteria.minMessages || 0);
    const objectivesMet = completedObjectives.size >= (criteria.objectivesRequired || 0);

    // Check time requirement (in seconds)
    const elapsedTimeSeconds = stageStartTime ? (Date.now() - stageStartTime) / 1000 : 0;
    const minDurationMet = elapsedTimeSeconds >= (criteria.minDuration || 0);

    console.log('[Completion Check] Criteria check:', {
      minMessagesMet: `${minMessagesMet} (${stageMessageCount}/${criteria.minMessages || 0})`,
      objectivesMet: `${objectivesMet} (${completedObjectives.size}/${criteria.objectivesRequired || 0})`,
      minDurationMet: `${minDurationMet} (${Math.floor(elapsedTimeSeconds)}s/${criteria.minDuration || 0}s)`,
      stageCompleted
    });

    if (minMessagesMet && objectivesMet && minDurationMet && !stageCompleted) {
      debugLog('🎊🎊🎊🎊🎊 QUEST CRITERIA MET! 🎊🎊🎊🎊🎊');
      debugLog(`   ✅ Messages: ${stageMessageCount}/${criteria.minMessages}`);
      debugLog(`   ✅ Objectives: ${completedObjectives.size}/${criteria.objectivesRequired}`);
      debugLog(`   ✅ Time: ${Math.floor(elapsedTimeSeconds)}s/${criteria.minDuration}s`);
      debugLog(`   ⏳ Waiting for AI farewell message...`);
      stageCompleted = true;
      // Don't show notification yet - let the AI send a farewell message first
    }
  }

  // Show stage completion notification
  // Celebration effects
  function triggerCelebration() {
    // Trigger confetti
    triggerConfetti();
    // Trigger sparkles
    triggerSparkles();
  }

  function triggerConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';

    // Create 30 confetti pieces
    for (let i = 0; i < 30; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = (2.5 + Math.random()) + 's';

      // Random colors
      const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94', '#95e1d3', '#ffaaa5', '#ffd3b6', '#dcedc1', '#a8dadc'];
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];

      confettiContainer.appendChild(confetti);
    }

    document.body.appendChild(confettiContainer);

    // Remove after animation completes
    setTimeout(() => {
      document.body.removeChild(confettiContainer);
    }, 4000);
  }

  function triggerSparkles() {
    const sparkleEmojis = ['✨', '⭐', '🌟', '💫', '⚡'];

    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
        sparkle.style.left = (20 + Math.random() * 60) + '%';
        sparkle.style.top = (20 + Math.random() * 60) + '%';

        document.body.appendChild(sparkle);

        setTimeout(() => {
          document.body.removeChild(sparkle);
        }, 1000);
      }, i * 150);
    }
  }

  function showStageCompletionNotification() {
    debugLog('🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊');
    debugLog('🎉 SHOWING COMPLETION BANNER NOW!');
    debugLog('🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊🎊');

    // Trigger celebration effects
    triggerCelebration();

    const quest = quests[currentQuest];
    const stage = quest.stages[currentStage];

    // If this is the onboarding quest, mark it as complete
    if (currentQuest === 'quest-zero-onboarding') {
      completeOnboardingQuest();
    }

    // If this is the last stage of a quest, mark the quest as complete
    const nextStages = stage.nextStages || [];
    if (nextStages.length === 0) {
      completeQuest(currentQuest);
    }

    const notification = document.createElement('div');
    notification.className = 'p-6 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 text-green-900 rounded-xl mb-4 shadow-lg animate-scale-in';
    notification.style.zIndex = '100';
    notification.innerHTML = `
      <div class="text-center">
        <div class="text-5xl mb-3">🎉</div>
        <div class="text-xl font-bold mb-2">Quest Complete!</div>
        <div class="text-sm mb-3">You've completed all objectives for this quest.</div>
        ${stage.reward?.clue ? `<div class="text-sm mt-2 italic bg-white/70 p-3 rounded-lg text-gray-800 font-medium border border-gray-300">"${stage.reward.clue}"</div>` : ''}
        ${stage.reward?.xp ? `<div class="text-lg mt-3 font-bold text-green-700">+${stage.reward.xp} XP earned! ⭐</div>` : ''}
        <button id="continue-after-stage-btn" class="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg text-base font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md">
          Return to Quests
        </button>
      </div>
    `;

    console.log('📝 [showStageCompletionNotification] Notification created, appending to chat...');
    dom.chatContainer.appendChild(notification);
    dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;
    console.log('✅ [showStageCompletionNotification] Notification appended and scrolled to');

    // Function to return to quest view
    const returnToQuests = () => {
      console.log('[ConvoQuest] Returning to quest view');
      // Return to quest view
      dom.chatView.style.display = 'none';
      dom.questView.style.display = 'flex';

      // Re-render the quest list to show updated completion status
      renderQuests();

      // Show success message
      console.log('[ConvoQuest] Quest completed. Returned to quest selection.');
    };

    // Add event listener to the return button
    const continueBtn = document.getElementById('continue-after-stage-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        console.log('[ConvoQuest] User clicked return to quests button');
        returnToQuests();
      });
    }
  }

  // Mark the onboarding quest as complete in Firestore
  async function completeOnboardingQuest() {
    if (!currentUser) return;
    if (isDevMode) {
      console.log('[DEV MODE] Skipping Firebase save for onboarding quest completion');
      return;
    }
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        onboardingQuestCompleted: true
      }, { merge: true });
      console.log('[ConvoQuest] Onboarding quest marked as complete for user.');
    } catch (error) {
      console.error('Error updating user document for onboarding:', error);
    }
  }

  // Mark a quest as complete in Firestore
  async function completeQuest(questId) {
    if (!currentUser) return;

    // Add questId to the local state to prevent duplicates
    if (!userSettings.completedQuests.includes(questId)) {
      userSettings.completedQuests.push(questId);
    }

    // Re-render quests to reflect the change
    renderQuests();
    if (typeof window.updateUserProgress === 'function') {
      window.updateUserProgress({ completedQuests: userSettings.completedQuests });
    }

    if (isDevMode) {
      console.log(`[DEV MODE] Skipping Firebase save for quest completion: ${questId}`);
      return;
    }

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        completedQuests: userSettings.completedQuests
      }, { merge: true });
      console.log(`[ConvoQuest] Quest '${questId}' marked as complete.`);
    } catch (error) {
      console.error(`Error updating completed quests for ${questId}:`, error);
    }
  }

  // Check and show hints if player is stuck
  function checkAndShowHints() {
    const quest = quests[currentQuest];
    const stage = quest.stages[currentStage];

    if (!stage.objectives) return;

    // Only check hints if user has been chatting for a while
    if (stageMessageCount < 8) return;

    // Find the first uncompleted required objective (assumes linear progression)
    const uncompletedObjective = stage.objectives.find(
      obj => obj.required && !completedObjectives.has(obj.id)
    );

    if (!uncompletedObjective) return; // All objectives complete

    // Track attempts on this objective
    if (!lastObjectiveAttemptCount[uncompletedObjective.id]) {
      lastObjectiveAttemptCount[uncompletedObjective.id] = 0;
    }
    lastObjectiveAttemptCount[uncompletedObjective.id]++;

    // Only show hint if user has been stuck on THIS objective for 5+ messages
    const attemptsOnThisObjective = lastObjectiveAttemptCount[uncompletedObjective.id];
    if (attemptsOnThisObjective >= 5) {
      const hintKey = `${currentStage}-${uncompletedObjective.id}`;
      if (!shownHints.has(hintKey) && uncompletedObjective.hints && uncompletedObjective.hints.length > 0) {
        showHint(uncompletedObjective.hints[0]);
        shownHints.add(hintKey);
        // Reset count after showing hint
        lastObjectiveAttemptCount[uncompletedObjective.id] = 0;
      }
    }
  }

  // Display hint to user
  function showHint(hintText) {
    const hintEl = document.createElement('div');
    hintEl.className = 'p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg mb-2';
    hintEl.innerHTML = `
      <div class="font-semibold text-sm">💡 Hint</div>
      <div class="text-sm mt-1">${hintText}</div>
    `;

    dom.chatContainer.appendChild(hintEl);
    dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;
  }

  // Handle placement test
  async function handlePlacementSend() {
    const message = dom.placementChatInput.value.trim();
    if (!message) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'message user-message p-3 rounded-lg mb-2 bg-blue-100 ml-8';
    messageEl.textContent = message;
    dom.placementChatContainer.appendChild(messageEl);
    
    dom.placementChatInput.value = '';
    dom.placementSendBtn.disabled = true;
    dom.placementSendBtn.textContent = 'Sending...';

    try {
      const systemInstruction = "You are a Spanish language assessment tutor. Evaluate the user's Spanish level and provide appropriate responses.";
      const response = await AIManager.callAPI(systemInstruction, [
        { role: "user", parts: [{ text: message }] }
      ]);
      
      const npcMessageEl = document.createElement('div');
      npcMessageEl.className = 'message npc-message p-3 rounded-lg mb-2 bg-gray-100 mr-8';
      npcMessageEl.textContent = response;
      dom.placementChatContainer.appendChild(npcMessageEl);
      
      dom.placementChatContainer.scrollTop = dom.placementChatContainer.scrollHeight;
    } catch (error) {
      console.error('Error in placement chat:', error);
    } finally {
      dom.placementSendBtn.disabled = false;
      dom.placementSendBtn.textContent = 'Send';
    }
  }

  // Event listeners
  debugLog('🎯 Setting up event listeners...');
  try {
    if (dom.showSignupBtn) dom.showSignupBtn.addEventListener('click', () => showView('signup-view'));
    if (dom.showLoginBtn) dom.showLoginBtn.addEventListener('click', () => showView('login-view'));
    if (dom.loginBtn) {
      dom.loginBtn.addEventListener('click', (e) => {
        console.log('🔵 Login button clicked');
        e.preventDefault();
        handleLogin();
      });
      console.log('✅ Login button event listener attached');
    } else {
      console.error('❌ Login button not found in DOM');
    }

    // Add Enter key support for login
    if (dom.loginPasswordInput) {
      dom.loginPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          console.log('🔵 Enter key pressed in password field');
          e.preventDefault();
          handleLogin();
        }
      });
    }
    if (dom.loginEmailInput) {
      dom.loginEmailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          console.log('🔵 Enter key pressed in email field');
          e.preventDefault();
          handleLogin();
        }
      });
    }

    if (dom.signupBtn) dom.signupBtn.addEventListener('click', handleSignup);
    if (dom.logoutBtn) dom.logoutBtn.addEventListener('click', handleLogout);
    debugLog('✅ Auth event listeners set');

    if (dom.backToQuestsBtn) {
      dom.backToQuestsBtn.addEventListener('click', () => {
        dom.chatView.style.display = 'none';
        dom.questView.style.display = 'flex';
        TTSManager.stop(); // Stop any playing audio when leaving chat
      });
    }

    // Repeat TTS button
    const repeatTTSBtn = document.getElementById('repeat-tts-btn');
    if (repeatTTSBtn) {
      repeatTTSBtn.addEventListener('click', () => {
        TTSManager.repeat();
      });
    }

    // Autoplay toggle button
    const autoplayToggleBtn = document.getElementById('autoplay-toggle-btn');
    if (autoplayToggleBtn) {
      // Update button text based on initial state
      const updateAutoplayButton = () => {
        autoplayToggleBtn.textContent = autoplayEnabled ? '🔊 Auto-play' : '🔇 Auto-play';
        autoplayToggleBtn.className = autoplayEnabled
          ? 'text-blue-600 hover:text-blue-700 px-3 py-1 rounded-md text-sm transition-colors font-medium'
          : 'text-gray-600 hover:text-blue-500 px-3 py-1 rounded-md text-sm transition-colors';
      };

      updateAutoplayButton();

      autoplayToggleBtn.addEventListener('click', () => {
        autoplayEnabled = !autoplayEnabled;
        updateAutoplayButton();
        console.log(`[TTS] Autoplay ${autoplayEnabled ? 'enabled' : 'disabled'}`);

        // Stop current audio if disabling
        if (!autoplayEnabled) {
          TTSManager.stop();
        } else {
          // Re-unlock audio when enabling autoplay (user interaction)
          unlockAudio();
        }
      });
    }

    if (dom.sendBtn) dom.sendBtn.addEventListener('click', sendChatMessage);
    if (dom.chatInput) {
      dom.chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendChatMessage();
      });
    }

    // Voice input with microphone button
    if (dom.micBtn) {
      let recognition = null;
      let isListening = false;

      // Check if browser supports speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'es-MX'; // Spanish (Mexico) - can be changed based on dialect setting
        recognition.continuous = false;
        recognition.interimResults = true; // Show interim results for better UX
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          isListening = true;
          dom.micBtn.textContent = '🔴'; // Red dot to indicate recording
          dom.micBtn.style.opacity = '1';
          dom.chatInput.placeholder = 'Listening...';
          console.log('🎤 Speech recognition started');
        };

        recognition.onresult = (event) => {
          console.log('🎤 Speech recognition result received');
          const last = event.results.length - 1;
          const transcript = event.results[last][0].transcript;
          console.log('🎤 Transcript:', transcript);

          // Update input with transcript (interim or final)
          dom.chatInput.value = transcript;
          dom.chatInput.focus();
        };

        recognition.onspeechend = () => {
          console.log('🎤 Speech ended');
          recognition.stop();
        };

        recognition.onerror = (event) => {
          console.error('🎤 Speech recognition error:', event.error);
          isListening = false;
          dom.micBtn.textContent = '🎤';
          dom.chatInput.placeholder = 'Type your reply...';

          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            alert('Microphone access denied. Please allow microphone access in your browser settings.');
          } else if (event.error === 'no-speech') {
            console.log('🎤 No speech detected');
          } else if (event.error === 'aborted') {
            console.log('🎤 Speech recognition aborted');
          } else {
            console.error('🎤 Speech recognition error details:', event);
          }
        };

        recognition.onend = () => {
          console.log('🎤 Speech recognition ended');
          isListening = false;
          dom.micBtn.textContent = '🎤';
          dom.chatInput.placeholder = 'Type your reply...';
        };

        dom.micBtn.addEventListener('click', () => {
          if (isListening) {
            console.log('🎤 Stopping speech recognition');
            recognition.stop();
          } else {
            console.log('🎤 Starting speech recognition');
            try {
              recognition.start();
            } catch (error) {
              console.error('🎤 Error starting speech recognition:', error);
              alert('Error starting microphone: ' + error.message);
            }
          }
        });
      } else {
        // Browser doesn't support speech recognition
        console.warn('🎤 Speech recognition not supported');
        dom.micBtn.style.opacity = '0.5';
        dom.micBtn.title = 'Speech recognition not supported in this browser';
      }
    }
    debugLog('✅ Chat event listeners set');

    // Character introduction card
    if (dom.characterIntroContinueBtn) {
      dom.characterIntroContinueBtn.addEventListener('click', () => {
        hideCharacterIntroCard();
      });
    }

    // Dark mode toggle (main app)
    if (dom.darkModeToggle) {
      dom.darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Dark mode toggle (auth screen)
    const authDarkModeToggle = document.getElementById('auth-dark-mode-toggle');
    if (authDarkModeToggle) {
      authDarkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Initialize dark mode from localStorage
    initDarkMode();

    // Placement test quiz buttons
    if (dom.submitQuizBtn) {
      dom.submitQuizBtn.addEventListener('click', () => {
        PlacementTestManager.submitAnswer();
      });
    }
    if (dom.completePlacementBtn) {
      dom.completePlacementBtn.addEventListener('click', () => {
        PlacementTestManager.completeTest();
      });
    }

    if (dom.placementSendBtn) dom.placementSendBtn.addEventListener('click', handlePlacementSend);
    if (dom.placementChatInput) {
      dom.placementChatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') handlePlacementSend();
      });
    }

    // Retake Placement Test button
    if (dom.retakePlacementBtn) {
      dom.retakePlacementBtn.addEventListener('click', async () => {
        console.log('[RetakePlacement] Button clicked');

        if (!currentUser) {
          console.error('[RetakePlacement] No user logged in');
          return;
        }

        try {
          // Reset placement and onboarding status in Firebase
          await setDoc(doc(db, 'users', currentUser.uid), {
            placementCompleted: false,
            onboardingQuestCompleted: false,
            placementLevel: null,
            placementScore: null,
            completedQuests: [] // Reset quest progress to start fresh
          }, { merge: true });

          console.log('[RetakePlacement] User data reset successfully');

          // Close settings modal
          if (dom.settingsModal) {
            dom.settingsModal.classList.add('hidden');
          }

          // Initialize and show placement test
          PlacementTestManager.init();
          showView('placement-view');

          console.log('[RetakePlacement] Placement test restarted');
        } catch (error) {
          console.error('[RetakePlacement] Error resetting user data:', error);
          alert('Error resetting placement test. Please try again.');
        }
      });
    }

    debugLog('✅ Placement event listeners set');

    // Menu dropdown toggle
    if (dom.menuToggleBtn && dom.menuDropdown) {
      dom.menuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.menuDropdown.classList.toggle('hidden');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (dom.menuDropdown && !dom.menuDropdown.classList.contains('hidden')) {
          if (!dom.menuToggleBtn.contains(e.target) && !dom.menuDropdown.contains(e.target)) {
            dom.menuDropdown.classList.add('hidden');
          }
        }
      });

      // Menu item: Relationships/Friendships
      if (dom.relationshipsMenuItem) {
        dom.relationshipsMenuItem.addEventListener('click', async () => {
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

      // Menu item: Preferences
      if (dom.preferencesMenuItem) {
        dom.preferencesMenuItem.addEventListener('click', () => {
          dom.settingsModal.classList.remove('hidden');
          dom.menuDropdown.classList.add('hidden');
        });
      }

      // Menu item: Voice
      if (dom.voiceMenuItem) {
        dom.voiceMenuItem.addEventListener('click', () => {
          dom.voiceModal.classList.remove('hidden');
          dom.menuDropdown.classList.add('hidden');
        });
      }

      // Menu item: Accessibility
      if (dom.accessibilityMenuItem) {
        dom.accessibilityMenuItem.addEventListener('click', () => {
          dom.accessibilityModal.classList.remove('hidden');
          dom.menuDropdown.classList.add('hidden');
        });
      }

      // Menu item: Logout
      if (dom.logoutMenuItem) {
        dom.logoutMenuItem.addEventListener('click', () => {
          handleLogout();
          dom.menuDropdown.classList.add('hidden');
        });
      }
    }

    // Settings modal
    if (dom.settingsBtn) {
      dom.settingsBtn.addEventListener('click', () => {
        dom.settingsModal.classList.remove('hidden');
      });
    }

    if (dom.closeSettingsBtn) {
      dom.closeSettingsBtn.addEventListener('click', () => {
        dom.settingsModal.classList.add('hidden');
      });
    }

    // Voice modal close button
    if (dom.closeVoiceBtn) {
      dom.closeVoiceBtn.addEventListener('click', () => {
        dom.voiceModal.classList.add('hidden');
      });
    }

    // Accessibility modal close button
    if (dom.closeAccessibilityBtn) {
      dom.closeAccessibilityBtn.addEventListener('click', () => {
        dom.accessibilityModal.classList.add('hidden');
      });
    }

    // Close relationships view button
    const closeRelationshipsBtn = document.getElementById('close-relationships-btn');
    if (closeRelationshipsBtn) {
      closeRelationshipsBtn.addEventListener('click', () => {
        hideRelationshipsView();
      });
    }

    // Dark mode theme selector in Preferences
    if (dom.darkModeSetting) {
      // Function to apply theme
      const applyTheme = (theme) => {
        if (theme === 'auto') {
          // Use system preference
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.body.classList.toggle('dark-mode', systemDark);
        } else if (theme === 'dark') {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      };

      // Handle theme selection change
      dom.darkModeSetting.addEventListener('change', (e) => {
        const theme = e.target.value;
        localStorage.setItem('themePreference', theme);
        applyTheme(theme);
      });

      // Listen for system theme changes (only applies in 'auto' mode)
      const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      systemThemeQuery.addEventListener('change', (e) => {
        const currentTheme = localStorage.getItem('themePreference') || 'auto';
        if (currentTheme === 'auto') {
          document.body.classList.toggle('dark-mode', e.matches);
        }
      });

      // Initialize from localStorage
      const savedTheme = localStorage.getItem('themePreference') || 'auto';
      dom.darkModeSetting.value = savedTheme;
      applyTheme(savedTheme);
    }

    // Voice speed slider
    if (dom.voiceSpeedSlider) {
      dom.voiceSpeedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        dom.voiceSpeedValue.textContent = `${speed.toFixed(1)}x`;
        userSettings.voiceSpeed = speed;
      });
      debugLog('✅ Voice speed slider listener set');
    } else {
      console.warn('❌ Voice speed slider not found');
    }

    // Voice pitch slider
    if (dom.voicePitchSlider) {
      dom.voicePitchSlider.addEventListener('input', (e) => {
        const pitch = parseInt(e.target.value);
        const labels = ['Much Lower', 'Lower', 'Slightly Lower', 'Normal', 'Slightly Higher', 'Higher', 'Much Higher'];
        dom.voicePitchValue.textContent = labels[pitch + 3] || 'Normal';
        userSettings.voicePitch = pitch;
      });
      debugLog('✅ Voice pitch slider listener set');
    } else {
      console.warn('❌ Voice pitch slider not found');
    }

    // Debug log toggle
    const debugToggleBtn = document.getElementById('voice-debug-toggle');
    const debugContent = document.getElementById('voice-debug-content');
    const debugHeader = document.getElementById('voice-debug-header');

    if (debugToggleBtn && debugContent && debugHeader) {
      debugHeader.addEventListener('click', () => {
        const isHidden = debugContent.classList.contains('hidden');
        if (isHidden) {
          debugContent.classList.remove('hidden');
          debugToggleBtn.textContent = '−';
        } else {
          debugContent.classList.add('hidden');
          debugToggleBtn.textContent = '+';
        }
      });
    }

    // Debug log function for voice testing
    function addVoiceDebugLog(message, type = 'info') {
      const debugLog = document.getElementById('voice-debug-log');
      const debugContent = document.getElementById('voice-debug-content');

      if (debugLog && debugContent) {
        // Show the debug log container
        debugLog.classList.remove('hidden');

        // Make sure content is visible (expanded)
        debugContent.classList.remove('hidden');
        const debugToggle = document.getElementById('voice-debug-toggle');
        if (debugToggle) debugToggle.textContent = '−';

        // Create log entry
        const logEntry = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        const color = type === 'error' ? 'text-red-600' : type === 'success' ? 'text-green-600' : 'text-gray-600';
        logEntry.className = color;
        logEntry.textContent = `[${timestamp}] ${message}`;

        // Add to log (newest first)
        debugContent.insertBefore(logEntry, debugContent.firstChild);

        // Keep only last 20 entries
        while (debugContent.children.length > 20) {
          debugContent.removeChild(debugContent.lastChild);
        }
      }

      // Also log to console
      console.log(`[Voice Debug] ${message}`);
    }

    // Test voice button
    if (dom.testVoiceBtn) {
      console.log('[Voice] Setting up test voice button listener');
      dom.testVoiceBtn.addEventListener('click', async () => {
        addVoiceDebugLog('🔘 Test Voice button clicked', 'info');

        try {
          const testText = 'Hello! This is a test of the voice system. How does this sound to you?';
          const characterName = 'Test Character';
          const characterGender = 'female';
          const currentSpeed = parseFloat(dom.voiceSpeedSlider.value);

          addVoiceDebugLog(`📝 Text: "${testText}"`, 'info');
          addVoiceDebugLog(`👤 Character: ${characterName} (${characterGender})`, 'info');
          addVoiceDebugLog(`🔧 Voice Provider: Cartesia (auto-fallback to OpenAI → Google)`, 'info');
          addVoiceDebugLog(`🎤 Voice: Auto-selected based on character`, 'info');
          addVoiceDebugLog(`⚡ Voice Speed: ${currentSpeed}x`, 'info');

          // Temporarily override settings for testing
          const savedSpeed = userSettings.voiceSpeed;
          userSettings.voiceSpeed = currentSpeed;

          addVoiceDebugLog('🔊 Calling TTSManager.speak()...', 'info');
          await TTSManager.speak(testText, characterName, characterGender);
          addVoiceDebugLog('✅ TTSManager.speak() completed', 'success');

          // Restore saved settings
          userSettings.voiceSpeed = savedSpeed;
        } catch (error) {
          addVoiceDebugLog(`❌ Error: ${error.message}`, 'error');
          console.error('[Voice Test Error]', error);
        }
      });
      debugLog('✅ Test voice button listener set');
    } else {
      console.warn('❌ Test voice button not found in DOM');
    }

    debugLog('✅ Settings event listeners set');

    if (dom.saveSettingsBtn) {
      dom.saveSettingsBtn.addEventListener('click', async () => {
        if (currentUser) {
          userSettings.dialect = dom.dialectSelect.value;
          userSettings.formality = dom.formalitySelect.value;
          userSettings.voiceSpeed = parseFloat(dom.voiceSpeedSlider.value);
          userSettings.voicePitch = parseInt(dom.voicePitchSlider.value);

          try {
            await setDoc(doc(db, 'users', currentUser.uid), {
              settings: userSettings
            }, { merge: true });

            dom.settingsModal.classList.add('hidden');
            alert('Settings saved successfully!');
          } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings. Please try again.');
          }
        }
      });
    }

    // High Contrast Mode
    const highContrastToggle = document.getElementById('high-contrast-toggle');

    function applyHighContrast(enabled) {
      if (enabled) {
        document.body.classList.add('high-contrast');
        debugLog('✅ High contrast mode enabled');
      } else {
        document.body.classList.remove('high-contrast');
        debugLog('✅ High contrast mode disabled');
      }
      // Save preference
      localStorage.setItem('highContrast', enabled ? 'true' : 'false');
    }

    // Load saved high contrast preference
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    if (savedHighContrast) {
      applyHighContrast(true);
      if (highContrastToggle) {
        highContrastToggle.checked = true;
      }
    }

    // Handle high contrast toggle
    if (highContrastToggle) {
      highContrastToggle.addEventListener('change', (e) => {
        applyHighContrast(e.target.checked);
      });
    }

    // Font Size Options
    const fontSizeSelect = document.getElementById('font-size-select');

    function applyFontSize(size) {
      // Remove all font size classes
      document.body.classList.remove('font-size-small', 'font-size-normal', 'font-size-large', 'font-size-xlarge');

      // Add the selected font size class
      document.body.classList.add(`font-size-${size}`);

      // Save preference
      localStorage.setItem('fontSize', size);
      debugLog(`✅ Font size set to: ${size}`);
    }

    // Load saved font size preference
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';
    applyFontSize(savedFontSize);
    if (fontSizeSelect) {
      fontSizeSelect.value = savedFontSize;
    }

    // Handle font size selection
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', (e) => {
        applyFontSize(e.target.value);
      });
    }

    // Keyboard Navigation Support
    document.addEventListener('keydown', (e) => {
      // Escape key to close modals
      if (e.key === 'Escape') {
        // Close settings modal
        if (dom.settingsModal && !dom.settingsModal.classList.contains('hidden')) {
          dom.settingsModal.classList.add('hidden');
          debugLog('⌨️ Closed settings modal with Escape');
          return;
        }

        // Close other modals
        const modals = document.querySelectorAll('.modal-bg:not(.hidden)');
        modals.forEach(modal => {
          if (modal.id !== 'settings-modal') {
            modal.classList.add('hidden');
            debugLog(`⌨️ Closed modal ${modal.id} with Escape`);
          }
        });

        // Go back from chat view to quest view (if in chat)
        const inChatView = dom.chatView && dom.chatView.style.display !== 'none';
        if (inChatView) {
          dom.chatView.style.display = 'none';
          dom.questView.style.display = 'flex';
          updateMobileNavActive('quests');
          TTSManager.stop();
          debugLog('⌨️ Returned to quest list with Escape');
        }
      }

      // Ctrl/Cmd + K for quick settings
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (dom.settingsModal) {
          const isHidden = dom.settingsModal.classList.contains('hidden');
          if (isHidden) {
            dom.settingsModal.classList.remove('hidden');
            debugLog('⌨️ Opened settings with Ctrl/Cmd+K');
          } else {
            dom.settingsModal.classList.add('hidden');
            debugLog('⌨️ Closed settings with Ctrl/Cmd+K');
          }
        }
      }

      // Ctrl/Cmd + / for help (toggle between views)
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const inChatView = dom.chatView && dom.chatView.style.display !== 'none';
        if (inChatView) {
          dom.chatView.style.display = 'none';
          dom.questView.style.display = 'flex';
          updateMobileNavActive('quests');
          debugLog('⌨️ Toggled to quest view with Ctrl/Cmd+/');
        }
      }
    });

    // Add visible focus indicators
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Screen Reader Announcements
    const srAnnouncements = document.getElementById('sr-announcements');

    function announceToScreenReader(message, priority = 'polite') {
      if (!srAnnouncements) return;

      // Clear previous announcement
      srAnnouncements.textContent = '';

      // Set priority
      srAnnouncements.setAttribute('aria-live', priority); // 'polite' or 'assertive'

      // Announce new message after a small delay to ensure screen readers pick it up
      setTimeout(() => {
        srAnnouncements.textContent = message;
        debugLog(`📢 Screen reader announcement: ${message}`);
      }, 100);

      // Clear after announcement to avoid repetition
      setTimeout(() => {
        srAnnouncements.textContent = '';
      }, 3000);
    }

    // Update ARIA current when mobile nav changes
    const originalUpdateMobileNavActive = updateMobileNavActive;
    updateMobileNavActive = function(activeView) {
      originalUpdateMobileNavActive(activeView);

      // Update aria-current attribute
      const navButtons = document.querySelectorAll('.mobile-nav-button');
      navButtons.forEach(btn => {
        if (btn.dataset.view === activeView) {
          btn.setAttribute('aria-current', 'page');
        } else {
          btn.removeAttribute('aria-current');
        }
      });

      // Announce view change
      const viewNames = {
        quests: 'Quest list',
        quiz: 'Placement quiz',
        profile: 'Profile and settings'
      };
      const viewName = viewNames[activeView] || activeView;
      announceToScreenReader(`Navigated to ${viewName}`);
    };

    // Expose announcement function globally for use in other parts of the app
    window.announceToScreenReader = announceToScreenReader;

    // Onboarding Tour
    const onboardingOverlay = document.getElementById('onboarding-overlay');
    const onboardingSpotlight = document.getElementById('onboarding-spotlight');
    const onboardingTooltip = document.getElementById('onboarding-tooltip');
    const onboardingTitle = document.getElementById('onboarding-title');
    const onboardingMessage = document.getElementById('onboarding-message');
    const onboardingNext = document.getElementById('onboarding-next');
    const onboardingSkip = document.getElementById('onboarding-skip');

    const tourSteps = [
      {
        target: '#welcome-message',
        title: 'Welcome to ConvoQuest! 🎉',
        message: 'This is your quest hub where you can see all available language learning adventures.',
        position: 'bottom'
      },
      {
        target: '#quest-list-container',
        title: 'Choose Your Quest',
        message: 'Browse through quests and click on one to start your Spanish learning journey!',
        position: 'top'
      },
      {
        target: '#settings-btn',
        title: 'Personalize Your Experience',
        message: 'Access settings here to adjust font size, high contrast mode, and other accessibility features.',
        position: 'bottom'
      },
      {
        target: '#mobile-bottom-nav',
        title: 'Quick Navigation (Mobile)',
        message: 'Use the bottom navigation to quickly switch between quests, quiz, and your profile.',
        position: 'top'
      }
    ];

    let currentTourStep = 0;

    function positionTooltip(targetElement, position) {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = onboardingTooltip.getBoundingClientRect();
      const arrow = onboardingTooltip.querySelector('.onboarding-arrow');

      // Remove previous arrow classes
      arrow.classList.remove('top', 'bottom', 'left', 'right');

      let top, left;

      switch (position) {
        case 'bottom':
          top = targetRect.bottom + 20;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          arrow.classList.add('top');
          break;
        case 'top':
          top = targetRect.top - tooltipRect.height - 20;
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
          arrow.classList.add('bottom');
          break;
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.left - tooltipRect.width - 20;
          arrow.classList.add('right');
          break;
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
          left = targetRect.right + 20;
          arrow.classList.add('left');
          break;
      }

      // Keep tooltip on screen
      const padding = 10;
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
      top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));

      onboardingTooltip.style.top = `${top}px`;
      onboardingTooltip.style.left = `${left}px`;
    }

    function showTourStep(stepIndex) {
      if (stepIndex >= tourSteps.length) {
        endTour();
        return;
      }

      const step = tourSteps[stepIndex];
      const targetElement = document.querySelector(step.target);

      if (!targetElement) {
        // Skip to next step if target not found
        currentTourStep++;
        showTourStep(currentTourStep);
        return;
      }

      const rect = targetElement.getBoundingClientRect();

      // Position spotlight
      onboardingSpotlight.style.top = `${rect.top - 5}px`;
      onboardingSpotlight.style.left = `${rect.left - 5}px`;
      onboardingSpotlight.style.width = `${rect.width + 10}px`;
      onboardingSpotlight.style.height = `${rect.height + 10}px`;

      // Update tooltip content
      onboardingTitle.textContent = step.title;
      onboardingMessage.textContent = step.message;

      // Update button text for last step
      if (stepIndex === tourSteps.length - 1) {
        onboardingNext.textContent = 'Finish';
      } else {
        onboardingNext.textContent = 'Next';
      }

      // Update progress dots
      const dots = document.querySelectorAll('.onboarding-dot');
      dots.forEach((dot, index) => {
        if (index === stepIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      // Position tooltip
      positionTooltip(targetElement, step.position);

      // Show elements
      onboardingOverlay.classList.remove('hidden');
      onboardingSpotlight.classList.remove('hidden');
      onboardingTooltip.classList.remove('hidden');
    }

    function endTour() {
      onboardingOverlay.classList.add('hidden');
      onboardingSpotlight.classList.add('hidden');
      onboardingTooltip.classList.add('hidden');
      localStorage.setItem('onboardingCompleted', 'true');
      announceToScreenReader('Onboarding tour completed');
      debugLog('✅ Onboarding tour completed');
    }

    function startOnboardingTour() {
      currentTourStep = 0;
      showTourStep(currentTourStep);
      announceToScreenReader('Welcome tour started');
      debugLog('🎓 Onboarding tour started');
    }

    // Event listeners for onboarding
    if (onboardingNext) {
      onboardingNext.addEventListener('click', () => {
        currentTourStep++;
        showTourStep(currentTourStep);
      });
    }

    if (onboardingSkip) {
      onboardingSkip.addEventListener('click', () => {
        endTour();
      });
    }

    // Check if onboarding should be shown
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (!onboardingCompleted && currentUser && dom.mainAppView && !dom.mainAppView.classList.contains('hidden')) {
      // Start onboarding after a short delay to ensure UI is ready
      setTimeout(() => {
        startOnboardingTour();
      }, 1000);
    }

    // Expose function to restart tour (for testing or user request)
    window.restartOnboardingTour = function() {
      localStorage.removeItem('onboardingCompleted');
      startOnboardingTour();
    };

    debugLog('✅ All event listeners set successfully');
  } catch (error) {
    debugLog(`❌ Error setting up event listeners: ${error.message}`);
    console.error('Event listener error:', error);
  }

  // Auto-login for development mode - DISABLED (we bypass auth entirely now)
  // In dev mode, auth is completely bypassed and main app is shown immediately
  if (false && isDevMode) {
    console.log('🔧 DEV MODE: Firebase auto-login disabled - using auth bypass instead');
  }

  // Auth state listener
  debugLog('🔐 Setting up auth state listener...');

  // Use real Firebase Auth
  onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        if (dom.userDisplayName) {
          dom.userDisplayName.textContent = user.displayName || 'User';
        }
        if (dom.welcomeMessage) {
          dom.welcomeMessage.textContent = `Welcome, ${user.displayName || 'User'}!`;
        }

        // Hide auth container and show main app
        if (dom.authContainer) {
          dom.authContainer.style.display = 'none';
          debugLog('✅ Auth container hidden');
        }

        try {
          // Load user data
          const userData = await loadUserData(user);
          debugLog(`📊 User data loaded: ${JSON.stringify(userData ? { placementCompleted: userData.placementCompleted, onboardingQuestCompleted: userData.onboardingQuestCompleted } : 'null')}`);

          // Pass user progress to the quest map
          if (typeof window.updateUserProgress === 'function') {
            window.updateUserProgress({
              completedQuests: userSettings.completedQuests || []
            });
          }

          // Check if placement test is needed
          if (!userData || !userData.placementCompleted) {
            debugLog('[PRODUCTION MODE] Showing placement-view.');
            showView('placement-view');
          } else if (!userData.onboardingQuestCompleted) {
            // If placement is done but onboarding is not, start Quest Zero
            debugLog('[PRODUCTION MODE] Starting quest-zero-onboarding.');
            if (dom.mainAppView) dom.mainAppView.style.display = 'flex';
            startQuest('quest-zero-onboarding');
          } else {
            debugLog('[PRODUCTION MODE] Showing main-app-view.');
            showView('main-app-view');
          }
        } catch (error) {
          console.error('[PRODUCTION MODE] Error in auth flow:', error);
          debugLog(`❌ Error in auth flow: ${error.message}`);
          // Fallback to placement test if there's an error
          showView('placement-view');
        }
        
      } else {
        currentUser = null;

        // Hide main app view
        if (dom.mainAppView) {
          dom.mainAppView.style.display = 'none';
          dom.mainAppView.classList.remove('active');
        }

        // Only show auth container on production (not on localhost)
        if (!isDevMode) {
          // Show auth container when logged out
          if (dom.authContainer) {
            dom.authContainer.style.display = 'flex';
            dom.authContainer.classList.add('active');
            debugLog('✅ Auth container shown');
          }

          // Show login view
          showAuthView('login-view');
          debugLog('Login view shown.');
        } else {
          console.log('🔧 DEV MODE: Not showing login page, auto-login will handle it');
        }
      }
    });

  // Initialize quest list
  debugLog('📋 Initializing quest list...');
  renderQuests();

  // Initialize quest map
  if (typeof window.initializeQuestMap === 'function') {
    debugLog('🗺️ Initializing quest map...');
    window.initializeQuestMap();
  } else {
    debugLog('⚠️ Quest map init function not found');
  }

  // Expose functions for quest map
  window.startQuest = startQuest;
  window.showQuestList = () => showView('main-app-view');

  // Add ripple effect to all buttons
  document.addEventListener('click', function(e) {
    const button = e.target.closest('button, .btn');
    if (!button || button.disabled) return;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  });

  // Mobile Bottom Navigation
  function updateMobileNavActive(activeView) {
    const navButtons = document.querySelectorAll('.mobile-nav-button');
    navButtons.forEach(btn => {
      if (btn.dataset.view === activeView) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Handle mobile nav button clicks
  const mobileNavButtons = document.querySelectorAll('.mobile-nav-button');
  mobileNavButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetView = button.dataset.view;

      // Update active state
      updateMobileNavActive(targetView);

      // Handle navigation based on view
      if (targetView === 'quests') {
        // Show quest list
        if (dom.chatView) dom.chatView.style.display = 'none';
        if (dom.questView) dom.questView.style.display = 'flex';
        showView('main-app-view');
      } else if (targetView === 'quiz') {
        // Show placement test
        showView('placement-view');
      } else if (targetView === 'profile') {
        // Show settings modal as a "profile" view
        if (dom.settingsModal) {
          dom.settingsModal.classList.remove('hidden');
        }
      }
    });
  });

  // Update mobile nav when returning to quests from chat
  if (dom.backToQuestsBtn) {
    const originalClickHandler = dom.backToQuestsBtn.onclick;
    dom.backToQuestsBtn.addEventListener('click', () => {
      updateMobileNavActive('quests');
    });
  }

  // Update mobile nav when ending session
  const endSessionBtn = document.getElementById('end-session-btn');
  if (endSessionBtn) {
    endSessionBtn.addEventListener('click', () => {
      updateMobileNavActive('quests');
    });
  }

  // Swipe Gesture Navigation
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let isSwiping = false;
  const minSwipeDistance = 50; // Minimum distance for a swipe
  const maxVerticalDistance = 100; // Maximum vertical movement to still count as horizontal swipe

  function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // Only process if horizontal swipe is significant and vertical movement is minimal
    if (Math.abs(deltaX) < minSwipeDistance || deltaY > maxVerticalDistance) {
      return;
    }

    // Determine current view
    const inChatView = dom.chatView && dom.chatView.style.display !== 'none';
    const inQuestView = dom.questView && dom.questView.style.display !== 'none';

    // Swipe right (go back)
    if (deltaX > 0 && inChatView) {
      // Return to quest list from chat
      dom.chatView.style.display = 'none';
      dom.questView.style.display = 'flex';
      updateMobileNavActive('quests');
      TTSManager.stop();
      debugLog('⬅️ Swiped right: Returned to quest list');
    }
    // Swipe left (not implemented for now - could be used for quick actions)
    else if (deltaX < 0 && inQuestView) {
      debugLog('➡️ Swiped left in quest view');
      // Future: Could implement quest navigation or quick access to profile
    }
  }

  // Touch event listeners for swipe gestures
  const swipeContainer = document.getElementById('app-container');
  if (swipeContainer) {
    swipeContainer.addEventListener('touchstart', (e) => {
      // Don't interfere with scrolling or button interactions
      const target = e.target;
      if (target.closest('button') || target.closest('input') || target.closest('textarea')) {
        return;
      }

      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      isSwiping = true;
    }, { passive: true });

    swipeContainer.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;

      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
    }, { passive: true });

    swipeContainer.addEventListener('touchend', (e) => {
      if (!isSwiping) return;

      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;

      handleSwipeGesture();
      isSwiping = false;
    }, { passive: true });
  }

  debugLog('✅ Application initialized successfully');
  console.log('[ConvoQuest] Application initialized successfully');
}

// Auto-initialize when DOM is ready
console.log('🟢 Setting up auto-initialization...');
console.log('🟢 Document ready state:', document.readyState);

if (document.readyState === 'loading') {
  console.log('🟢 Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🟢 DOMContentLoaded fired, calling initializeApp...');
    initializeApp();
  });
} else {
  console.log('🟢 DOM already ready, calling initializeApp immediately...');
  initializeApp();
}