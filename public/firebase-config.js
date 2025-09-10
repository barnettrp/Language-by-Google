// --- PASTE YOUR FIREBASE CONFIGURATION OBJECT ONCE AND FOR ALL ---
// This file will hold your secret keys. The main index.html file will load this automatically.
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};

// Make the config available to other scripts
window.firebaseConfig = firebaseConfig;
