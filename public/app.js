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
const chatTitle = document.getElementById('chat-title');

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const dialectSelect = document.getElementById('dialect-select');
const formalitySelect = document.getElementById('formality-select');
const vignetteLangSelect = document.getElementById('vignette-lang-select');

const micBtn = document.getElementById('mic-btn');
const endSessionBtn = document.getElementById('end-session-btn');
const translationPopover = document.getElementById('translation-popover');
const vignetteModal = document.getElementById('vignette-modal');
const vignetteTitle = document.getElementById('vignette-title');
const vignetteText = document.getElementById('vignette-text');
const startStageBtn = document.getElementById('start-stage-btn');
const mapModal = document.getElementById('map-modal');
const closeMapBtn = document.getElementById('close-map-btn');
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
    const mappedHistory = history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: m.parts }));
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
    const mappedHistory = history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: m.parts }));
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
    const mappedHistory = history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: m.parts }));
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
  list.innerHTML = Object.keys(quests).map(questId => {
    const q = quests[questId];
    return `
      <div class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer quest-card" data-quest-id="${questId}">
        <h3 class="font-semibold">${q.title}</h3>
        <p class="text-sm text-gray-600">${q.objective}</p>
      </div>`;
  }).join('');
}

function showMapView(questId) {
    currentQuest = { ...quests[questId], id: questId };
    if (mapTitle) mapTitle.textContent = currentQuest.title;
    if (mapObjective) mapObjective.textContent = currentQuest.objective;
    const mapImg = document.getElementById('map-image');
    if (mapImg) mapImg.src = currentQuest.mapImage;

    if (mapContainer) {
      mapContainer.querySelectorAll('.map-location').forEach(el => el.remove());
      const nextStageIds = (currentStage && currentStage.nextStages) ? currentStage.nextStages : ['1'];
      nextStageIds.forEach((stageId, index) => {
        const location = document.createElement('div');
        location.className = 'map-location absolute p-2 bg-white/80 rounded-full shadow-lg';
        location.style.left = `${20 + index * 40}%`;
        location.style.top = `${40 + (index % 2 * 15)}%`;
        location.innerHTML = '<span>📍</span>';
        location.dataset.questId = questId;
        location.dataset.stageId = stageId;
        mapContainer.appendChild(location);
      });
    }

    if (mapModal) mapModal.classList.remove('hidden');
}

function showVignette(questId, stageId) {
  currentQuest = { ...quests[questId], id: questId };
  currentStage = { ...currentQuest.stages[stageId], id: stageId, questId: questId };
  if (vignetteTitle) vignetteTitle.textContent = currentStage.characterName;
  if (vignetteText) vignetteText.textContent = userSettings.vignetteLanguage === 'Spanish' ? currentStage.vignette_es : currentStage.vignette_en;
  if (vignetteModal) vignetteModal.classList.remove('hidden');
}

function startStage() {
  if (!currentStage) return;
  messages = [];
  if (chatTitle) chatTitle.textContent = currentStage.characterName;
  if (chatContainer) chatContainer.innerHTML = '';

  addMessage(currentStage.initialMessage, 'ai');
  
  if (vignetteModal) vignetteModal.classList.add('hidden');
  if (mainAppView) mainAppView.classList.add('in-chat');
}

function addMessage(text, role) {
  if (!chatContainer) return;
  messages.push({ role, parts: [{ text }] });
  const isUser = role === 'user';
  
  const wrapper = document.createElement('div');
  wrapper.className = `w-full flex flex-col ${isUser ? 'items-end' : 'items-start'}`;
  
  const bubbleWrapper = document.createElement('div');
  bubbleWrapper.className = `chat-bubble p-3 rounded-lg w-fit ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`;

  text.split(' ').forEach(word => {
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
    const btn = document.createElement('button');
    btn.title = 'Read aloud';
    btn.className = 'read-aloud-btn text-xs text-gray-500 hover:text-blue-500 mt-1 ml-1';
    btn.textContent = 'Read Aloud 🔊';
    wrapper.appendChild(btn);
  }
  
  chatContainer.insertBefore(wrapper, chatContainer.firstChild);
}

function addTypingIndicator() {
  if (!chatContainer) return;
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'flex justify-start';
  indicator.innerHTML = `
    <div class="chat-bubble-ai p-3 rounded-lg w-fit flex items-center gap-1.5">
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: .2s;"></span>
      <span class="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style="animation-delay: .4s;"></span>
    </div>`;
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
  if (chatInput) chatInput.value = '';
  addTypingIndicator();
  const response = await AIManager.getResponse(messages.slice(-6), currentStage, userSettings);
  removeTypingIndicator();
  addMessage(response, 'ai');
}

async function endStage() {
  const transcript = messages.map(m => `${m.role}: ${m.parts[0].text}`).join('\n');
  const result = await AIManager.validateObjective(transcript, currentStage.validationPrompt);

  if (String(result).trim().toUpperCase() === 'YES') {
    const stageKey = `${currentStage.questId}-${currentStage.id}`;
    if (!userSettings.completedStages[stageKey]) {
      if(clueText) clueText.textContent = currentStage.reward.clue;
      if(xpGainText) xpGainText.textContent = `+${currentStage.reward.xp} XP`;
      userSettings.xp += currentStage.reward.xp;
      userSettings.completedStages[stageKey] = true;
      await saveUserSettings(currentUser.uid, { xp: increment(currentStage.reward.xp), completedStages: userSettings.completedStages });
      if (stageCompleteModal) stageCompleteModal.classList.remove('hidden');
    } else {
        if(currentStage.nextStages && currentStage.nextStages.length > 0) {
            showMapView(currentStage.questId);
        } else {
            if (mainAppView) mainAppView.classList.remove('in-chat');
        }
    }
  } else {
    alert('Objective not met. Try asking again in a different way.');
  }
}

async function showHint() {
    if(!hintBtn || !hintPopover) return;
    hintBtn.disabled = true;
    const p = hintPopover.querySelector('p');
    if (p) p.textContent = 'Getting hint...';
    hintPopover.classList.remove('hidden');

    const hint = await AIManager.getHint(messages.slice(-6), currentStage);
    if (p) p.textContent = hint;
    hintBtn.disabled = false;
}

async function showCorrectionModal(originalText) {
  if (!correctionModal) return;
  correctionModal.classList.remove('hidden');
  if(correctionLoading) correctionLoading.classList.remove('hidden');
  const content = document.getElementById('correction-content');
  if (content) content.classList.add('hidden');
  if(explanationContainer) explanationContainer.classList.add('hidden');
  if(explainRuleBtn) {
    explainRuleBtn.classList.remove('hidden');
    explainRuleBtn.textContent = 'Explain this rule 💡';
  }

  const correctionText = await AIManager.getCorrection(originalText);

  if(correctionLoading) correctionLoading.classList.add('hidden');
  if (content) content.classList.remove('hidden');

  if (typeof correctionText === 'string' && correctionText.includes('Corrected:')) {
    const corrected = correctionText.split('Corrected:')[1].trim();
    if(originalSentenceEl) originalSentenceEl.textContent = `"${originalText}"`;
    if(correctedSentenceEl) correctedSentenceEl.textContent = `"${corrected}"`;
  } else {
    if(originalSentenceEl) originalSentenceEl.textContent = 'No correction needed, or an error occurred.';
    if(correctedSentenceEl) correctedSentenceEl.textContent = '';
    if(explainRuleBtn) explainRuleBtn.classList.add('hidden');
  }
}

/* --------------------------- Placement Chat ------------------------- */
function addPlacementMessage(text, role) {
  if (!placementChatContainer) return;
  placementMessages.push({ role, parts: [{ text }] });
  const isUser = role === 'user';
  const wrapper = document.createElement('div');
  wrapper.className = `w-full flex flex-col ${isUser ? 'items-end' : 'items-start'}`;
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble p-3 rounded-lg w-fit ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`;
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  placementChatContainer.insertBefore(wrapper, placementChatContainer.firstChild);
}

async function handlePlacementSend() {
  const userInput = placementChatInput ? placementChatInput.value.trim() : '';
  if (!userInput) return;
  addPlacementMessage(userInput, 'user');
  if (placementChatInput) placementChatInput.value = '';

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
    saveUserSettings(currentUser.uid, { [key]: value });
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
  return initialSettings;
}

async function loadUserSettings(userId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      userSettings = { ...userSettings, ...snap.data() };
    } else {
      console.log('No user document found for existing user. Creating one.');
      userSettings = await setupNewUser(currentUser);
    }
    if (dialectSelect) dialectSelect.value = userSettings.dialect;
    if (formalitySelect) formalitySelect.value = userSettings.formality;
    if (vignetteLangSelect) vignetteLangSelect.value = userSettings.vignetteLanguage;
    return userSettings;
  } catch (error) {
    console.error('Error loading user settings:', error);
  }
}

/* -------------------------- UI Switch Helpers ---------------------- */
function showMainApp() {
  document.body.classList.add('signed-in');
  document.body.classList.remove('signed-out');
  
  if (placementView) placementView.style.display = 'none';
  if (mainAppView) mainAppView.style.display = 'flex';
  if (mainAppView) mainAppView.classList.remove('in-chat');
  
  if (welcomeMessage) {
    const name = (currentUser && currentUser.displayName) || userSettings.name || 'Friend';
    welcomeMessage.textContent = `Welcome, ${name}!`;
  }
}

function startPlacementTest() {
  document.body.classList.add('signed-in');
  document.body.classList.remove('signed-out');

  if (mainAppView) mainAppView.style.display = 'none';
  if (placementView) placementView.style.display = 'flex';

  placementMessages = [];
  const checked = document.querySelector('input[name="quiz"]:checked');
  if (checked) checked.checked = false;

  if (placementQuizView) placementQuizView.style.display = 'flex';
  if (placementChatView) placementChatView.style.display = 'none';
}

/* ---------------------- Auth State Handler -------------------- */
async function handleAuthState(user) {
  if (user) {
    currentUser = user;
    const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
    
    if (isNewUser && signupName) {
      await setupNewUser(user);
      signupName = '';
    }
    
    await loadUserSettings(user.uid);

    if (!userSettings.proficiencyLevel) {
        console.log('[ConvoQuest] No proficiency level. Starting placement test.');
        startPlacementTest();
    } else {
        console.log(`[ConvoQuest] Proficiency level "${userSettings.proficiencyLevel}" found. Showing main app.`);
        showMainApp();
    }
  } else {
    currentUser = null;
    document.body.classList.add('signed-out');
    document.body.classList.remove('signed-in');
  }
}

/* --------------------------- Event Listeners ---------------------------- */
// Primary auth listener
onAuthStateChanged(auth, handleAuthState);

// Navigation
if (questView) questView.addEventListener('click', e => {
  const card = e.target.closest('.quest-card');
  if (card) showMapView(card.dataset.questId);
});
if (mapContainer) mapContainer.addEventListener('click', e => {
    const loc = e.target.closest('.map-location');
    if(loc) {
        if(mapModal) mapModal.classList.add('hidden');
        showVignette(loc.dataset.questId, loc.dataset.stageId);
    }
});
if (startStageBtn) startStageBtn.addEventListener('click', startStage);
if (continueQuestBtn) continueQuestBtn.addEventListener('click', () => {
    if(stageCompleteModal) stageCompleteModal.classList.add('hidden');
    if (currentStage.nextStages && currentStage.nextStages.length > 0) {
        showMapView(currentStage.questId);
    } else {
        if(mainAppView) mainAppView.classList.remove('in-chat');
        alert('Quest Complete! 🎉');
    }
});
if (endSessionBtn) endSessionBtn.addEventListener('click', endStage);

// Placement
if (submitQuizBtn) submitQuizBtn.addEventListener('click', () => {
  const selected = document.querySelector('input[name="quiz"]:checked');
  if (!selected) return alert('Please select an answer.');
  if (selected.value === 'b') {
    if (placementQuizView) placementQuizView.style.display = 'none';
    if (placementChatView) placementChatView.style.display = 'flex';
    if (placementChatContainer) placementChatContainer.innerHTML = '';
    addPlacementMessage('¡Hola! Mucho gusto. ¿Cómo te llamas?', 'ai');
  } else {
    alert('Not quite! Let\'s start with the basics.');
    saveUserSettings(currentUser.uid, { proficiencyLevel: 'A1' }).then(() => {
      userSettings.proficiencyLevel = 'A1';
      showMainApp();
    });
  }
});
if (placementSendBtn) placementSendBtn.addEventListener('click', handlePlacementSend);
if (placementChatInput) placementChatInput.addEventListener('keypress', e => { if (e.key === 'Enter') handlePlacementSend(); });

// Auth Actions
if (signupBtn) signupBtn.addEventListener('click', async () => {
  if(signupError) signupError.textContent = '';
  const name = signupNameInput.value.trim();
  const email = signupEmailInput.value.trim();
  const password = signupPasswordInput.value.trim();
  const confirm = signupConfirmPasswordInput.value.trim();

  if (!name || !email || !password) { signupError.textContent = 'Please fill out all fields.'; return; }
  if (password.length < 6) { signupError.textContent = 'Password must be at least 6 characters.'; return; }
  if (password !== confirm) { signupError.textContent = 'Passwords do not match.'; return; }
  
  signupName = name;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    signupError.textContent = error.message;
    signupName = '';
  }
});

if (loginBtn) loginBtn.addEventListener('click', async () => {
  if(loginError) loginError.textContent = '';
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();
  if (!email || !password) { loginError.textContent = 'Please enter email and password.'; return; }
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(`[ConvoQuest] Login failed: ${error.code}`);
    const map = {'auth/wrong-password': 'Incorrect password.', 'auth/user-not-found': 'No account with that email.'};
    loginError.textContent = map[error.code] || 'Login failed. Please try again.';
  }
});

if (logoutBtn) logoutBtn.addEventListener('click', () => signOut(auth));
if (showSignupBtn) showSignupBtn.addEventListener('click', () => {
  if(loginView) loginView.classList.add('hidden');
  if(signupView) signupView.classList.remove('hidden');
});
if (showLoginBtn) showLoginBtn.addEventListener('click', () => {
  if(signupView) signupView.classList.add('hidden');
  if(loginView) loginView.classList.remove('hidden');
});

// Chat UI & Modals
if(sendBtn) sendBtn.addEventListener('click', handleSendMessage);
if(chatInput) chatInput.addEventListener('keypress', e => { if(e.key === 'Enter') handleSendMessage(); });
if(micBtn) micBtn.addEventListener('click', () => {
    if (!recognition) return alert("Sorry, your browser doesn't support speech recognition.");
    if (isListening) return recognition.stop();
    try {
      recognition.start();
    } catch (e) {
      alert('Could not start speech recognition. Please check permissions.');
    }
});
if(hintBtn) hintBtn.addEventListener('click', showHint);
if(settingsBtn) settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
if(closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
if(closeMapBtn) closeMapBtn.addEventListener('click', () => mapModal.classList.add('hidden'));
if (closeCorrectionBtn) closeCorrectionBtn.addEventListener('click', () => correctionModal.classList.add('hidden'));
if(retakePlacementBtn) retakePlacementBtn.addEventListener('click', startPlacementTest);
if(dialectSelect) dialectSelect.addEventListener('change', (e) => updateSetting('dialect', e.target.value));
if(formalitySelect) formalitySelect.addEventListener('change', (e) => updateSetting('formality', e.target.value));
if(vignetteLangSelect) vignetteLangSelect.addEventListener('change', (e) => updateSetting('vignetteLanguage', e.target.value));

if (chatContainer) chatContainer.addEventListener('click', async e => {
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
        if (!word || !translationPopover) return;
        
        const show = (text) => {
            translationPopover.innerHTML = text;
            const containerRect = document.getElementById('app-container').getBoundingClientRect();
            const rect = target.getBoundingClientRect();
            let left = rect.left - containerRect.left + (rect.width / 2) - (translationPopover.offsetWidth / 2);
            let top = rect.top - containerRect.top - translationPopover.offsetHeight - 8;
            if (left < 8) left = 8;
            if (left + translationPopover.offsetWidth > containerRect.width - 8) left = containerRect.width - translationPopover.offsetWidth - 8;
            if (top < 8) top = rect.bottom - containerRect.top + 8;
            translationPopover.style.left = `${left}px`;
            translationPopover.style.top = `${top}px`;
            translationPopover.classList.remove('hidden');
        };

        if (translationCache.has(word)) return show(translationCache.get(word));
        if (localDictionary[word]) {
            translationCache.set(word, localDictionary[word]);
            return show(localDictionary[word]);
        }
        show('Translating...');
        const context = target.parentElement.textContent.trim();
        const trans = await AIManager.getTranslation(word, context);
        translationCache.set(word, trans);
        show(trans);
    }
});

if (explainRuleBtn) explainRuleBtn.addEventListener('click', async () => {
    const original = originalSentenceEl.textContent.slice(1, -1);
    const corrected = correctedSentenceEl.textContent.slice(1, -1);
    if (!original || !corrected || !explanationText) return;
    
    explainRuleBtn.textContent = 'Explaining...';
    const explanation = await AIManager.getGrammarExplanation(original, corrected);
    explanationText.textContent = explanation;
    if (explanationContainer) explanationContainer.classList.remove('hidden');
    explainRuleBtn.classList.add('hidden');
});

document.body.addEventListener('click', e => {
    if (!e.target.closest('.clickable-word, #translation-popover, #hint-btn, #hint-popover')) {
        if(translationPopover) translationPopover.classList.add('hidden');
        if(hintPopover) hintPopover.classList.add('hidden');
    }
}, true);

/* -------------------------- Initial Render -------------------------- */
renderQuests();

