/* =============================
File: /firebase-init.js
Single source of truth for Firebase web init (Auth + Firestore)
============================= */

// Use ES module imports from the Firebase CDN
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ---- Your Firebase project (as provided) ----
const firebaseConfig = {
apiKey: "AIzaSyDxVns7LxAG2WMkuUu8JOfgx7bE-6MycBY",
authDomain: "spanish-ai-project.firebaseapp.com",
projectId: "spanish-ai-project",
storageBucket: "spanish-ai-project.firebasestorage.app",
messagingSenderId: "788393465858",
appId: "1:788393465858:web:ad0770073d59fa88a7af1b"
};

// ---- Initialize once; reuse if already created ----
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Optional but recommended: persist sessions in the browser
setPersistence(auth, browserLocalPersistence).catch((e) => {
console.warn('Auth persistence warning:', e?.message || e);
});

// Tiny status hook to flip UI and update the debug ribbon
onAuthStateChanged(auth, (user) => {
try {
document.body.classList.toggle('signed-in', !!user);
const ribbon = document.getElementById('debug-ribbon');
if (ribbon) ribbon.textContent = user ? `Signed in: ${user.email}` : 'Not signed in';
} catch (_) {}
});

// Expose for other modules (and handy for quick console debugging)
window.firebaseBits = { app, auth, db };
export { app, auth, db };
