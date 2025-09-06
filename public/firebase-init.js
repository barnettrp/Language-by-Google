// public/firebase-init.js  (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, increment
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: replace with YOUR project's values (from Firebase console)
const firebaseConfig = {
  apiKey:        "…",
  authDomain:    "…",   // looks like myapp.firebaseapp.com
  projectId:     "…",
  storageBucket: "…",
  messagingSenderId: "…",
  appId:         "…"
};

const app = initializeApp(firebaseConfig);

// EXPOSE to window for app.js (non-module) to consume.
window.firebaseInstances = {
  app,
  auth: getAuth(app),
  db: getFirestore(app)
};

window.firebaseFunctions = {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  doc, setDoc, getDoc, updateDoc, serverTimestamp, increment
};
