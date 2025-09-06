/* =========================================================================
   ConvoQuest — Frontend App (moved from inline <script> to /public/app.js)
   Requirements:
     - Load *after* /firebase-init.js
     - Backend endpoint at /api/gemini (your api/gemini.js)
   ========================================================================= */

(function bootstrapGuards() {
  // Light, on-screen status (optional). Safe if missing.
  const setRibbon = (msg) => {
    const el = document.getElementById('debug-ribbon');
    if (el) el.textContent = msg;
  };
  window.__setRibbon = setRibbon;
  setRibbon && setRibbon('JS: starting');

  // Guard: Firebase init must be present (set by firebase-init.js)
  if (!window.firebaseInstances || !window.firebaseFunctions) {
    console.error('[ConvoQuest] Firebase modules did not load.');
    setRibbon && setRibbon('JS: Firebase failed to load');
    // Avoid alert loops on strict CSP environments; show inline message:
    const warn = document.createElement('div');
    warn.textContent = 'Critical error: Firebase failed to load.';
    warn.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#531;color:#fff;padding:8px;z-index:2147483647;font:12px/1.3 system-ui';
    document.body.appendChild(warn);
    return;
  }
  setRibbon && setRibbon('JS: Firebase loaded');
})();

/* ------------------------- Firebase handles ------------------------- */
const { auth, db } = window.firebaseInstances;
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  doc, setDoc, getDoc, serverTimestamp, updateDoc, increment
} = window.firebaseFunctions;

/* ----------------------------- State -------------------------------- */
let currentUser = null;
let userSettings = {
  dialect: 'Mexico',
  formality: 'Casual',
  vignetteLanguage: 'English',
  xp: 0,
  completedStages: {}
};
let signupName = '';
let isListening = false;

let currentQuest = null;
let currentStage = null;
let messages = [];
let placementMessages = [];

/* --------------------------- DOM Queries ---------------------------- */
// Auth / main
const authContainer = document.getElementById('auth-container');
const mainAppView = document.getElementById('main-app-view');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const loginEmailInput = document.getElementById('login-email-input');
const loginPasswordInput = document.getElementById('login-password-input');
const loginBtn = document.getElementById('login-btn');
const showSignupBtn = document.getElementById('show-signup-btn');
const loginError = document.getElementById('login-error');
const signupNameInput = document.getElementById('signup-name-input');
const signupEmailInput = document.getElementById('signup-email-input');
const signupPasswordInput = document.getElementById('signup-password-input');
const signupConfirmPasswordInput = document.getElementById('signup-confirm-password-input');
const signupBtn = document.getElementById('signup-btn');
const showLoginBtn = document.getElementById('show-login-btn');
const signupError = document.getElementById('signup-error');
const logoutBtn = document.getElementById('logout-btn');
const welcomeMessage = document.getElementById('welcome-message');

// App views
const questView = document.getElementById('quest-view');
const chatView = document.getElementById('chat-view');
const chatContainer = document.getElementById('chat-container');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const dialectSelect = document.getElementById('dialect-select');
const formalitySelect = document.getElementById('formality-select');
const vignetteLangSelect = document.getElementById('vignette-lang-select');

const micBtn = document.getElementById('mic-btn');
const reportModal = document.getElementById('report-modal');
const closeReportBtn = document.getElementById('close-report-btn');
const endSessionBtn = document.getElementById('end-session-btn');
const translationPopover = document.getElementById('translation-popover');
const vignetteModal = document.getElementById('vignette-modal');
const vignetteTitle = document.getElementById('vignette-title');
const vignetteText = document.getElementById('vignette-text');
const startStageBtn = document.getElementById('start-stage-btn');
const mapModal = document.getElementById('map-modal');
const mapTitle = document.getElementById('map-title');
const mapObjective = document.getElementById('map-objective');
const mapContainer = document.getElementById('map-container');
const stageCompleteModal = document.getElementById('stage-complete-modal');
const clueText = document.getElementById('clue-text');
const xpGainText = document.getElementById('xp-gain-text');
const continueQuestBtn = document.getElementById('continue-quest-btn');
const hintBtn = document.getElementById('hint-btn');
const hintPopover = document.getElementById('hint-popover');
const correctionModal = document.getElementById('correction-modal');
const closeCorrectionBtn = document.getElementById('close-correction-btn');
const originalSentenceEl = document.getElementById('original-sentence');
const correctedSentenceEl = document.getElementById('corrected-sentence');
const explanationContainer = document.getElementById('explanation-container');
const explanationText = document.getElementById('explanation-text');
const explainRuleBtn = document.getElementById('explain-rule-btn');
const correctionLoading = document.getElementById('correction-loading');

// Placement
const placementView = document.getElementById('placement-view');
const placementQuizView = document.getElementById('placement-quiz-view');
const submitQuizBtn = document.getElementById('submit-quiz-btn');
const placementChatView = document.getElementById('placement-chat-view');
const placementChatContainer = document.getElementById('placement-chat-container');
const placementChatInput = document.getElementById('placement-chat-input');
const placementSendBtn = document.getElementById('placement-send-btn');
const retakePlacementBtn = document.getElementById('retake-placement-btn');

/* ------------------------ Utilities / Speech ------------------------ */
const translationCache = new Map();
const localDictionary = {
  "hola": "hello","adiós": "goodbye","gracias": "thank you","por": "for/by","favor": "please","sí": "yes","no": "no",
  "qué": "what","cómo": "how","dónde": "where","quién": "who","cuándo": "when","yo": "I","tú": "you",
  "él": "he","ella": "she","nosotros": "we","ellos": "they","ellas": "they","estoy": "I am","estás": "you are",
  "es": "is","somos": "we are","son": "are","ser": "to be","estar": "to be","tengo": "I have","tienes": "you have",
  "tiene": "has","tenemos": "we have","tienen": "have","tener": "to have","quiero": "I want","quieres": "you want",
  "quiere": "wants","queremos": "we want","quieren": "want","querer": "to want","un": "a/an","una": "a/an",
  "el": "the","la": "the","los": "the","las": "the","a": "to/at","de": "of/from","en": "in/on","con": "with",
  "sin": "without","buenos": "good","días": "days","tardes": "afternoons","noches": "nights","nombre": "name",
  "mi": "my","me": "me","llamo": "I call myself","y": "and","o": "or","pero": "but","porque": "because",
  "café": "coffee","agua": "water","comida": "food","cuenta": "bill","hotel": "hotel","aeropuerto": "airport",
  "calle": "street","plaza": "plaza","amigo": "friend","amiga": "friend","familia": "family","ayuda": "help",
  "bien": "well","mal": "bad","mucho": "a lot","poco": "a little","ahora": "now","hoy": "today","mañana": "tomorrow",
  "siempre": "always","necesito": "I need","puedo": "I can","voy": "I go","hay": "there is/are"
};

// Speech API (browser)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.onstart = () => { isListening = true; micBtn?.classList.add('mic-active'); };
  recognition.onresult = (event) => { if (chatInput) chatInput.value = event.results[0][0].transcript; };
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    alert(`Speech recognition error: ${event.error}. Please ensure microphone access is allowed.`);
  };
  recognition.onend = () => { isListening = false; micBtn?.classList.remove('mic-active'); };
}

const speak = (textToSpeak) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Sorry, your browser doesn't support text-to-speech.");
  }
};

/* ----------------------------- AIManager ---------------------------- */
const AIManager = {
  async callAPI(payload) {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        return { error: result.error || 'Sorry, an unknown error occurred.' };
      }
      return result;
    } catch (error) {
      return { error: "Sorry, I couldn't connect to the server." };
    }
  },
  async getResponse(history, stage, settings) {
    const mappedHistory = history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: m.parts }));
    const payload = { type: 'chat', history: mappedHistory, stage, settings };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async validateObjective(transcript, validationPrompt) {
    const payload = { type: 'validation', transcript, validationPrompt };
    const response = await this.callAPI(payload);
    return response.text || 'NO';
  },
  async getCorrection(text) {
    const payload = { type: 'correction', text };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async analyzeConversation(transcript) {
    const payload = { type: 'analysis', transcript };
    const response = await this.callAPI(payload);
    return response.data || { error: response.error };
  },
  async getTranslation(word, context) {
    const payload = { type: 'translation', word, context };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async getHint(history, stage) {
    const mappedHistory = history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: m.parts }));
    const payload = { type: 'hint', history: mappedHistory, stage };
    const response = await this.callAPI(payload);
    return response.text || 'Try asking a question.';
  },
  async getGrammarExplanation(original, corrected) {
    const payload = { type: 'grammar', original, corrected };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async getPlacementResponse(history) {
    const mappedHistory = history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: m.parts }));
    const payload = { type: 'placement', history: mappedHistory };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async analyzePlacement(transcript) {
    const payload = { type: 'placement-analysis', transcript };
    const response = await this.callAPI(payload);
    return response.text || 'A1';
  }
};

/* ----------------------------- Quests ------------------------------- */
const quests = {
  "missing-guitar": {
    title: "The Missing Guitar",
    objective: "A famous musician's guitar is missing. Find it before his show!",
    mapImage: "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?q=80&w=1887&auto=format&fit=crop",
    stages: {
      "1": {
        characterName: "Mateo, the Concierge",
        vignette_en: "You're in a hotel lobby. The concierge, Mateo, looks worried. Your goal: Find out who the musician is and where he was last seen.",
        vignette_es: "Estás en el vestíbulo de un hotel. El conserje, Mateo, parece preocupado. Tu objetivo: Averiguar quién es el músico y dónde fue visto por última vez.",
        systemPrompt: "You are Mateo, a professional but worried hotel concierge in Bogotá.",
        validationPrompt: "Did the user find out the musician's name is 'Carlos' and he was last seen at the 'plaza'?",
        reward: { clue: "Musician 'Carlos' was last seen at the plaza.", xp: 50 },
        nextStages: ["2a", "2b"],
        initialMessage: "Good morning. How can I help you today?"
      },
      "2a": {
        characterName: "Elena, the Vendor",
        vignette_en: "You arrive at the bustling plaza. A street vendor, Elena, seems to know everyone. Your goal: Ask her if she saw Carlos.",
        vignette_es: "Llegas a la bulliciosa plaza. Una vendedora ambulante, Elena, parece conocer a todo el mundo. Tu objetivo: Pregúntale si vio a Carlos.",
        systemPrompt: "You are Elena, a chatty and knowledgeable street vendor in a plaza.",
        validationPrompt: "Did the user learn that Carlos was talking to another musician named Javier?",
        reward: { clue: "Carlos was seen with a rival musician, Javier.", xp: 75 },
        nextStages: ["3"],
        initialMessage: "¡Hola! ¿Buscas algo bonito?"
      },
      "2b": {
        characterName: "A Lost Tourist",
        vignette_en: "You see a tourist taking photos. They look lost. Your goal: Ask them if they saw anything unusual.",
        vignette_es: "Ves a un turista tomando fotos. Parece perdido. Tu objetivo: Pregúntale si vio algo inusual.",
        systemPrompt: "You are a lost tourist who speaks very little Spanish and saw nothing useful.",
        validationPrompt: "Did the user learn that you saw nothing useful?",
        reward: { clue: "The tourist saw nothing. This is a dead end.", xp: 10 },
        nextStages: ["2a"],
        initialMessage: "Uh... hello? Do you speak English?"
      },
      "3": {
        characterName: "Javier, the Rival",
        vignette_en: "You find Javier in an alley. He looks nervous. Your goal: Convince him to return the guitar.",
        vignette_es: "Encuentras a Javier en un callejón. Parece nervioso. Tu objetivo: Convencerlo de que devuelva la guitarra.",
        systemPrompt: "You are Javier, a jealous rival musician. You 'borrowed' the guitar but won't admit it easily.",
        validationPrompt: "Did the user successfully convince you to return the guitar?",
        reward: { clue: "You convinced Javier! The guitar is safe.", xp: 100 },
        nextStages: [],
        initialMessage: "¿Qué quieres? Estoy ocupado."
      }
    }
  }
};

/* --------------------------- View helpers --------------------------- */
const renderQuests = () => {
  const list = questView?.querySelector('.space-y-3');
  if (!list) return;
  list.innerHTML = Object.keys(quests).map(questId => {
    const q = quests[questId];
    return `<div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer quest-card" data-quest-id="${questId}">
              <h3 class="font-semibold">${q.title}</h3>
              <p class="text-sm text-gray-600">${q.objective}</p>
            </div>`;
  }).join('');
};

const showMapView = (questId) => {
  currentQuest = { ...quests[questId], id: questId };
  mapTitle.textContent = currentQuest.title;
  mapObjective.textContent = currentQuest.objective;
  document.getElementById('map-image').src = currentQuest.mapImage;

  mapContainer.querySelectorAll('.map-location').forEach(el => el.remove());

  const nextStageIds = currentStage ? currentStage.nextStages : ["1"];
  nextStageIds.forEach((stageId, index) => {
    const location = document.createElement('div');
    location.className = 'map-location absolute p-2 bg-white/80 rounded-full shadow-lg';
    location.style.left = `${20 + index * 40}%`;
    location.style.top = `${40 + (index % 2 * 15)}%`;
    location.innerHTML = `<span>📍</span>`;
    location.dataset.questId = questId;
    location.dataset.stageId = stageId;
    mapContainer.appendChild(location);
  });

  mapModal.classList.remove('hidden');
};

const showVignette = (questId, stageId) => {
  currentQuest = { ...quests[questId], id: questId };
  currentStage = { ...currentQuest.stages[stageId], id: stageId, questId: questId };
  vignetteTitle.textContent = currentStage.characterName;
  vignetteText.textContent = userSettings.vignetteLanguage === 'Spanish' ? currentStage.vignette_es : currentStage.vignette_en;
  vignetteModal.classList.remove('hidden');
};

const startStage = () => {
  if (!currentStage) return;
  messages = [];
  chatView.querySelector('#chat-title').textContent = currentStage.characterName;
  chatView.querySelector('#chat-description').textContent = currentStage.vignette_en.split('.')[1] || '';
  addMessage(currentStage.initialMessage, 'ai');
  vignetteModal.classList.add('hidden');
  questView.style.display = 'none';
  chatView.classList.remove('hidden');
  chatView.classList.add('flex');
};

const addMessage = (text, role) => {
  messages.push({ role, parts: [{ text }] });
  const isUser = role === 'user';
  const wrapper = document.createElement('div');
  wrapper.className = `w-full flex flex-col ${isUser ? 'items-end' : 'items-start'}`;
  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.className = `chat-bubble p-3 rounded-lg w-fit ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`;

  // make each word clickable for translation
  text.split(' ').forEach(word => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'clickable-word cursor-pointer hover:underline';
    wordSpan.textContent = word + ' ';
    bubbleWrapper.appendChild(wordSpan);
  });

  wrapper.appendChild(bubbleWrapper);
  if (isUser) {
    wrapper.innerHTML += `<button title="Correct me" class="correction-btn text-xs text-gray-500 hover:text-blue-500 mt-1 mr-1">Correct me ✨</button>`;
  } else {
    wrapper.innerHTML += `<button title="Read aloud" class="read-aloud-btn text-xs text-gray-500 hover:text-blue-500 mt-1 ml-1">Read Aloud 🔊</button>`;
  }
  chatContainer.insertBefore(wrapper, chatContainer.firstChild);
};

const addTypingIndicator = () => {
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'flex justify-start';
  indicator.innerHTML = `<div class="chat-bubble-ai p-3 rounded-lg w-fit flex items-center gap-1.5">
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: .2s;"></span>
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: .4s;"></span>
    </div>`;
  chatContainer.insertBefore(indicator, chatContainer.firstChild);
};
const removeTypingIndicator = () => document.getElementById('typing-indicator')?.remove();

const handleSendMessage = async () => {
  const userInput = chatInput.value.trim();
  if (!userInput) return;
  addMessage(userInput, 'user');
  chatInput.value = '';
  addTypingIndicator();
  const response = await AIManager.getResponse(messages.slice(-6), currentStage, userSettings);
  removeTypingIndicator();
  addMessage(response, 'ai');
};

const endStage = async () => {
  const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.parts[0].text}`).join('\n');
  const result = await AIManager.validateObjective(transcript, currentStage.validationPrompt);

  if (result.trim().toUpperCase() === 'YES') {
    const stageKey = `${currentStage.questId}-${currentStage.id}`;
    if (!userSettings.completedStages[stageKey]) {
      clueText.textContent = currentStage.reward.clue;
      xpGainText.textContent = `+${currentStage.reward.xp} XP`;
      userSettings.xp += currentStage.reward.xp;
      userSettings.completedStages[stageKey] = true;
      await saveUserSettings(currentUser.uid, { xp: increment(currentStage.reward.xp), completedStages: userSettings.completedStages });
      stageCompleteModal.classList.remove('hidden');
    } else {
      chatView.classList.add('hidden');
      questView.style.display = 'flex';
      showMapView(currentStage.questId);
    }
  } else {
    alert('Objective not met. Try asking again in a different way.');
  }
};

const showHint = async () => {
  hintBtn.disabled = true;
  hintPopover.querySelector('p').textContent = 'Getting hint...';
  hintPopover.classList.remove('hidden');

  const hint = await AIManager.getHint(messages.slice(-6), currentStage);
  hintPopover.querySelector('p').textContent = hint;
  hintBtn.disabled = false;
};

/* --------------------------- Placement Chat ------------------------- */
const addPlacementMessage = (text, role) => {
  placementMessages.push({ role, parts: [{ text }] });
  const isUser = role === 'user';
  const wrapper = document.createElement('div');
  wrapper.className = `w-full flex flex-col ${isUser ? 'items-end' : 'items-start'}`;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble p-3 rounded-lg w-fit ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`;
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  placementChatContainer.insertBefore(wrapper, placementChatContainer.firstChild);
};

const handlePlacementSend = async () => {
  const userInput = placementChatInput.value.trim();
  if (!userInput) return;
  addPlacementMessage(userInput, 'user');
  placementChatInput.value = '';

  if (placementMessages.length >= 4) {
    addPlacementMessage('¡Gracias! Analizando tu nivel...', 'ai');
    const transcript = placementMessages.map(m => `${m.role}: ${m.parts[0].text}`).join('\n');
    const level = await AIManager.analyzePlacement(transcript);
    await saveUserSettings(currentUser.uid, { proficiencyLevel: level });
    userSettings.proficiencyLevel = level;
    alert(`Great, we've placed you at level: ${level}. Let's get started!`);
    showMainApp();
  } else {
    const response = await AIManager.getPlacementResponse(placementMessages);
    addPlacementMessage(response, 'ai');
  }
};

/* -------------------------- Settings & Save ------------------------- */
const saveUserSettings = async (userId, settings) => {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, settings);
};

const updateSetting = (key, value) => {
  userSettings[key] = value;
  if (currentUser) saveUserSettings(currentUser.uid, { [key]: value });
};

const setupNewUser = async (user) => {
  await updateProfile(user, { displayName: signupName });
  const userDocRef = doc(db, 'users', user.uid);
  const initialSettings = {
    name: signupName, email: user.email, createdAt: serverTimestamp(),
    dialect: 'Mexico', formality: 'Casual', vignetteLanguage: 'English',
    xp: 0, completedStages: {}
  };
  await setDoc(userDocRef, initialSettings);
  signupName = '';
  return initialSettings;
};

const loadUserSettings = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists() && snap.data()) {
      userSettings = { ...userSettings, ...snap.data() };
    } else {
      console.log('No user document found, creating one for existing user.');
      const initialSettings = {
        name: currentUser.displayName, email: currentUser.email, createdAt: serverTimestamp(),
        dialect: 'Mexico', formality: 'Casual', vignetteLanguage: 'English', xp: 0, completedStages: {}
      };
      await setDoc(userDocRef, initialSettings);
      userSettings = { ...userSettings, ...initialSettings };
    }
    if (dialectSelect) dialectSelect.value = userSettings.dialect;
    if (formalitySelect) formalitySelect.value = userSettings.formality;
    if (vignetteLangSelect) vignetteLangSelect.value = userSettings.vignetteLanguage;
  } catch (error) {
    console.error('Error loading user settings:', error);
  }
};

/* ---------------------------- Auth Wiring --------------------------- */
// Login
loginBtn?.addEventListener('click', async () => {
  window.__setRibbon && window.__setRibbon('Click: Login button');
  console.log('[ConvoQuest] Login button clicked');

  loginError.textContent = '';
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();
  if (!email || !password) { loginError.textContent = 'Please enter an email and password.'; return; }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log('[ConvoQuest] signInWithEmailAndPassword resolved');
    window.__setRibbon && window.__setRibbon('Auth: success');
  } catch (error) {
    console.error('[ConvoQuest] Login error:', error);
    window.__setRibbon && window.__setRibbon('Auth: error ' + (error?.code || 'unknown'));
    const map = {
      'auth/invalid-email': 'That email looks invalid.',
      'auth/user-disabled': 'This account is disabled.',
      'auth/user-not-found': 'No account with that email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/operation-not-allowed': 'Email/password sign-in is not enabled.'
    };
    const code = error?.code || '';
    loginError.textContent = map[code] || (error?.message || 'Login failed.');
  }
});

// Signup
signupBtn?.addEventListener('click', async () => {
  signupError.textContent = '';
  const name = signupNameInput.value.trim();
  const email = signupEmailInput.value.trim();
  const password = signupPasswordInput.value.trim();
  const confirmPassword = signupConfirmPasswordInput.value.trim();
  if (!name || !email || !password || !confirmPassword) { signupError.textContent = 'Please fill out all fields.'; return; }
  if (password.length < 6) { signupError.textContent = 'Password must be at least 6 characters.'; return; }
  if (password !== confirmPassword) { signupError.textContent = 'Passwords do not match.'; return; }
  signupName = name;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    signupError.textContent = error.message;
    signupName = '';
  }
});

// Show/hide auth screens
showSignupBtn?.addEventListener('click', () => { loginView.classList.add('hidden'); signupView.classList.remove('hidden'); });
showLoginBtn?.addEventListener('click',  () => { signupView.classList.add('hidden'); loginView.classList.remove('hidden'); });

// Logout
logoutBtn?.addEventListener('click', () => signOut(auth));

/* ------------------------- Auth State Change ------------------------ */
const startPlacementTest = () => {
  placementMessages = [];
  const checked = document.querySelector('input[name="quiz"]:checked');
  if (checked) checked.checked = false;

  authContainer.style.display = 'none';
  mainAppView.classList.add('hidden');
  settingsModal.classList.add('hidden');
  placementView.classList.remove('hidden');
  placementView.classList.add('flex');
  placementQuizView.classList.remove('hidden');
  placementQuizView.classList.add('flex');
  placementChatView.classList.add('hidden');
  placementChatView.classList.remove('flex');
};

const showMainApp = () => {
  welcomeMessage.textContent = `Welcome, ${currentUser?.displayName || userSettings.name || 'Friend'}!`;
  authContainer.style.display = 'none';
  placementView.classList.add('hidden');
  mainAppView.classList.remove('hidden');
  mainAppView.classList.add('flex');
  questView.style.display = 'flex';
  chatView.classList.add('hidden');
  chatView.classList.remove('flex');
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    try {
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
      if (isNewUser && signupName) {
        userSettings = await setupNewUser(user);
      }
      await loadUserSettings(user.uid);

      if (!userSettings.proficiencyLevel) {
        startPlacementTest();
      } else {
        showMainApp();
      }
    } catch (error) {
      console.error('CRITICAL ERROR during user setup/load:', error);
      alert('A critical error occurred while loading your profile. Please check the console for details.');
      showMainApp();
    }
  } else {
    currentUser = null;
    authContainer.style.display = 'flex';
    placementView.classList.add('hidden');
    signupView?.classList.add('hidden');
    loginView?.classList.remove('hidden');
    mainAppView.classList.add('hidden');
    mainAppView.classList.remove('flex');
  }
});

/* --------------------------- Settings UI ---------------------------- */
settingsBtn?.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettingsBtn?.addEventListener('click', () => settingsModal.classList.add('hidden'));
retakePlacementBtn?.addEventListener('click', startPlacementTest);
vignetteLangSelect?.addEventListener('change', e => updateSetting('vignetteLanguage', e.target.value));
dialectSelect?.addEventListener('change', e => updateSetting('dialect', e.target.value));
formalitySelect?.addEventListener('change', e => updateSetting('formality', e.target.value));

/* ----------------------------- Chat UI ------------------------------ */
sendBtn?.addEventListener('click', handleSendMessage);
chatInput?.addEventListener('keypress', (e) => e.key === 'Enter' && handleSendMessage());

micBtn?.addEventListener('click', () => {
  if (!recognition) return alert("Sorry, your browser doesn't support speech recognition.");
  if (isListening) { recognition.stop(); return; }
  try { recognition.start(); }
  catch (e) {
    console.error('Could not start recognition:', e);
    alert('Could not start speech recognition. Please check permissions.');
  }
});

chatContainer?.addEventListener('click', async (e) => {
  const target = e.target;

  if (target.classList.contains('read-aloud-btn')) {
    const bubble = target.closest('.flex-col').querySelector('.chat-bubble');
    if (bubble) speak(bubble.textContent.trim());
  }

  if (target.classList.contains('correction-btn')) {
    const bubble = target.closest('.flex-col').querySelector('.chat-bubble');
    if (bubble) showCorrectionModal(bubble.textContent.trim());
  }

  if (target.classList.contains('clickable-word')) {
    const word = target.textContent.trim().replace(/[.,¡!¿?]/g, '').toLowerCase();
    if (!word) return;

    const showTranslation = (translationText) => {
      translationPopover.innerHTML = translationText;
      const containerRect = document.getElementById('app-container').getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const popRect = translationPopover.getBoundingClientRect();
      let left = rect.left - containerRect.left + (rect.width / 2) - (popRect.width / 2);
      let top = rect.top - containerRect.top - popRect.height - 8;
      if (left < 8) left = 8;
      if (left + popRect.width > containerRect.width - 8) {
        left = containerRect.width - popRect.width - 8;
      }
      if (top < 8) top = rect.bottom - containerRect.top + 8;
      translationPopover.style.left = `${left}px`;
      translationPopover.style.top = `${top}px`;
      translationPopover.classList.remove('hidden');
    };

    if (translationCache.has(word)) {
      showTranslation(translationCache.get(word));
    } else if (localDictionary[word]) {
      const translation = localDictionary[word];
      translationCache.set(word, translation);
      showTranslation(translation);
    } else {
      showTranslation('Translating...');
      const context = target.parentElement.textContent.trim();
      const apiTranslation = await AIManager.getTranslation(word, context);
      const formatted = apiTranslation ? apiTranslation.replace(/\n/g, '<br>') : 'Not found.';
      translationCache.set(word, formatted);
      showTranslation(formatted);
    }
  }
});

hintBtn?.addEventListener('click', showHint);
hintPopover?.addEventListener('click', () => {
  const hintText = hintPopover.querySelector('p')?.textContent;
  if (hintText && hintText !== 'Getting hint...') {
    chatInput.value = hintText;
    hintPopover.classList.add('hidden');
    chatInput.focus();
  }
});

document.body.addEventListener('click', (e) => {
  if (!e.target.classList.contains('clickable-word') && !e.target.closest('#hint-btn')) {
    translationPopover?.classList.add('hidden');
    hintPopover?.classList.add('hidden');
  }
}, true);

/* ------------------------- Correction modal ------------------------- */
const showCorrectionModal = async (originalText) => {
  correctionModal.classList.remove('hidden');
  correctionLoading.classList.remove('hidden');
  document.getElementById('correction-content').classList.add('hidden');
  explanationContainer.classList.add('hidden');
  explainRuleBtn.classList.remove('hidden');
  explainRuleBtn.textContent = 'Explain this rule 💡';

  const correctionText = await AIManager.getCorrection(originalText);

  correctionLoading.classList.add('hidden');
  document.getElementById('correction-content').classList.remove('hidden');

  if (typeof correctionText === 'string' && correctionText.includes('Corrected:')) {
    const parts = correctionText.split('\n');
    const corrected = parts[0].replace('Corrected: ', '').trim();
    originalSentenceEl.textContent = `"${originalText}"`;
    correctedSentenceEl.textContent = `"${corrected}"`;
  } else {
    originalSentenceEl.textContent = 'No correction needed, or an error occurred.';
    correctedSentenceEl.textContent = '';
    explainRuleBtn.classList.add('hidden');
  }
};

explainRuleBtn?.addEventListener('click', async () => {
  const original = originalSentenceEl.textContent.slice(1, -1);
  const corrected = correctedSentenceEl.textContent.slice(1, -1);
  explainRuleBtn.textContent = 'Explaining...';

  const explanation = await AIManager.getGrammarExplanation(original, corrected);

  explanationText.textContent = explanation;
  explanationContainer.classList.remove('hidden');
  explainRuleBtn.classList.add('hidden');
});

closeCorrectionBtn?.addEventListener('click', () => correctionModal.classList.add('hidden'));

/* ----------------------------- Map & Nav ---------------------------- */
questView?.addEventListener('click', (e) => {
  const card = e.target.closest('.quest-card');
  if (card) showMapView(card.dataset.questId);
});

mapContainer?.addEventListener('click', (e) => {
  const location = e.target.closest('.map-location');
  if (location) {
    mapModal.classList.add('hidden');
    showVignette(location.dataset.questId, location.dataset.stageId);
  }
});

startStageBtn?.addEventListener('click', startStage);

continueQuestBtn?.addEventListener('click', () => {
  stageCompleteModal.classList.add('hidden');
  chatView.classList.add('hidden');
  questView.style.display = 'flex';
  if (currentStage.nextStages.length > 0) {
    showMapView(currentStage.questId);
  } else {
    alert('Quest Complete! 🎉');
  }
});

endSessionBtn?.addEventListener('click', endStage);

/* -------------------------- Initial Render -------------------------- */
renderQuests();

/* ------------------------- Placement wiring ------------------------- */
submitQuizBtn?.addEventListener('click', () => {
  const selected = document.querySelector('input[name="quiz"]:checked');
  if (!selected) {
    alert('Please select an answer.');
    return;
  }
  if (selected.value === 'b') {
    placementQuizView.classList.add('hidden');
    placementChatView.classList.remove('hidden');
    placementChatView.classList.add('flex');
    addPlacementMessage('¡Hola! Mucho gusto. ¿Cómo te llamas?', 'ai');
  } else {
    alert('Not quite! Let\'s start with the basics.');
    saveUserSettings(currentUser?.uid, { proficiencyLevel: 'A1' }).then(() => {
      userSettings.proficiencyLevel = 'A1';
      showMainApp();
    });
  }
});

placementSendBtn?.addEventListener('click', handlePlacementSend);
placementChatInput?.addEventListener('keypress', (e) => e.key === 'Enter' && handlePlacementSend);
