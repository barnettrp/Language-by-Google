// app.js - Main application logic
import { auth, db, isFirebaseConfigured } from './firebase.js';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Initialize the application
export function initializeApp() {
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

  // DOM elements
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

  // Load quests from QUEST_DATABASE
  function getQuests() {
    if (typeof QUEST_DATABASE !== 'undefined' && QUEST_DATABASE.quests) {
      return QUEST_DATABASE.quests;
    }
    // Fallback to inline quest if QUEST_DATABASE not loaded
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

  // Utility functions
  function showView(viewId) {
    document.querySelectorAll('.main-view').forEach(view => {
      view.style.display = view.id === viewId ? 'flex' : 'none';
    });
  }

  // Authentication functions
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

      const questEl = document.createElement('div');
      questEl.className = `quest-card p-4 bg-white rounded-lg shadow transition-all ${
        isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
      }`;
      
      questEl.innerHTML = `
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-semibold ${isLocked ? 'text-gray-500' : ''}">${quest.title}</h3>
          ${isCompleted ? '<span class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completed</span>' : ''}
          ${isLocked ? '<span class="text-2xl">🔒</span>' : ''}
        </div>
        <p class="text-gray-600 text-sm mt-1">${quest.objective}</p>
        ${isLocked ? `<p class="text-xs text-red-500 mt-2">Requires completion of: ${prerequisites.join(', ')}</p>` : ''}
      `;

      if (!isLocked) {
        questEl.addEventListener('click', () => startQuest(questKey));
      }
      
      dom.questList.appendChild(questEl);
    });
  }

  // Start a quest
  function startQuest(questKey) {
    currentQuest = questKey;
    currentStage = "1";
    messages = [];

    // Reset objective tracking
    stageMessageCount = 0;
    completedObjectives.clear();
    shownHints.clear();

    const quest = quests[currentQuest];
    const stage = quest.stages[currentStage];

    // Set all quest information
    dom.chatTitle.textContent = quest.title;
    dom.questTitle.textContent = quest.title;
    dom.questObjective.textContent = quest.objective;
    dom.questMapImage.src = quest.mapImage || quest.thumbnailImage || '';
    dom.characterName.textContent = stage.characterName;

    // Handle vignette (support both old and new format)
    const vignetteText = stage.vignette?.en || stage.vignette_en || '';
    dom.vignette.textContent = vignetteText;

    dom.chatContainer.innerHTML = '';
    if (stage.initialMessage) {
      addMessage('npc', stage.initialMessage);
    }

    // Update objectives UI
    updateObjectivesUI();

    // Track quest start in dev mode
    if (typeof window.devTrackQuestStart === 'function') {
      window.devTrackQuestStart(questKey, currentStage);
    }

    // Show chat view
    dom.questView.style.display = 'none';
    dom.chatView.style.display = 'flex';
  }

  // Add message to chat
  function addMessage(sender, text) {
    const messageEl = document.createElement('div');
    let senderClass = 'npc-message';
    let bgClass = 'bg-gray-100 mr-8';
    if (sender === 'user') {
      senderClass = 'user-message';
      bgClass = 'bg-blue-100 ml-8';
    } else if (sender === 'system') {
      senderClass = 'system-message';
      bgClass = 'bg-red-100 text-red-800 text-sm mx-auto';
    }
    
    messageEl.className = `message ${senderClass} p-3 rounded-lg mb-2 ${bgClass}`;
    messageEl.textContent = text;
    dom.chatContainer.appendChild(messageEl);
    dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;
  }

  // Send chat message
  async function sendChatMessage() {
    const message = dom.chatInput.value.trim();
    if (!message) return;

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
      const response = await AIManager.callAPI(stage.systemPrompt, [
        { role: "user", parts: [{ text: message }] }
      ]);

      // If callAPI returned null (due to an error), stop processing
      if (response === null) return;

      addMessage('npc', response);

      // Update UI after response
      updateObjectivesUI();

      // Check if stage is complete
      checkStageCompletion();

      // Show hints if needed
      checkAndShowHints();

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

    if (minMessagesMet && objectivesMet) {
      console.log('🎉 Stage completion criteria met!');
      // TODO: Show completion notification and allow progression
      showStageCompletionNotification();
    }
  }

  // Show stage completion notification
  function showStageCompletionNotification() {
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
    notification.className = 'p-4 bg-green-100 border border-green-400 text-green-800 rounded-lg mb-2 animate-pulse';
    notification.innerHTML = `
      <div class="font-semibold">✅ Stage Complete!</div>
      <div class="text-sm mt-1">You've completed all objectives for this stage.</div>
      ${stage.reward?.clue ? `<div class="text-sm mt-2 italic">"${stage.reward.clue}"</div>` : ''}
    `;

    dom.chatContainer.appendChild(notification);
    dom.chatContainer.scrollTop = dom.chatContainer.scrollHeight;

    // TODO: Add button to proceed to next stage
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
  dom.showSignupBtn.addEventListener('click', () => showView('signup-view'));
  dom.showLoginBtn.addEventListener('click', () => showView('login-view'));
  dom.loginBtn.addEventListener('click', handleLogin);
  dom.signupBtn.addEventListener('click', handleSignup);
  dom.logoutBtn.addEventListener('click', handleLogout);
  
  dom.backToQuestsBtn.addEventListener('click', () => {
    dom.chatView.style.display = 'none';
    dom.questView.style.display = 'flex';
  });
  dom.sendBtn.addEventListener('click', sendChatMessage);
  dom.chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendChatMessage();
  });
  
  dom.placementSendBtn.addEventListener('click', handlePlacementSend);
  dom.placementChatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') handlePlacementSend();
  });

  // Settings modal
  dom.settingsBtn.addEventListener('click', () => {
    dom.settingsModal.classList.remove('hidden');
  });
  
  dom.closeSettingsBtn.addEventListener('click', () => {
    dom.settingsModal.classList.add('hidden');
  });

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

  // Auth state listener
  
  // DEV MODE: Bypass Firebase Auth for local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.warn('[DEV MODE] Bypassing Firebase Auth. Using mock user.');
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
    dom.userDisplayName.textContent = currentUser.displayName;
    dom.authContainer.style.display = 'none';
    document.querySelector('.main-content').style.display = 'block';
    
    // Directly call the logic that runs after user data is loaded
    if (typeof window.updateUserProgress === 'function') {
      window.updateUserProgress({ completedQuests: mockUserData.completedQuests });
    }
    
    if (!mockUserData.placementCompleted) {
      showView('placement-view');
    } else if (!mockUserData.onboardingQuestCompleted) {
      startQuest('quest-zero-onboarding');
    } else {
      showView('main-app-view');
    }

  } else {
    // PRODUCTION: Use real Firebase Auth
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = user;
        dom.userDisplayName.textContent = user.displayName || 'User';
        
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
          showView('placement-view');
        } else if (!userData.onboardingQuestCompleted) {
          // If placement is done but onboarding is not, start Quest Zero
          startQuest('quest-zero-onboarding');
        } else {
          showView('main-app-view');
        }
        
        dom.authContainer.style.display = 'none';
        document.querySelector('.main-content').style.display = 'block';
      } else {
        currentUser = null;
        dom.authContainer.style.display = 'flex';
        document.querySelector('.main-content').style.display = 'none';
        showView('login-view');
      }
    });
  }

  // Initialize quest list
  renderQuests();

  // Initialize quest map
  if (typeof window.initializeQuestMap === 'function') {
    window.initializeQuestMap();
    console.log('[ConvoQuest] Quest map initialized');
  }

  // Expose functions for quest map
  window.startQuest = startQuest;
  window.showQuestList = () => showView('main-app-view');

  console.log('[ConvoQuest] Application initialized successfully');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}