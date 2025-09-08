// public/app.js
const { auth } = window.firebaseInstances;
const {
  GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut,
} = window.firebaseAuthHelpers;

const googleBtn   = document.getElementById("googleSignIn");
const emailForm   = document.getElementById("emailForm");
const registerBtn = document.getElementById("emailRegister");
const signOutBtn  = document.getElementById("signOut");
const errorBox    = document.getElementById("authError");

function showError(msg){ if (errorBox){ errorBox.textContent = msg; errorBox.style.display = "block"; } }
function clearError(){ if (errorBox){ errorBox.textContent = ""; errorBox.style.display = "none"; } }

googleBtn?.addEventListener("click", async () => {
  clearError();
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (err) { showError(err.message); console.error("Google sign-in failed:", err); }
});

emailForm?.addEventListener("submit", async (e) => {
  e.preventDefault(); clearError();
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;
  if (!email || !password) return showError("Email and password required");
  try { await signInWithEmailAndPassword(auth, email, password); }
  catch (err) { showError(err.message); console.error("Email sign-in failed:", err); }
});

registerBtn?.addEventListener("click", async () => {
  clearError();
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;
  if (!email || !password) return showError("Email and password required");
  try { await createUserWithEmailAndPassword(auth, email, password); }
  catch (err) { showError(err.message); console.error("Email registration failed:", err); }
});

signOutBtn?.addEventListener("click", async () => {
  clearError();
  try { await signOut(auth); }
  catch (err) { showError(err.message); console.error("Sign-out failed:", err); }
});
