// public/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ⬇️ Paste your real config here (from Firebase Console → Project settings → Your apps → Config)
const firebaseConfig = {
  apiKey: "AIzaSyCSITfE-dJD-uBK4sXb4_mJlkquiT4YKg0",
  authDomain: "ai-span-lang.firebaseapp.com",
  projectId: "ai-span-lang",
  storageBucket: "ai-span-lang.firebasestorage.app",
  messagingSenderId: "259630637016",
  appId: "1:259630637016:web:a27e9b16a1f57573379cad"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

window.firebaseInstances = { app, auth, db, storage };
window.firebaseAuthHelpers = {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
};

function setSignedInUI(user) {
  document.body.classList.remove("signed-out");
  document.body.classList.add("signed-in");
  window.currentUser = user;
}
function setSignedOutUI() {
  document.body.classList.remove("signed-in");
  document.body.classList.add("signed-out");
  window.currentUser = null;
}

onAuthStateChanged(auth, (user) => (user ? setSignedInUI(user) : setSignedOutUI()));
