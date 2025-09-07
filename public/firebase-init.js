// public/firebase-init.js
// Centralized Firebase init. No inline duplicates in index.html.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

/**
 * IMPORTANT:
 * - Replace the firebaseConfig below with your actual project config (from Firebase Console).
 * - Ensure storageBucket uses ONE consistent host for your project:
 *     EITHER "...appspot.com" OR "...firebasestorage.app"
 *   Do not mix both forms in different files.
 */
const firebaseConfig = {
  apiKey:        "PASTE_YOURS",
  authDomain:    "PASTE_YOURS",
  projectId:     "PASTE_YOURS",
  storageBucket: "PASTE_YOURS", // e.g., "your-project.firebasestorage.app" OR "your-project.appspot.com"
  messagingSenderId: "PASTE_YOURS",
  appId:         "PASTE_YOURS",
};

// --- Initialize once ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Expose minimal helpers for app.js
window.firebaseInstances = { app, auth, db, storage };
window.firebaseAuthHelpers = {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
};

// UI helpers
function setSignedInUI(user) {
  document.body.classList.remove("signed-out");
  document.body.classList.add("signed-in");
  // Optionally attach user-global for debugging:
  window.currentUser = user;
}
function setSignedOutUI() {
  document.body.classList.remove("signed-in");
  document.body.classList.add("signed-out");
  window.currentUser = null;
}

// Single source of truth for auth-driven UI flip
onAuthStateChanged(auth, (user) => {
  if (user) setSignedInUI(user);
  else setSignedOutUI();
});
