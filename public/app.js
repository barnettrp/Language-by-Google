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

  // TTS state
  let autoplayEnabled = true;
  let currentAudio = null;

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
    placementChatView: document.getElementById('placement-chat-view'),
    placementChatContainer: document.getElementById('placement-chat-container'),
    placementChatInput: document.getElementById('placement-chat-input'),
    placementSendBtn: document.getElementById('placement-send-btn'),
    retakePlacementBtn: document.getElementById('retake-placement-btn')
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
  function showView(viewId) {
    debugLog(`🔄 showView called with: ${viewId}`);
    document.querySelectorAll('.main-view').forEach(view => {
      view.style.display = view.id === viewId ? 'flex' : 'none';
    });
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
      // Skip onboarding quest from the main list
      if (questKey === 'quest-zero-onboarding') return;

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

    // Update objectives UI
    updateObjectivesUI();

    // Track quest start in dev mode
    if (typeof window.devTrackQuestStart === 'function') {
      window.devTrackQuestStart(questKey, currentStage);
    }

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
    messageEl.textContent = text;

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
        objectivesContext += `\n\nIMPORTANT: All objectives are complete! Send a warm, encouraging farewell message to the user. Thank them for their participation, wish them luck on their adventure, and use their name if you know it. Keep it brief (1-2 sentences) and in the spirit of your character. For example: "¡Muy bien, [name]! (Very good!) Your journey begins now. ¡Buena suerte, aventurero! (Good luck, adventurer!)" This is your FINAL message before they continue.`;
      }

      const response = await AIManager.callAPI(
        stage.systemPrompt + objectivesContext,
        conversationHistory
      );

      // If callAPI returned null (due to an error), stop processing
      if (response === null) return;

      addMessage('npc', response);

      // If this was the farewell message, mark it as sent and show completion
      if (stageCompleted && !farewellSent) {
        farewellSent = true;
        // Show completion notification after a delay to let user read farewell
        setTimeout(() => {
          showStageCompletionNotification();
        }, 4500);
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

    if (!stage.completionCriteria) return;

    const criteria = stage.completionCriteria;
    const minMessagesMet = stageMessageCount >= (criteria.minMessages || 0);
    const objectivesMet = completedObjectives.size >= (criteria.objectivesRequired || 0);

    if (minMessagesMet && objectivesMet && !stageCompleted) {
      console.log('🎉 Stage completion criteria met!');
      stageCompleted = true;
      // Don't show notification yet - let the AI send a farewell message first
    }
  }

  // Show stage completion notification
  function showStageCompletionNotification() {
    console.log('🎉 [showStageCompletionNotification] Called!');
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

    // Show hint after 5 messages if no progress on required objectives
    if (stageMessageCount >= 5) {
      stage.objectives.forEach(objective => {
        if (objective.required && !completedObjectives.has(objective.id)) {
          // Show first hint that hasn't been shown yet
          const hintKey = `${currentStage}-${objective.id}`;
          if (!shownHints.has(hintKey) && objective.hints && objective.hints.length > 0) {
            showHint(objective.hints[0]);
            shownHints.add(hintKey);
          }
        }
      });
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

        // Load user data
        const userData = await loadUserData(user);
        
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
          startQuest('quest-zero-onboarding');
        } else {
          debugLog('[PRODUCTION MODE] Showing main-app-view.');
          showView('main-app-view');
        }
        
      } else {
        currentUser = null;
        debugLog('[PRODUCTION MODE] Showing login-view.');
        showView('login-view');
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