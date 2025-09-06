// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  onAuthStateChanged, signOut, updateProfile 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, doc, setDoc, getDoc, 
  serverTimestamp, updateDoc, increment 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ⬇️ Replace this entire object with the config shown in Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCSITfE-dJD-uBK4sXb4_mJlkquiT4YKg0",
  authDomain: "ai-span-lang.firebaseapp.com",
  projectId: "ai-span-lang",
  storageBucket: "ai-span-lang.firebasestorage.app",
  messagingSenderId: "259630637016",
  appId: "1:259630637016:web:a27e9b16a1f57573379cad"
};

// Initialize
const app = initializeApp(firebaseConfig);

// Expose to window so your other scripts can use it
window.firebaseInstances = { app, auth: getAuth(app), db: getFirestore(app) };
window.firebaseFunctions = { 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, 
  signOut, updateProfile, doc, setDoc, getDoc, serverTimestamp, updateDoc, increment 
};
