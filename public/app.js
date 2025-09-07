// public/app.js
// Handles UI button clicks, delegates auth work to firebase-init.js

// Pull in exposed Firebase objects from firebase-init.js
const { auth } = window.firebaseInstances;
const {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} = window.firebaseAuthHelpers;

// Grab UI elements
const googleBtn   = document.getElementById("googleSignIn");
const emailForm   = document.getElementById("emailForm");
const emailBtn    = document.getElementById("emailSignIn");
const registerBtn = document.getElementById("emailRegister");
const signOutBtn  = document.getElementById("signOut");
const errorBox    = document.getElementById("authError");

// Utility: show error
function showError(msg) {
  if (!errorBox) return;
  errorBox.textContent = msg;
  errorBox.style.display = "block";
}

// Utility: clear error
function clearError() {
  if (!errorBox) return;
  errorBox.textContent = "";
  errorBox.style.display = "none";
}

// --- Event Handlers ---

// Google sign-in
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    clearError();
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      showError(err.message);
      console.error("Google sign-in failed:", err);
    }
  });
}

// Email/password sign-in (form submit)
if (emailForm) {
  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;
    if (!email || !password) {
      showError("Email and password required");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      showError(err.message);
      console.error("Email sign-in failed:", err);
    }
  });
}

// Email account creation
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    clearError();
    const email = document.getElementById("email")?.value;
    const password = document.getElementById("password")?.value;
    if (!email || !password) {
      showError("Email and password required");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      showError(err.message);
      console.error("Email registration failed:", err);
    }
  });
}

// Sign out
if (signOutBtn) {
  signOutBtn.addEventListener("click", async () => {
    clearError();
    try {
      await signOut(auth);
    } catch (err) {
      showError(err.message);
      console.error("Sign-out failed:", err);
    }
  });
}
