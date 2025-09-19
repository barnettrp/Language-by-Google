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
    questList: document.getElementById('quest-list'),
    questView: document.getElementById('quest-view'),
    backToQuestsBtn: document.getElementById('back-to-quests-btn'),
    questTitle: document.getElementById('quest-title'),
    questObjective: document.getElementById('quest-objective'),
    questMapImage: document.getElementById('quest-map-image'),
    characterName: document.getElementById('character-name'),
    vignette: document.getElementById('vignette'),
    chatContainer: document.getElementById('chat-container'),
    chatInput: document.getElementById('chat-input'),
    sendBtn: document.getElementById('send-btn'),
    hintBtn: document.getElementById('hint-btn'),
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
    async callAPI(systemInstruction, contents) {
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemInstruction, contents })
        });

        if (!response.ok) {
          const errorBody = await response.json();
          console.error("API Error:", errorBody);
          return `Error: ${errorBody.error || 'Unknown API error'}`;
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
        return "Sorry, there was a network error. Please try again.";
      }
    },

    async sendMessage(text) {
      const systemInstruction = "You are a helpful Spanish language tutor.";
      const contents = [{ role: "user", parts: [{ text }] }];
      return this.callAPI(systemInstruction, contents);
    }
  };

  // Quest data structure
  const quests = {
    "missing-guitar": {
      title: "The Missing Guitar",
      objective: "A famous musician's guitar is missing. Find it before his show!",
      mapImage: "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?q=80&w=1887&auto=format&fit=crop",
      stages: {
        "1": {
          characterName: "Mateo, the Concierge",
          vignette_en: "You're in a hotel lobby. Your goal: Find out who the musician is and where he was last seen.",
          systemPrompt: "You are Mateo, a professional but worried hotel concierge in Bogotá.",
          reward: { clue: "Musician 'Carlos' was last seen at the plaza.", xp: 50 },
          nextStages: ["2a", "2b"],
          initialMessage: "Good morning. How can I help you today?"
        },
        "2a": {
          characterName: "Elena, the Vendor",
          vignette_en: "You arrive at the bustling plaza. Your goal: Ask her if she saw Carlos.",
          systemPrompt: "You are Elena, a chatty and knowledgeable street vendor.",
          reward: { clue: "Carlos was seen with a rival musician, Javier.", xp: 75 },
          nextStages: ["3"],
          initialMessage: "¡Hola! ¿Buscas algo bonito?"
        }
      }
    }
  };

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
        placementCompleted: false
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
        userSettings = userData.settings || { dialect: 'Mexico', formality: 'Casual' };
        
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
    Object.entries(quests).forEach(([questKey, quest]) => {
      const questEl = document.createElement('div');
      questEl.className = 'quest-card p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer';
      questEl.innerHTML = `
        <h3 class="text-lg font-semibold">${quest.title}</h3>
        <p class="text-gray-600 text-sm mt-1">${quest.objective}</p>
      `;
      questEl.addEventListener('click', () => startQuest(questKey));
      dom.questList.appendChild(questEl);
    });
  }

  // Start a quest
  function startQuest(questKey) {
    currentQuest = questKey;
    currentStage = "1";
    messages = [];
    
    const quest = quests[currentQuest];
    const stage = quest.stages[currentStage];
    
    dom.questTitle.textContent = quest.title;
    dom.questObjective.textContent = quest.objective;
    dom.questMapImage.src = quest.mapImage;
    dom.characterName.textContent = stage.characterName;
    dom.vignette.textContent = stage.vignette_en;
    
    dom.chatContainer.innerHTML = '';
    if (stage.initialMessage) {
      addMessage('npc', stage.initialMessage);
    }
    
    showView('quest-view');
  }

  // Add message to chat
  function addMessage(sender, text) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}-message p-3 rounded-lg mb-2 ${
      sender === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
    }`;
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

    try {
      const quest = quests[currentQuest];
      const stage = quest.stages[currentStage];
      const response = await AIManager.callAPI(stage.systemPrompt, [
        { role: "user", parts: [{ text: message }] }
      ]);
      
      addMessage('npc', response);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('npc', 'Sorry, I couldn\'t understand that. Could you try again?');
    } finally {
      dom.sendBtn.disabled = false;
      dom.sendBtn.textContent = 'Send';
    }
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
  
  dom.backToQuestsBtn.addEventListener('click', () => showView('main-app-view'));
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
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      dom.userDisplayName.textContent = user.displayName || 'User';
      
      // Load user data
      const userData = await loadUserData(user);
      
      // Check if placement test is needed
      if (!userData || !userData.placementCompleted) {
        showView('placement-view');
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

  // Initialize quest list
  renderQuests();
  
  console.log('[ConvoQuest] Application initialized successfully');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}