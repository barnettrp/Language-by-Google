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
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_BUCKET", // use one consistent host (.appspot.com OR .firebasestorage.app)
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
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
