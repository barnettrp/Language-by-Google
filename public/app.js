/* =========================================================================
   ConvoQuest — Frontend App (public/app.js)
   Loads AFTER /firebase-init.js (module) which sets window.firebaseInstances/functions
   ========================================================================= */

/* ------------------------ Ribbon helper (global) -------------------- */
(function initRibbon() {
  const el = document.getElementById('debug-ribbon');
  const set = (msg) => { if (el) el.textContent = msg; };
  window.__setRibbon = set;
  set('JS: starting');
})();

/* ------------------------- Guards & Firebase ------------------------- */
if (!window.firebaseInstances || !window.firebaseFunctions) {
  console.error('[ConvoQuest] Firebase modules did not load (firebase-init.js missing or failed).');
  window.__setRibbon && window.__setRibbon('JS: Firebase failed to load');
  (function hardWarn() {
    const warn = document.createElement('div');
    warn.textContent = 'Critical error: Firebase failed to load.';
    warn.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#531;color:#fff;padding:8px;z-index:2147483647;font:12px/1.3 system-ui';
    document.body.appendChild(warn);
  })();
  throw new Error('Firebase init missing');
}

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
  "hola":"hello","adiós":"goodbye","gracias":"thank you","por":"for/by","favor":"please","sí":"yes","no":"no",
  "qué":"what","cómo":"how","dónde":"where","quién":"who","cuándo":"when","yo":"I","tú":"you","él":"he","ella":"she",
  "nosotros":"we","ellos":"they","ellas":"they","estoy":"I am","estás":"you are","es":"is","somos":"we are","son":"are",
  "ser":"to be","estar":"to be","tengo":"I have","tienes":"you have","tiene":"has","tenemos":"we have","tienen":"have",
  "tener":"to have","quiero":"I want","quieres":"you want","quiere":"wants","queremos":"we want","quieren":"want",
  "querer":"to want","un":"a/an","una":"a/an","el":"the","la":"the","los":"the","las":"the","a":"to/at","de":"of/from",
  "en":"in/on","con":"with","sin":"without","buenos":"good","días":"days","tardes":"afternoons","noches":"nights",
  "nombre":"name","mi":"my","me":"me","llamo":"I call myself","y":"and","o":"or","pero":"but","porque":"because",
  "café":"coffee","agua":"water","comida":"food","cuenta":"bill","hotel":"hotel","aeropuerto":"airport","calle":"street",
  "plaza":"plaza","amigo":"friend","amiga":"friend","familia":"family","ayuda":"help","bien":"well","mal":"bad",
  "mucho":"a lot","poco":"a little","ahora":"now","hoy":"today","mañana":"tomorrow","siempre":"always",
  "necesito":"I need","puedo":"I can","voy":"I go","hay":"there is/are"
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.onstart = function () {
    isListening = true;
    if (micBtn) micBtn.classList.add('mic-active');
  };
  recognition.onresult = function (event) {
    if (chatInput) chatInput.value = event.results[0][0].transcript;
  };
  recognition.onerror = function (event) {
    console.error('Speech recognition error:', event.error);
    alert('Speech recognition error: ' + event.error + '. Please ensure microphone access is allowed.');
  };
  recognition.onend = function () {
    isListening = false;
    if (micBtn) micBtn.classList.remove('mic-active');
  };
}

function speak(textToSpeak) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Sorry, your browser doesn't support text-to-speech.");
  }
}

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
    const mappedHistory = history.map(function (m) {
      return { role: m.role === 'ai' ? 'model' : 'user', parts: m.parts };
    });
    const payload = { type: 'chat', history: mappedHistory, stage: stage, settings: settings };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async validateObjective(transcript, validationPrompt) {
    const payload = { type: 'validation', transcript: transcript, validationPrompt: validationPrompt };
    const response = await this.callAPI(payload);
    return response.text || 'NO';
  },
  async getCorrection(text) {
    const payload = { type: 'correction', text: text };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async analyzeConversation(transcript) {
    const payload = { type: 'analysis', transcript: transcript };
    const response = await this.callAPI(payload);
    return response.data || { error: response.error };
  },
  async getTranslation(word, context) {
    const payload = { type: 'translation', word: word, context: context };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async getHint(history, stage) {
    const mappedHistory = history.map(function (m) {
      return { role: m.role === 'ai' ? 'model' : 'user', parts: m.parts };
    });
    const payload = { type: 'hint', history: mappedHistory, stage: stage };
    const response = await this.callAPI(payload);
    return response.text || 'Try asking a question.';
  },
  async getGrammarExplanation(original, corrected) {
    const payload = { type: 'grammar', original: original, corrected: corrected };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async getPlacementResponse(history) {
    const mappedHistory = history.map(function (m) {
      return { role: m.role === 'ai' ? 'model' : 'user', parts: m.parts };
    });
    const payload = { type: 'placement', history: mappedHistory };
    const response = await this.callAPI(payload);
    return response.text || response.error;
  },
  async analyzePlacement(transcript) {
    const payload = { type: 'placement-analysis', transcript: transcript };
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
function renderQuests() {
  const list = questView ? questView.querySelector('.space-y-3') : null;
  if (!list) return;
  const ids = Object.keys(quests);
  list.innerHTML = ids.map(function (questId) {
    const q = quests[questId];
    return (
      '<div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer quest-card" data-quest-id="' + questId + '">' +
      '<h3 class="font-semibold">' + q.title + '</h3>' +
      '<p class="text-sm text-gray-600">' + q.objective + '</p>' +
      '</div>'
    );
  }).join('');
}

function showMapView(questId) {
  currentQuest = Object.assign({}, quests[questId], { id: questId });
  mapTitle.textContent = currentQuest.title;
  mapObjective.textContent = currentQuest.objective;
  var mapImg = document.getElementById('map-image');
  if (mapImg) mapImg.src = currentQuest.mapImage;

  mapContainer.querySelectorAll('.map-location').forEach(function (el) { el.remove(); });

  const nextStageIds = currentStage ? currentStage.nextStages : ['1'];
  nextStageIds.forEach(function (stageId, index) {
    const location = document.createElement('div');
    location.className = 'map-location absolute p-2 bg-white/80 rounded-full shadow-lg';
    location.style.left = (20 + index * 40) + '%';
    location.style.top = (40 + (index % 2 * 15)) + '%';
    location.innerHTML = '<span>📍</span>';
    location.dataset.questId = questId;
    location.dataset.stageId = stageId;
    mapContainer.appendChild(location);
  });

  mapModal.classList.remove('hidden');
}

function showVignette(questId, stageId) {
  currentQuest = Object.assign({}, quests[questId], { id: questId });
  currentStage = Object.assign({}, currentQuest.stages[stageId], { id: stageId, questId: questId });
  vignetteTitle.textContent = currentStage.characterName;
  vignetteText.textContent = (userSettings.vignetteLanguage === 'Spanish') ? currentStage.vignette_es : currentStage.vignette_en;
  vignetteModal.classList.remove('hidden');
}

function startStage() {
  if (!currentStage) return;
  messages = [];
  const titleEl = chatView ? chatView.querySelector('#chat-title') : null;
  const descEl = chatView ? chatView.querySelector('#chat-description') : null;
  if (titleEl) titleEl.textContent = currentStage.characterName;
  if (descEl) {
    const parts = currentStage.vignette_en.split('.');
    descEl.textContent = parts.length > 1 ? parts[1] : '';
  }
  addMessage(currentStage.initialMessage, 'ai');
  vignetteModal.classList.add('hidden');
  if (questView) questView.style.display = 'none';
  chatView.classList.remove('hidden');
  chatView.classList.add('flex');
}

function addMessage(text, role) {
  messages.push({ role: role, parts: [{ text: text }] });
  const isUser = role === 'user';
  const wrapper = document.createElement('div');
  wrapper.className = 'w-full flex flex-col ' + (isUser ? 'items-end' : 'items-start');
  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.className = 'chat-bubble p-3 rounded-lg w-fit ' + (isUser ? 'chat-bubble-user' : 'chat-bubble-ai');

  text.split(' ').forEach(function (word) {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'clickable-word cursor-pointer hover:underline';
    wordSpan.textContent = word + ' ';
    bubbleWrapper.appendChild(wordSpan);
  });

  wrapper.appendChild(bubbleWrapper);
  if (isUser) {
    const btn = document.createElement('button');
    btn.title = 'Correct me';
    btn.className = 'correction-btn text-xs text-gray-500 hover:text-blue-500 mt-1 mr-1';
    btn.textContent = 'Correct me ✨';
    wrapper.appendChild(btn);
  } else {
    const btn2 = document.createElement('button');
    btn2.title = 'Read aloud';
    btn2.className = 'read-aloud-btn text-xs text-gray-500 hover:text-blue-500 mt-1 ml-1';
    btn2.textContent = 'Read Aloud 🔊';
    wrapper.appendChild(btn2);
  }
  chatContainer.insertBefore(wrapper, chatContainer.firstChild);
}

function addTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'flex justify-start';
  indicator.innerHTML = '' +
    '<div class="chat-bubble-ai p-3 rounded-lg w-fit flex items-center gap-1.5">' +
    '<span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>' +
    '<span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: .2s;"></span>' +
    '<span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: .4s;"></span>' +
    '</div>';
  chatContainer.insertBefore(indicator, chatContainer.firstChild);
}
function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

async function handleSendMessage() {
  const userInput = chatInput ? chatInput.value.trim() : '';
  if (!userInput) return;
  addMessage(userInput, 'user');
  chatInput.value = '';
  addTypingIndicator();
  const response = await AIManager.getResponse(messages.slice(-6), currentStage, userSettings);
  removeTypingIndicator();
  addMessage(response, 'ai');
}

async function endStage() {
  const transcript = messages.map(function (m) {
    return (m.role === 'user' ? 'User' : 'Tutor') + ': ' + m.parts[0].text;
  }).join('\n');
  const result = await AIManager.validateObjective(transcript, currentStage.validationPrompt);

  if (String(result).trim().toUpperCase() === 'YES') {
    const stageKey = currentStage.questId + '-' + currentStage.id;
    if (!userSettings.completedStages[stageKey]) {
      clueText.textContent = currentStage.reward.clue;
      xpGainText.textContent = '+' + currentStage.reward.xp + ' XP';
      userSettings.xp += currentStage.reward.xp;
      userSettings.completedStages[stageKey] = true;
      await saveUserSettings(currentUser.uid, { xp: increment(currentStage.reward.xp), completedStages: userSettings.completedStages });
      stageCompleteModal.classList.remove('hidden');
    } else {
      chatView.classList.add('hidden');
      if (questView) questView.style.display = 'flex';
      showMapView(currentStage.questId);
    }
  } else {
    alert('Objective not met. Try asking again in a different way.');
  }
}

async function showHint() {
  hintBtn.disabled = true;
  const p = hintPopover.querySelector('p');
  if (p) p.textContent = 'Getting hint...';
  hintPopover.classList.remove('hidden');

  const hint = await AIManager.getHint(messages.slice(-6), currentStage);
  if (p) p.textContent = hint;
  hintBtn.disabled = false;
}

/* --------------------------- Placement Chat ------------------------- */
function addPlacementMessage(text, role) {
  placementMessages.push({ role: role, parts: [{ text: text }] });
  const isUser = role === 'user';
  const wrapper = document.createElement('div');
  wrapper.className = 'w-full flex flex-col ' + (isUser ? 'items-end' : 'items-start');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble p-3 rounded-lg w-fit ' + (isUser ? 'chat-bubble-user' : 'chat-bubble-ai');
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  placementChatContainer.insertBefore(wrapper, placementChatContainer.firstChild);
}

async function handlePlacementSend() {
  const userInput = placementChatInput ? placementChatInput.value.trim() : '';
  if (!userInput) return;
  addPlacementMessage(userInput, 'user');
  placementChatInput.value = '';

  if (placementMessages.length >= 4) {
    addPlacementMessage('¡Gracias! Analizando tu nivel...', 'ai');
    const transcript = placementMessages.map(function (m) {
      return m.role + ': ' + m.parts[0].text;
    }).join('\n');
    const level = await AIManager.analyzePlacement(transcript);
    await saveUserSettings(currentUser.uid, { proficiencyLevel: level });
    userSettings.proficiencyLevel = level;
    alert('Great, we\'ve placed you at level: ' + level + '. Let\'s get started!');
    showMainApp();
  } else {
    const response = await AIManager.getPlacementResponse(placementMessages);
    addPlacementMessage(response, 'ai');
  }
}

/* -------------------------- Settings & Save ------------------------- */
async function saveUserSettings(userId, settings) {
  if (!userId) return;
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, settings);
}

function updateSetting(key, value) {
  userSettings[key] = value;
  if (currentUser) {
    const obj = {}; obj[key] = value;
    saveUserSettings(currentUser.uid, obj);
  }
}

async function setupNewUser(user) {
  await updateProfile(user, { displayName: signupName });
  const userDocRef = doc(db, 'users', user.uid);
  const initialSettings = {
    name: signupName,
    email: user.email,
    createdAt: serverTimestamp(),
    dialect: 'Mexico',
    formality: 'Casual',
    vignetteLanguage: 'English',
    xp: 0,
    completedStages: {}
  };
  await setDoc(userDocRef, initialSettings);
  signupName = '';
  return initialSettings;
}

async function loadUserSettings(userId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists() && snap.data()) {
      userSettings = Object.assign({}, userSettings, snap.data());
    } else {
      console.log('No user document found, creating one for existing user.');
      const initialSettings = {
        name: currentUser.displayName,
        email: currentUser.email,
        createdAt: serverTimestamp(),
        dialect: 'Mexico',
        formality: 'Casual',
        vignetteLanguage: 'English',
        xp: 0,
        completedStages: {}
      };
      await setDoc(userDocRef, initialSettings);
      userSettings = Object.assign({}, userSettings, initialSettings);
    }
    if (dialectSelect) dialectSelect.value = userSettings.dialect;
    if (formalitySelect) formalitySelect.value = userSettings.formality;
    if (vignetteLangSelect) vignetteLangSelect.value = userSettings.vignetteLanguage;
  } catch (error) {
    console.error('Error loading user settings:', error);
  }
}

/* -------------------------- UI Switch Helpers ---------------------- */
function showMainApp() {
  if (welcomeMessage) {
    const name = (currentUser && currentUser.displayName) || userSettings.name || 'Friend';
    welcomeMessage.textContent = 'Welcome, ' + name + '!';
  }
  // Keep original visibility changes (CSS flip via body class is now the primary)
  if (authContainer) authContainer.style.display = 'none';
  if (placementView) placementView.classList.add('hidden');
  if (mainAppView) {
    mainAppView.classList.remove('hidden');
    mainAppView.classList.add('flex');
  }
  if (questView) questView.style.display = 'flex';
  if (chatView) {
    chatView.classList.add('hidden');
    chatView.classList.remove('flex');
  }
}

function startPlacementTest() {
  placementMessages = [];
  const checked = document.querySelector('input[name="quiz"]:checked');
  if (checked && checked.checked) checked.checked = false;

  if (authContainer) authContainer.style.display = 'none';
  if (mainAppView) mainAppView.classList.add('hidden');
  if (settingsModal) settingsModal.classList.add('hidden');
  if (placementView) {
    placementView.classList.remove('hidden');
    placementView.classList.add('flex');
  }
  if (placementQuizView) {
    placementQuizView.classList.remove('hidden');
    placementQuizView.classList.add('flex');
  }
  if (placementChatView) {
    placementChatView.classList.add('hidden');
    placementChatView.classList.remove('flex');
  }
}

/* ---------------------- Auth State + Diagnostics -------------------- */

// Manual helper to force main UI
window.__forceMainApp = function () {
  try {
    console.log('[Debug] Forcing main app UI');
    document.body.classList.add('signed-in');
    document.body.classList.remove('signed-out');

    const el = document.getElementById('auth-container');
    if (el) el.style.display = 'none';
    const mv = document.getElementById('main-app-view');
    if (mv) { mv.classList.remove('hidden'); mv.classList.add('flex'); mv.style.removeProperty('display'); mv.style.minHeight = '60vh'; }
    const qv = document.getElementById('quest-view');
    const cv = document.getElementById('chat-view');
    if (qv) qv.style.display = 'flex';
    if (cv) { cv.classList.add('hidden'); cv.classList.remove('flex'); }
    if (mv && !mv.querySelector('#___mainBanner')) {
      const b = document.createElement('div');
      b.id = '___mainBanner';
      b.textContent = 'MAIN APP VIEW — if you see this, UI flip worked ✅';
      b.style.cssText = 'background:#10b981;color:white;padding:8px;text-align:center;font-weight:600;';
      mv.insertBefore(b, mv.firstChild);
      setTimeout(() => b.remove(), 2500);
    }
    window.__setRibbon && window.__setRibbon('UI: main app (forced)');
  } catch (e) {
    console.error('forceMainApp failed', e);
  }
};

async function handleSignedInUser(user) {
  window.__setRibbon && window.__setRibbon('Auth state: handling user...');

  if (!user) {
    // signed OUT
    document.body.classList.remove('signed-in');
    document.body.classList.add('signed-out');

    console.log('[ConvoQuest] No user (signed out)');
    currentUser = null;
    if (authContainer) authContainer.style.display = 'flex';
    if (placementView) placementView.classList.add('hidden');
    if (signupView) signupView.classList.add('hidden');
    if (loginView) loginView.classList.remove('hidden');
    if (mainAppView) { mainAppView.classList.add('hidden'); mainAppView.classList.remove('flex'); }
    window.__setRibbon && window.__setRibbon('Auth state: signed out');
    return;
  }

  // signed IN
  document.body.classList.add('signed-in');
  document.body.classList.remove('signed-out');

  try {
    currentUser = user;
    const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
    console.log('[ConvoQuest] Signed in. isNewUser=', isNewUser);
    window.__setRibbon && window.__setRibbon('Auth state: signed in (loading settings)');

    if (isNewUser && signupName) {
      userSettings = await setupNewUser(user);
      console.log('[ConvoQuest] New user initialized.');
    }

    await loadUserSettings(user.uid);

    // Ensure a level so main app shows
    if (!userSettings.proficiencyLevel) {
      userSettings.proficiencyLevel = 'A1';
      try { await saveUserSettings(currentUser.uid, { proficiencyLevel: 'A1' }); } catch {}
    }

    showMainApp(); // normal logic
    console.log('[ConvoQuest] Showing main app.');
    window.__setRibbon && window.__setRibbon('UI: main app (CSS flip active)');
  } catch (error) {
    console.error('CRITICAL ERROR during user setup/load:', error);
    window.__setRibbon && window.__setRibbon('Auth state: error (showing main)');
    showMainApp();
  }
}

// Primary auth listener
onAuthStateChanged(auth, async function (user) {
  console.log('[ConvoQuest] onAuthStateChanged fired', { hasUser: !!user });
  window.__setRibbon && window.__setRibbon('Auth state: event fired');
  await handleSignedInUser(user);
});

// Watchdog: if signed in but UI didn't flip, force CSS class flip.
setTimeout(() => {
  try {
    if (auth && auth.currentUser) {
      document.body.classList.add('signed-in');
      document.body.classList.remove('signed-out');
      window.__setRibbon && window.__setRibbon('UI: forced CSS flip (watchdog)');
    }
  } catch (e) {}
}, 2000);

/* --------------------------- Settings UI ---------------------------- */
if (settingsBtn) settingsBtn.addEventListener('click', function () { settingsModal.classList.remove('hidden'); });
if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', function () { settingsModal.classList.add('hidden'); });
if (retakePlacementBtn) retakePlacementTestSafe();
if (vignetteLangSelect) vignetteLangSelect.addEventListener('change', function (e) { updateSetting('vignetteLanguage', e.target.value); });
if (dialectSelect) dialectSelect.addEventListener('change', function (e) { updateSetting('dialect', e.target.value); });
if (formalitySelect) formalitySelect.addEventListener('change', function (e) { updateSetting('formality', e.target.value); });

function retakePlacementTestSafe() {
  if (retakePlacementBtn) retakePlacementBtn.addEventListener('click', startPlacementTest);
}

/* ----------------------------- Chat UI ------------------------------ */
if (sendBtn) sendBtn.addEventListener('click', handleSendMessage);
if (chatInput) chatInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') handleSendMessage();
});

if (micBtn) {
  micBtn.addEventListener('click', function () {
    if (!recognition) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }
    if (isListening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
    } catch (e) {
      console.error('Could not start recognition:', e);
      alert('Could not start speech recognition. Please check permissions.');
    }
  });
}

if (chatContainer) {
  chatContainer.addEventListener('click', async function (e) {
    const target = e.target;

    if (target.classList.contains('read-aloud-btn')) {
      const bubble = target.closest('.flex-col').querySelector('.chat-bubble');
      if (bubble) speak(bubble.textContent.trim());
      return;
    }

    if (target.classList.contains('correction-btn')) {
      const bubble2 = target.closest('.flex-col').querySelector('.chat-bubble');
      if (bubble2) showCorrectionModal(bubble2.textContent.trim());
      return;
    }

    if (target.classList.contains('clickable-word')) {
      const word = target.textContent.trim().replace(/[.,¡!¿?]/g, '').toLowerCase();
      if (!word) return;

      function showTranslation(text) {
        translationPopover.innerHTML = text;
        const containerRect = document.getElementById('app-container').getBoundingClientRect();
        const rect = target.getBoundingClientRect();
        const popRect = translationPopover.getBoundingClientRect();
        let left = rect.left - containerRect.left + (rect.width / 2) - (popRect.width / 2);
        let top = rect.top - containerRect.top - popRect.height - 8;
        if (left < 8) left = 8;
        if (left + popRect.width > containerRect.width - 8) {
          left = containerRect.width - popRect.width - 8;
        }
        if (top < 8) {
          top = rect.bottom - containerRect.top + 8;
        }
        translationPopover.style.left = String(left) + 'px';
        translationPopover.style.top = String(top) + 'px';
        translationPopover.classList.remove('hidden');
      }

      if (translationCache.has(word)) {
        showTranslation(translationCache.get(word));
      } else if (Object.prototype.hasOwnProperty.call(localDictionary, word)) {
        const translation = localDictionary[word];
        translationCache.set(word, translation);
        showTranslation(translation);
      } else {
        showTranslation('Translating...');
        const context = target.parentElement.textContent.trim();
        const apiTranslation = await AIManager.getTranslation(word, context);
        const formatted = apiTranslation ? String(apiTranslation).replace(/\n/g, '<br>') : 'Not found.';
        translationCache.set(word, formatted);
        showTranslation(formatted);
      }
    }
  });
}

if (hintBtn) {
  hintBtn.addEventListener('click', function () { showHint(); });
}
if (hintPopover) {
  hintPopover.addEventListener('click', function () {
    const p = hintPopover.querySelector('p');
    const hintText = p ? p.textContent : '';
    if (hintText && hintText !== 'Getting hint...') {
      if (chatInput) chatInput.value = hintText;
      hintPopover.classList.add('hidden');
      if (chatInput) chatInput.focus();
    }
  });
}

document.body.addEventListener('click', function (e) {
  if (!e.target.classList.contains('clickable-word') && !e.target.closest('#hint-btn')) {
    if (translationPopover) translationPopover.classList.add('hidden');
    if (hintPopover) hintPopover.classList.add('hidden');
  }
}, true);

/* ------------------------- Correction modal ------------------------- */
async function showCorrectionModal(originalText) {
  correctionModal.classList.remove('hidden');
  correctionLoading.classList.remove('hidden');
  const content = document.getElementById('correction-content');
  if (content) content.classList.add('hidden');
  explanationContainer.classList.add('hidden');
  explainRuleBtn.classList.remove('hidden');
  explainRuleBtn.textContent = 'Explain this rule 💡';

  const correctionText = await AIManager.getCorrection(originalText);

  correctionLoading.classList.add('hidden');
  if (content) content.classList.remove('hidden');

  if (typeof correctionText === 'string' && correctionText.indexOf('Corrected:') !== -1) {
    const parts = correctionText.split('\n');
    const corrected = parts[0].replace('Corrected: ', '').trim();
    originalSentenceEl.textContent = '"' + originalText + '"';
    correctedSentenceEl.textContent = '"' + corrected + '"';
  } else {
    originalSentenceEl.textContent = 'No correction needed, or an error occurred.';
    correctedSentenceEl.textContent = '';
    explainRuleBtn.classList.add('hidden');
  }
}

if (explainRuleBtn) {
  explainRuleBtn.addEventListener('click', async function () {
    const origTxt = originalSentenceEl.textContent;
    const corrTxt = correctedSentenceEl.textContent;
    const original = origTxt ? origTxt.slice(1, -1) : '';
    const corrected = corrTxt ? corrTxt.slice(1, -1) : '';
    explainRuleBtn.textContent = 'Explaining...';

    const explanation = await AIManager.getGrammarExplanation(original, corrected);

    explanationText.textContent = explanation;
    explanationContainer.classList.remove('hidden');
    explainRuleBtn.classList.add('hidden');
  });
}

if (closeCorrectionBtn) {
  closeCorrectionBtn.addEventListener('click', function () {
    correctionModal.classList.add('hidden');
  });
}

/* ----------------------------- Map & Nav ---------------------------- */
if (questView) {
  questView.addEventListener('click', function (e) {
    const card = e.target.closest('.quest-card');
    if (card) showMapView(card.dataset.questId);
  });
}

if (mapContainer) {
  mapContainer.addEventListener('click', function (e) {
    const location = e.target.closest('.map-location');
    if (location) {
      mapModal.classList.add('hidden');
      showVignette(location.dataset.questId, location.dataset.stageId);
    }
  });
}

if (startStageBtn) startStageBtn.addEventListener('click', startStage);

if (continueQuestBtn) {
  continueQuestBtn.addEventListener('click', function () {
    stageCompleteModal.classList.add('hidden');
    chatView.classList.add('hidden');
    if (questView) questView.style.display = 'flex';
    if (currentStage && currentStage.nextStages && currentStage.nextStages.length > 0) {
      showMapView(currentStage.questId);
    } else {
      alert('Quest Complete! 🎉');
    }
  });
}

if (endSessionBtn) {
  endSessionBtn.addEventListener('click', function () { endStage(); });
}

/* -------------------------- Initial Render -------------------------- */
renderQuests();

/* ------------------------- Placement wiring ------------------------- */
if (submitQuizBtn) {
  submitQuizBtn.addEventListener('click', function () {
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
      const uid = currentUser ? currentUser.uid : null;
      saveUserSettings(uid, { proficiencyLevel: 'A1' }).then(function () {
        userSettings.proficiencyLevel = 'A1';
        showMainApp();
      });
    }
  });
}

if (placementSendBtn) placementSendBtn.addEventListener('click', handlePlacementSend);
if (placementChatInput) {
  placementChatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handlePlacementSend();
  });
}

/* -------------------------- Auth Actions ---------------------------- */
// Signup
if (signupBtn) {
  signupBtn.addEventListener('click', async function () {
    signupError.textContent = '';
    const name = signupNameInput ? signupNameInput.value.trim() : '';
    const email = signupEmailInput ? signupEmailInput.value.trim() : '';
    const password = signupPasswordInput ? signupPasswordInput.value.trim() : '';
    const confirmPassword = signupConfirmPasswordInput ? signupConfirmPasswordInput.value.trim() : '';

    if (!name || !email || !password || !confirmPassword) {
      signupError.textContent = 'Please fill out all fields.';
      return;
    }
    if (password.length < 6) {
      signupError.textContent = 'Password must be at least 6 characters.';
      return;
    }
    if (password !== confirmPassword) {
      signupError.textContent = 'Passwords do not match.';
      return;
    }

    signupName = name;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      signupError.textContent = error && error.message ? error.message : 'Sign up failed.';
      signupName = '';
    }
  });
}

// Show/hide auth screens
if (showSignupBtn) {
  showSignupBtn.addEventListener('click', function () {
    if (loginView) loginView.classList.add('hidden');
    if (signupView) signupView.classList.remove('hidden');
  });
}
if (showLoginBtn) {
  showLoginBtn.addEventListener('click', function () {
    if (signupView) signupView.classList.add('hidden');
    if (loginView) loginView.classList.remove('hidden');
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', async function () {
    try {
      await signOut(auth);
      console.log('Signed out');
      document.body.classList.add('signed-out');
      document.body.classList.remove('signed-in');
      window.__setRibbon && window.__setRibbon('Auth state: signed out (manual)');
    } catch (err) {
      console.error('Logout error:', err);
    }
  });
}

// Login
if (loginBtn) {
  loginBtn.addEventListener('click', async function () {
    window.__setRibbon && window.__setRibbon('Click: Login button');
    console.log('[ConvoQuest] Login button clicked');

    if (loginError) loginError.textContent = '';
    const email = loginEmailInput ? loginEmailInput.value.trim() : '';
    const password = loginPasswordInput ? loginPasswordInput.value.trim() : '';

    if (!email || !password) {
      if (loginError) loginError.textContent = 'Please enter an email and password.';
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log('[ConvoQuest] signInWithEmailAndPassword resolved', { uid: cred.user ? cred.user.uid : null });
      window.__setRibbon && window.__setRibbon('Auth: success (post-login UI)');
      await handleSignedInUser(auth.currentUser || cred.user);
      if (typeof window.__afterLoginSuccess === 'function') {
        window.__afterLoginSuccess();
      }
    } catch (error) {
      console.error('[ConvoQuest] Login error:', error);
      window.__setRibbon && window.__setRibbon('Auth: error ' + (error && error.code ? error.code : 'unknown'));
      const map = {
        'auth/invalid-email': 'That email looks invalid.',
        'auth/user-disabled': 'This account is disabled.',
        'auth/user-not-found': 'No account with that email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/operation-not-allowed': 'Email/password sign-in is not enabled.'
      };
      const code = (error && error.code) ? error.code : '';
      if (loginError) {
        loginError.textContent = map[code] || (error && error.message ? error.message : 'Login failed.');
      }
    }
  });
}
