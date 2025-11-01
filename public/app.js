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

// Debug logging helper
// Logs to browser console (always) and optional on-screen debug console
// To enable on-screen console: uncomment the debug-console div in HTML above
function debugLog(msg) {
    // Log to browser console (F12 Developer Tools)
    console.log(msg);

    // Log to on-screen debug console (if enabled)
    const debugConsole = document.getElementById('debug-console');
    if (debugConsole) {
        const timestamp = new Date().toLocaleTimeString();
        debugConsole.innerHTML += `[${timestamp}] ${msg}<br>`;
        debugConsole.scrollTop = debugConsole.scrollHeight;
    }

    // TEMPORARY: Log to visible debug panel
    const debugOutput = document.getElementById('debug-output');
    if (debugOutput) {
        const timestamp = new Date().toLocaleTimeString();
        debugOutput.innerHTML += `[${timestamp}] ${msg}<br>`;
        const panel = document.getElementById('debug-panel');
        if (panel) panel.scrollTop = panel.scrollHeight;
    }
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
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    dialectSelect: document.getElementById('dialect-select'),
    formalitySelect: document.getElementById('formality-select'),
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
    darkModeToggle: document.getElementById('dark-mode-toggle')
  };

  // Check for critical missing elements
  const criticalElements = ['authContainer', 'mainAppView', 'loginView', 'chatView'];
  const missingElements = criticalElements.filter(key => !dom[key]);
  if (missingElements.length > 0) {
    debugLog(`❌ Missing critical elements: ${missingElements.join(', ')}`);
  } else {
    debugLog('✅ All critical DOM elements found');
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
  const AIManager = {
    async callAPI(systemInstruction, contents, retries = 3, delay = 1000) {
      try {
        const response = await fetch('/api/gemini', {
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

        const result = await response.json();

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
        console.error("Fetch Error:", error);
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

  // TTS Manager for natural AI voice output
  const TTSManager = {
    async speak(text, characterName, characterGender) {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }

      try {
        console.log(`[TTS] Speaking: "${text.substring(0, 50)}..." as ${characterName}`);

        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            characterName: characterName || 'Unknown',
            characterGender: characterGender || 'unknown'
          })
        });

        if (!response.ok) {
          console.error('[TTS] API error:', response.status);
          return;
        }

        const data = await response.json();

        if (data.audioContent) {
          // Create audio element from base64 MP3
          const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
          currentAudio = audio;

          // Play the audio
          audio.play().catch(err => {
            console.error('[TTS] Playback error:', err);
          });

          // Clear reference when done
          audio.onended = () => {
            if (currentAudio === audio) {
              currentAudio = null;
            }
          };
        }
      } catch (error) {
        console.error('[TTS] Error:', error);
      }
    },

    stop() {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
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
          optionBtn.className = 'w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all';
          optionBtn.textContent = option;
          optionBtn.addEventListener('click', () => this.selectOption(index, optionBtn));
          dom.quizOptions.appendChild(optionBtn);
        });

        // Add "I don't know" option
        const dontKnowBtn = document.createElement('button');
        dontKnowBtn.className = 'w-full text-left p-4 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-600 italic';
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

      // Save to Firebase
      if (currentUser && currentUser.uid) {
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
    const email = dom.loginEmailInput.value.trim();
    const password = dom.loginPasswordInput.value;

    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      dom.loginBtn.disabled = true;
      dom.loginBtn.textContent = 'Signing In...';
      
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the UI update
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    } finally {
      dom.loginBtn.disabled = false;
      dom.loginBtn.textContent = 'Login';
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
          formality: 'Casual'
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

    Object.entries(quests).forEach(([questKey, quest]) => {
      const prerequisites = quest.prerequisites || [];
      const isLocked = !prerequisites.every(prereq => completedQuests.includes(prereq));
      const isCompleted = completedQuests.includes(questKey);

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
        questEl.addEventListener('click', () => startQuest(questKey));
      }
      
      dom.questList.appendChild(questEl);
    });
  }

  // Start a quest
  function startQuest(questKey) {
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

    const quest = quests[currentQuest];
    if (!quest) {
      console.error(`Quest not found: ${questKey}`);
      debugLog(`❌ Quest not found: ${questKey}`);
      return;
    }

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
    // Escape HTML to prevent XSS
    const escapeHtml = (str) => {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    };

    // Escape the entire text first
    let formatted = escapeHtml(text);

    // Pattern 1: "not X, Y" or "not X but Y" -> strikethrough X, show Y
    formatted = formatted.replace(/\bnot\s+([^,]+),\s*([^.!?]+)/gi, (match, incorrect, correct) => {
      return `not <span style="text-decoration: line-through; opacity: 0.6;">${incorrect.trim()}</span>, <strong>${correct.trim()}</strong>`;
    });

    formatted = formatted.replace(/\bnot\s+([^,]+)\s+but\s+([^.!?]+)/gi, (match, incorrect, correct) => {
      return `not <span style="text-decoration: line-through; opacity: 0.6;">${incorrect.trim()}</span> but <strong>${correct.trim()}</strong>`;
    });

    // Pattern 2: "*word" (asterisk correction pattern)
    formatted = formatted.replace(/\*(\w+)/g, (match, word) => {
      return `<strong style="color: #10b981;">*${word}</strong>`;
    });

    // Pattern 3: "You meant X" or "Did you mean X"
    formatted = formatted.replace(/(you meant|did you mean)\s+([^.!?,]+)/gi, (match, phrase, correction) => {
      return `${phrase} <strong style="color: #10b981;">${correction.trim()}</strong>`;
    });

    // Pattern 4: "Actually, it's X"
    formatted = formatted.replace(/actually,?\s+it'?s\s+([^.!?,]+)/gi, (match, correction) => {
      return `actually, it's <strong style="color: #10b981;">${correction.trim()}</strong>`;
    });

    // Pattern 5: "It's X, not Y" or "It's 'X', not 'Y'"
    formatted = formatted.replace(/it'?s\s+['"]?([^'",.!?]+)['"]?,?\s+not\s+['"]?([^'",.!?]+)['"]?/gi, (_match, correct, incorrect) => {
      return `it's <strong style="color: #10b981;">${correct.trim()}</strong>, not <span style="text-decoration: line-through; opacity: 0.6;">${incorrect.trim()}</span>`;
    });

    // Pattern 6: "(correct: X)" or "(correction: X)"
    formatted = formatted.replace(/\((correct|correction):\s*([^)]+)\)/gi, (_match, _label, correction) => {
      return `<strong style="color: #10b981; background: #d1fae5; padding: 2px 6px; border-radius: 4px;">${correction.trim()}</strong>`;
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
        objectivesContext += `\n\n🚨🚨🚨 STOP - QUEST ENDING NOW - DO NOT CONTINUE 🚨🚨🚨
ALL COMPLETION CRITERIA MET. This conversation MUST END with this response.

YOUR FINAL MESSAGE MUST:
1. Acknowledge their success (1 sentence)
2. Say goodbye with Spanish vocabulary (1 sentence)
3. END with "¡Bienvenido a ConvoQuest!" (Welcome to ConvoQuest!)

Example: "¡Excelente trabajo, Rick! (Excellent work!) You completed the misión (mission) perfectly. ¡Bienvenido a ConvoQuest! (Welcome to ConvoQuest!)"

🚫 ABSOLUTELY FORBIDDEN - DO NOT:
- Ask ANY follow-up questions
- Suggest new activities (markets, colors, shopping, etc.)
- Continue the conversation in ANY way
- Introduce new topics
- This is your FINAL message. Period. Full stop. Do not continue.`;
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
      if (stageCompleted && !farewellSent) {
        console.log('🎊 [Farewell] Stage completed, sending farewell and scheduling notification');
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
        console.log(`[Farewell Check] stageCompleted=${stageCompleted}, farewellSent=${farewellSent}`);
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
      dom.sendBtn.disabled = false;
      dom.sendBtn.textContent = 'Send';
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
        console.log(`✅ Objective completed: ${objective.description}`);
      }
    });
  }

  // Update objectives progress UI
  function updateObjectivesUI() {
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
      console.log('🎉 Stage completion criteria met!');
      console.log(`Messages: ${stageMessageCount}/${criteria.minMessages}, Objectives: ${completedObjectives.size}/${criteria.objectivesRequired}, Time: ${Math.floor(elapsedTimeSeconds)}s/${criteria.minDuration}s`);
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
    console.log('🎉 [showStageCompletionNotification] Called!');

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
        ${stage.reward?.clue ? `<div class="text-sm mt-2 italic bg-white/50 p-3 rounded-lg">"${stage.reward.clue}"</div>` : ''}
        ${stage.reward?.xp ? `<div class="text-lg mt-3 font-bold text-green-700">+${stage.reward.xp} XP earned! ⭐</div>` : ''}
        <button id="continue-after-stage-btn" class="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg text-base font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-md">
          Continue to Quest Selection
        </button>
      </div>
    `;

    console.log('📝 [showStageCompletionNotification] Notification created, appending to chat...');
    dom.chatContainer.appendChild(notification);
    dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;
    console.log('✅ [showStageCompletionNotification] Notification appended and scrolled to');

    // Add event listener to the continue button
    const continueBtn = document.getElementById('continue-after-stage-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        console.log('[ConvoQuest] User clicked continue button - returning to quest view');
        // Return to quest view
        dom.chatView.style.display = 'none';
        dom.questView.style.display = 'flex';

        // Re-render the quest list to show updated completion status
        renderQuests();

        // Show success message
        console.log('[ConvoQuest] Quest completed. Returned to quest selection.');
      });
    }
  }

  // Mark the onboarding quest as complete in Firestore
  async function completeOnboardingQuest() {
    if (!currentUser) return;
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

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        completedQuests: userSettings.completedQuests
      }, { merge: true });
      console.log(`[ConvoQuest] Quest '${questId}' marked as complete.`);
      
      // Re-render quests to reflect the change
      renderQuests();
      if (typeof window.updateUserProgress === 'function') {
        window.updateUserProgress({ completedQuests: userSettings.completedQuests });
      }

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
    if (dom.loginBtn) dom.loginBtn.addEventListener('click', handleLogin);
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
        }
      });
    }

    if (dom.sendBtn) dom.sendBtn.addEventListener('click', sendChatMessage);
    if (dom.chatInput) {
      dom.chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendChatMessage();
      });
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
    debugLog('✅ Placement event listeners set');

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
    debugLog('✅ Settings event listeners set');

    if (dom.saveSettingsBtn) {
      dom.saveSettingsBtn.addEventListener('click', async () => {
        if (currentUser) {
          userSettings.dialect = dom.dialectSelect.value;
          userSettings.formality = dom.formalitySelect.value;

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
    debugLog('✅ All event listeners set successfully');
  } catch (error) {
    debugLog(`❌ Error setting up event listeners: ${error.message}`);
    console.error('Event listener error:', error);
  }

  // Auth state listener
  debugLog('🔐 Setting up auth state listener...');
  debugLog(`Checking host for dev mode... hostname: ${window.location.hostname}`);
  // DEV MODE: Bypass Firebase Auth for local development ONLY
  // Only works on localhost - production/Vercel will require real authentication
  const isDevMode = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';

  if (isDevMode) {
    debugLog('[DEV MODE] Bypassing Firebase Auth. Using mock user.');
    currentUser = {
      uid: 'dev-user',
      displayName: 'Test User',
      email: 'test@example.com'
    };

    // Simulate a new user who has completed placement but not onboarding
    const mockUserData = {
      placementCompleted: true,
      onboardingQuestCompleted: false,
      completedQuests: []
    };

    // Setup the UI for the mock user
    if (dom.userDisplayName) {
      dom.userDisplayName.textContent = currentUser.displayName;
    }
    if (dom.welcomeMessage) {
      dom.welcomeMessage.textContent = `Welcome, ${currentUser.displayName}!`;
    }

    // Hide auth container and show main app
    if (dom.authContainer) {
      dom.authContainer.style.display = 'none';
      debugLog('✅ Auth container hidden');
    }

    // Directly call the logic that runs after user data is loaded
    if (typeof window.updateUserProgress === 'function') {
      window.updateUserProgress({ completedQuests: mockUserData.completedQuests });
    }

    if (!mockUserData.placementCompleted) {
      debugLog('[DEV MODE] Showing placement-view.');
      showView('placement-view');
    } else if (!mockUserData.onboardingQuestCompleted) {
      debugLog('[DEV MODE] Starting quest-zero-onboarding.');
      showView('main-app-view');
      if (dom.questView) dom.questView.style.display = 'none';
      if (dom.chatView) dom.chatView.style.display = 'flex';
      startQuest('quest-zero-onboarding');
    } else {
      debugLog('[DEV MODE] Showing main-app-view.');
      showView('main-app-view');
    }

  } else {
    debugLog('[PRODUCTION MODE] Using real Firebase Auth.');
    // PRODUCTION: Use real Firebase Auth
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

        // Show auth container when logged out
        if (dom.authContainer) {
          dom.authContainer.style.display = 'flex';
          dom.authContainer.classList.add('active');
          debugLog('✅ Auth container shown');
        }

        // Show login view
        showAuthView('login-view');
        debugLog('[PRODUCTION MODE] Login view shown.');
      }
    });
  }

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