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
  apiKey: "AIzaSyDxVns7LxAG2WMkuUu8JOfgx7bE-6MycBY",
  authDomain: "spanish-ai-project.firebaseapp.com",
  projectId: "spanish-ai-project",
  storageBucket: "spanish-ai-project.firebasestorage.app",
  messagingSenderId: "788393465858",
  appId: "1:788393465858:web:ad0770073d59fa88a7af1b"
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
