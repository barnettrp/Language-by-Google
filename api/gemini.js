<!DOCTYPE html>
const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
if (isNewUser && signupName) {
userSettings = await setupNewUser(user);
} else {
await loadUserSettings(user.uid);
}
if (!userSettings.proficiencyLevel) {
startPlacementTest();
} else {
showMainApp();
}
} catch (error) {
console.error("CRITICAL ERROR during user setup/load:", error);
alert("A critical error occurred while loading your profile. Please check the console for details.");
showMainApp();
}
} else {
currentUser = null;
authContainer.style.display = 'flex';
placementView.classList.add('hidden');
signupView.classList.add('hidden');
loginView.classList.remove('hidden');
mainAppView.classList.add('hidden');
mainAppView.classList.remove('flex');
}
});

// ===== Speech =====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'es-ES';
recognition.interimResults = false;
recognition.onstart = () => { isListening = true; micBtn.classList.add('mic-active'); };
recognition.onresult = (event) => { chatInput.value = event.results[0][0].transcript; };
recognition.onerror = (event) => { console.error("Speech recognition error:", event.error); alert(`Speech recognition error: ${event.error}. Please ensure microphone access is allowed.`); };
recognition.onend = () => { isListening = false; micBtn.classList.remove('mic-active'); };
}

const speak = (textToSpeak) => {
if ('speechSynthesis' in window) {
const utterance = new SpeechSynthesisUtterance(textToSpeak);
utterance.lang = 'es-ES';
utterance.rate = 0.9;
window.speechSynthesis.cancel();
window.speechSynthesis.speak(utterance);
} else { alert("Sorry, your browser doesn't support text-to-speech."); }
};

// ===== AI Manager =====
const AIManager = {
async callAPI(payload) {
try {
const response = await fetch('/api/gemini', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(payload)
});
const result = await response.json();
if (!response.ok) return { error: result.error || 'Sorry, an unknown error occurred.' };
return result;
} catch (error) { return { error: "Sorry, I couldn't connect to the server." }; }
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
return response.text || "NO";
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
const mappedHistory = history.map(m => ({ role: m.role ===
