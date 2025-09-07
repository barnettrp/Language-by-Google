/* =============================
File: /public/firebase-init.js
Single source of truth for Firebase web init (Auth + Firestore)
============================= */

// Use ES module imports from the Firebase CDN
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged,
    // ADDED: Functions needed by app.js
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
    getFirestore,
    // ADDED: Functions needed by app.js
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    increment
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ---- Your Firebase project config ----
const firebaseConfig = {
    apiKey: "AIzaSyDxVns7LxAG2WMkuUu8JOfgx7bE-6MycBY",
    authDomain: "spanish-ai-project.firebaseapp.com",
    projectId: "spanish-ai-project",
    storageBucket: "spanish-ai-project.appspot.com",
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
        const isSignedIn = !!user;
        document.body.classList.toggle('signed-in', isSignedIn);
        document.body.classList.toggle('signed-out', !isSignedIn);

        const ribbon = document.getElementById('debug-ribbon');
        if (ribbon) {
            ribbon.textContent = user ? `Signed in: ${user.email}` : 'Not signed in';
        }
    } catch (err) {
        console.error("Error in onAuthStateChanged UI update:", err);
    }
});


// Expose instances for app.js (and handy for quick console debugging)
// This object is what app.js looks for.
window.firebaseInstances = { app, auth, db };

// Expose functions for app.js
// This object is also what app.js looks for.
window.firebaseFunctions = {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  doc, setDoc, getDoc, updateDoc, serverTimestamp, increment
};

// Export for potential use in other ES modules
export { app, auth, db };
