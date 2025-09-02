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
        .modal-content { animation: pop-in 0.3s ease-out forwards; }
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
        .map-location.locked { filter: grayscale(1) brightness(0.7); cursor: not-allowed; }
    </style>
</head>
<body class="flex items-center justify-center h-screen p-0 md:p-4">

    <div id="app-container" class="w-full h-full md:max-w-lg md:h-[90vh] md:max-h-[700px] contained-area rounded-none md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <!-- The HTML structure is unchanged. All changes are in the script below. -->
        <div id="auth-container"><!-- ... --></div>
        <div id="main-app-view" class="hidden flex-col h-full"><!-- ... --></div>
    </div>
    
    <script>
    document.addEventListener('DOMContentLoaded', () => {
        // ... (Firebase and DOM setup is unchanged)

        // --- AIManager with CORRECTED data structure ---
        const AIManager = {
            async callAPI(payload) {
                try {
                    const response = await fetch('/api/gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (!response.ok) { return { error: "Sorry, I encountered an error." }; }
                    return await response.json();
                } catch (error) { return { error: "Sorry, I couldn't connect to the AI." }; }
            },
            // --- UPDATED: Sends stage and settings separately ---
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
            // ... (Other AIManager functions are unchanged)
        };

        // --- UPDATED: handleSendMessage now passes userSettings correctly ---
        const handleSendMessage = async () => {
            const userInput = chatInput.value.trim();
            if (!userInput) return;
            addMessage(userInput, 'user');
            chatInput.value = '';
            addTypingIndicator();
            // Pass currentStage and userSettings
            const response = await AIManager.getResponse(messages.slice(-6), currentStage, userSettings);
            removeTypingIndicator();
            addMessage(response, 'ai');
        };

        // ... (The rest of the complete JavaScript is unchanged but included)
    });
    </script>
</body>
</html>

