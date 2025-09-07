/* =============================
File: /firebase-init.js
Single source of truth for Firebase web init (Auth + Firestore)
============================= */

// Use ES module imports from the Firebase CDN
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { 
    getAuth, 
    setPersistence, 
    browserLocalPersistence, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { 
    getFirestore,
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    serverTimestamp, 
    increment 
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// ---- Your Firebase project configuration ----
const firebaseConfig = {
    apiKey: "AIzaSyDxVns7LxAG2WMkuUu8JOfgx7bE-6MycBY",
    authDomain: "spanish-ai-project.firebaseapp.com",
    projectId: "spanish-ai-project",
    storageBucket: "spanish-ai-project.appspot.com", // CORRECTED DOMAIN
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

// Expose instances for app.js to consume
window.firebaseInstances = { app, auth, db };

// Expose functions for app.js to consume
window.firebaseFunctions = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  doc, setDoc, getDoc, serverTimestamp, updateDoc, increment
};

export { app, auth, db };

