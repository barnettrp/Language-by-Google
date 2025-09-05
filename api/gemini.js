<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ConvoQuest</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- === FIREBASE CONFIGURATION === -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
        import { getFirestore, doc, setDoc, getDoc, serverTimestamp, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDxVns7LxAG2WMkuUu8JOfgx7bE-6MycBY",
            authDomain: "spanish-stt-project-470418.firebaseapp.com",
            projectId: "spanish-stt-project-470418",
            storageBucket: "spanish-stt-project-470418.appspot.com",
            messagingSenderId: "788393465858", 
            appId: "1:788393465858:web:ad0770073d59fa88a7af1b"
        };

        const app = initializeApp(firebaseConfig);
        window.firebaseInstances = { app, auth: getAuth(app), db: getFirestore(app) };
        window.firebaseFunctions = { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, doc, setDoc, getDoc, serverTimestamp, updateDoc, increment };
    </script>
    
    <style>
        body { font-family: 'Inter', sans-serif; background-image: url('https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=2070&auto=format&fit=crop'); background-size: cover; background-position: center; overflow: hidden; }
        .contained-area { background: rgba(255, 255, 255, 0.80); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); }
        .auth-input, #chat-input { font-size: 16px; }
        @keyframes pop-in { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .modal-content, .hint-popover, #translation-popover { animation: pop-in 0.3s ease-out forwards; }
        .chat-bubble { max-width: 75%; animation: pop-in 0.3s ease-out forwards; }
        .chat-bubble-user { background-color: #3b82f6; color: white; }
        .chat-bubble-ai { background-color: #f3f4f6; color: #1f2937; }
        #chat-container::-webkit-scrollbar, #placement-chat-container::-webkit-scrollbar { display: none; }
        #chat-container, #placement-chat-container { -ms-overflow-style: none; scrollbar-width: none; }
        .modal-bg { background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        .mic-active { color: #ef4444; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .map-location { cursor: pointer; transition: transform 0.2s; }
        .map-location:hover { transform: scale(1.1); }
    </style>
</head>
<body class="flex items-center justify-center h-screen p-0 md:p-4">

    <div id="app-container" class="w-full h-full md:max-w-lg md:h-[90vh] md:max-h-[700px] contained-area rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        <div id="auth-container" class="flex flex-col h-full p-6 justify-center"><!-- Auth HTML is unchanged --></div>
        
        <!-- NEW: Placement Test View -->
        <div id="placement-view" class="hidden flex-col h-full">
            <div id="placement-quiz-view" class="flex flex-col h-full p-6 justify-center text-center">
                <h1 class="text-2xl font-bold text-gray-800">Placement Test</h1>
                <p class="text-gray-600 mt-2 mb-6">Let's find the right starting point for you.</p>
                
                <div id="quiz-question-container">
                    <p class="text-lg mb-4">Read the sentence and answer the question:</p>
                    <p class="bg-gray-100 p-4 rounded-lg text-left mb-4 italic">"María va a la tienda a comprar pan."</p>
                    <p class="text-left font-semibold mb-2">Where is María going?</p>
                    <div id="quiz-options" class="space-y-2 text-left">
                        <label class="block p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"><input type="radio" name="quiz" value="a" class="mr-2"> The park</label>
                        <label class="block p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"><input type="radio" name="quiz" value="b" class="mr-2"> The store</label>
                        <label class="block p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"><input type="radio" name="quiz" value="c" class="mr-2"> Her house</label>
                    </div>
                </div>
                <button id="submit-quiz-btn" class="w-full bg-blue-500 text-white p-3 mt-6 rounded-md font-semibold hover:bg-blue-600 transition-colors">Next</button>
            </div>

            <div id="placement-chat-view" class="hidden flex-col h-full">
                 <header class="p-4 border-b border-gray-200/80 text-center flex-shrink-0">
                    <h1 class="text-xl font-bold text-gray-800">Let's Chat!</h1>
                    <p class="text-sm text-gray-500">Answer a few questions to complete your placement.</p>
                </header>
                <div id="placement-chat-container" class="flex flex-col-reverse flex-1 p-4 space-y-4 space-y-reverse overflow-y-auto"></div>
                <footer class="p-4 border-t border-gray-200/80 flex-shrink-0">
                    <div class="flex items-center space-x-2">
                        <input type="text" id="placement-chat-input" placeholder="Type your answer..." class="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <button id="placement-send-btn" class="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 transition-colors">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                    </div>
                </footer>
            </div>
        </div>

        <div id="main-app-view" class="hidden flex-col h-full"><!-- Main App HTML is unchanged --></div>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        const { auth, db } = window.firebaseInstances;
        const { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile, doc, setDoc, getDoc, serverTimestamp, updateDoc, increment } = window.firebaseFunctions;

        // ... (All other DOM references are here)
        const placementView = document.getElementById('placement-view');
        const placementQuizView = document.getElementById('placement-quiz-view');
        const submitQuizBtn = document.getElementById('submit-quiz-btn');
        const placementChatView = document.getElementById('placement-chat-view');
        const placementChatContainer = document.getElementById('placement-chat-container');
        const placementChatInput = document.getElementById('placement-chat-input');
        const placementSendBtn = document.getElementById('placement-send-btn');
        
        let placementMessages = [];

        const AIManager = {
            // ... (All other functions unchanged)
            async getPlacementResponse(history) {
                const mappedHistory = history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: m.parts }));
                const payload = { type: 'placement', history: mappedHistory };
                const response = await this.callAPI(payload);
                return response.text || response.error;
            },
            async analyzePlacement(transcript) {
                const payload = { type: 'placement-analysis', transcript };
                const response = await this.callAPI(payload);
                return response.text || "A1"; // Default to A1 on error
            }
        };
        
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUser = user;
                try {
                    const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
                    if (isNewUser) { 
                        // --- NEW: Show Placement Test for New Users ---
                        authContainer.style.display = 'none';
                        placementView.classList.remove('hidden');
                        placementView.classList.add('flex');
                    } else { 
                        await loadUserSettings(user.uid); 
                        showMainApp();
                    }
                } catch (error) { /* ... (Error handling) ... */ }
            } else { /* ... (Logout logic) ... */ }
        });

        const showMainApp = () => {
            welcomeMessage.textContent = `Welcome, ${currentUser.displayName || userSettings.name || 'Friend'}!`;
            authContainer.style.display = 'none';
            placementView.classList.add('hidden');
            mainAppView.classList.remove('hidden');
            mainAppView.classList.add('flex');
            questView.style.display = 'flex';
            chatView.classList.add('hidden');
            chatView.classList.remove('flex');
        };
        
        submitQuizBtn.addEventListener('click', () => {
            const selected = document.querySelector('input[name="quiz"]:checked');
            if (!selected) {
                alert("Please select an answer.");
                return;
            }
            // Simple logic: if they get it right, they start the chat.
            if (selected.value === 'b') {
                placementQuizView.classList.add('hidden');
                placementChatView.classList.remove('hidden');
                placementChatView.classList.add('flex');
                addPlacementMessage("¡Hola! Mucho gusto. ¿Cómo te llamas?", 'ai');
            } else {
                alert("Not quite! Let's start with the basics.");
                saveUserSettings(currentUser.uid, { proficiencyLevel: 'A1' }).then(showMainApp);
            }
        });
        
        const addPlacementMessage = (text, role) => { /* ... (Similar to addMessage) ... */ };
        
        const handlePlacementSend = async () => {
            const userInput = placementChatInput.value.trim();
            if (!userInput) return;
            addPlacementMessage(userInput, 'user');
            placementChatInput.value = '';
            
            // End after 2 user messages (4 total messages)
            if (placementMessages.length >= 4) {
                addPlacementMessage("¡Gracias! Analizando tu nivel...", 'ai');
                const transcript = placementMessages.map(m => `${m.role}: ${m.parts[0].text}`).join('\n');
                const level = await AIManager.analyzePlacement(transcript);
                await saveUserSettings(currentUser.uid, { proficiencyLevel: level });
                alert(`Great, we've placed you at level: ${level}. Let's get started!`);
                showMainApp();
            } else {
                const response = await AIManager.getPlacementResponse(placementMessages);
                addPlacementMessage(response, 'ai');
            }
        };

        placementSendBtn.addEventListener('click', handlePlacementSend);
        placementChatInput.addEventListener('keypress', (e) => e.key === 'Enter' && handlePlacementSend());

        // ... (The rest of the complete and final JavaScript is here)
    });
    </script>
</body>
</html>

