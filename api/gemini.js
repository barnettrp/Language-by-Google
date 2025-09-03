<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ConvoQuest</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Firebase Configuration -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
        import { getFirestore, doc, setDoc, getDoc, serverTimestamp, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDxVns7LxAG2WMkuUu8JOfgx7bE-6MycBY",
            authDomain: "spanish-ai-project.firebaseapp.com",
            projectId: "spanish-ai-project",
            storageBucket: "spanish-ai-project.appspot.com",
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
        .modal-content, .hint-popover { animation: pop-in 0.3s ease-out forwards; }
        .chat-bubble { max-width: 75%; animation: pop-in 0.3s ease-out forwards; }
        .chat-bubble-user { background-color: #3b82f6; color: white; }
        .chat-bubble-ai { background-color: #f3f4f6; color: #1f2937; }
        #chat-container::-webkit-scrollbar { display: none; }
        #chat-container { -ms-overflow-style: none; scrollbar-width: none; }
        .modal-bg { background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
        .mic-active { color: #ef4444; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .map-location { cursor: pointer; transition: transform 0.2s; }
        .map-location:hover { transform: scale(1.1); }
    </style>
</head>
<body class="flex items-center justify-center h-screen p-0 md:p-4">

    <div id="app-container" class="w-full h-full md:max-w-lg md:h-[90vh] md:max-h-[700px] contained-area rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        <!-- Auth and Main App Views (HTML structure is unchanged) -->
        <div id="auth-container"><!-- ... --></div>
        
        <div id="main-app-view" class="hidden flex-col h-full">
            <div id="quest-view"><!-- ... --></div>
            <div id="chat-view" class="hidden flex-col h-full">
                <!-- Header is unchanged -->
                <div id="chat-container" class="flex flex-col-reverse flex-1 p-4 space-y-4 space-y-reverse overflow-y-auto"></div>
                <div id="translation-popover" class="hidden absolute bg-black text-white text-xs rounded py-1 px-2 z-10 shadow-lg text-center"></div>
                
                <!-- NEW: Hint Popover -->
                <div id="hint-popover" class="hidden absolute bottom-20 left-1/2 -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg cursor-pointer hint-popover z-10">
                    <p class="text-sm text-gray-700"></p>
                </div>

                <footer class="p-4 border-t border-gray-200/80 flex-shrink-0">
                    <div class="flex items-center space-x-2">
                        <!-- NEW: Hint Button Added -->
                        <button id="hint-btn" class="text-gray-500 hover:text-yellow-500 rounded-full p-3 transition-colors">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </button>
                        <input type="text" id="chat-input" placeholder="Type or tap the mic..." class="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <button id="mic-btn" class="text-gray-500 hover:text-blue-500 rounded-full p-3 transition-colors">
                            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" /><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a2 2 0 114 0v1a2 2 0 11-4 0v-1zm14-1a2 2 0 10-4 0v1a2 2 0 104 0v-1z" clip-rule="evenodd" /></svg>
                        </button>
                        <button id="send-btn" class="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 transition-colors">
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        </button>
                    </div>
                </footer>
            </div>
            
            <!-- All modals are unchanged -->
        </div>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // ... (Firebase and DOM setup is unchanged)
        const hintBtn = document.getElementById('hint-btn');
        const hintPopover = document.getElementById('hint-popover');
        
        const AIManager = {
            // ... (getResponse, validateObjective, etc. are unchanged)
            
            // --- NEW: Function to get a hint ---
            async getHint(history, stage) {
                const mappedHistory = history.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: m.parts }));
                const payload = { type: 'hint', history: mappedHistory, stage };
                const response = await this.callAPI(payload);
                return response.text || "Try asking a question."; // Fallback hint
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

        // --- EVENT LISTENERS ---
        hintBtn.addEventListener('click', showHint);
        
        hintPopover.addEventListener('click', () => {
            const hintText = hintPopover.querySelector('p').textContent;
            if (hintText && hintText !== 'Getting hint...') {
                chatInput.value = hintText;
                hintPopover.classList.add('hidden');
                chatInput.focus();
            }
        });

        // Hide hint popover when clicking elsewhere
        document.body.addEventListener('click', (e) => {
            if (!hintBtn.contains(e.target) && !hintPopover.contains(e.target)) {
                hintPopover.classList.add('hidden');
            }
        }, true);
        
        // ... (The rest of the complete and final JavaScript is here)
    });
    </script>
</body>
</html>

