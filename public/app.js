// --- Add this helper near your other helpers ---
async function handleSignedInUser(user) {
  window.__setRibbon && window.__setRibbon('Auth state: handling user...');
  console.log('[ConvoQuest] handleSignedInUser start', { uid: user?.uid });

  if (!user) {
    // Signed out
    console.log('[ConvoQuest] No user (signed out)');
    window.__setRibbon && window.__setRibbon('Auth state: signed out');
    currentUser = null;
    authContainer.style.display = 'flex';
    placementView.classList.add('hidden');
    signupView?.classList.add('hidden');
    loginView?.classList.remove('hidden');
    mainAppView.classList.add('hidden');
    mainAppView.classList.remove('flex');
    return;
  }

  try {
    currentUser = user;
    const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;
    console.log('[ConvoQuest] Signed in. isNewUser=', isNewUser);
    window.__setRibbon && window.__setRibbon('Auth state: signed in');

    if (isNewUser && signupName) {
      userSettings = await setupNewUser(user);
      console.log('[ConvoQuest] New user initialized.');
    }

    await loadUserSettings(user.uid);
    console.log('[ConvoQuest] Settings loaded', userSettings);

    if (!userSettings.proficiencyLevel) {
      startPlacementTest(); // hides auth, shows placement
      console.log('[ConvoQuest] Started placement test.');
      window.__setRibbon && window.__setRibbon('UI: placement');
    } else {
      showMainApp(); // hides auth, shows main app
      console.log('[ConvoQuest] Showing main app.');
      window.__setRibbon && window.__setRibbon('UI: main app');
    }
  } catch (error) {
    console.error('CRITICAL ERROR during user setup/load:', error);
    window.__setRibbon && window.__setRibbon('Auth state: error (showing main)');
    alert('A critical error occurred while loading your profile. Please check the console for details.');
    showMainApp();
  }
}

// --- Replace your onAuthStateChanged with this ---
onAuthStateChanged(auth, async (user) => {
  console.log('[ConvoQuest] onAuthStateChanged fired', { hasUser: !!user });
  window.__setRibbon && window.__setRibbon('Auth state: event fired');
  await handleSignedInUser(user);
});

// --- Replace your Login click handler with this ---
loginBtn?.addEventListener('click', async () => {
  window.__setRibbon && window.__setRibbon('Click: Login button');
  console.log('[ConvoQuest] Login button clicked');

  loginError.textContent = '';
  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value.trim();
  if (!email || !password) { loginError.textContent = 'Please enter an email and password.'; return; }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('[ConvoQuest] signInWithEmailAndPassword resolved', { uid: cred.user?.uid });
    window.__setRibbon && window.__setRibbon('Auth: success (post-login UI)');
    // Fallback: flip UI immediately in case the listener is delayed
    await handleSignedInUser(auth.currentUser || cred.user);
  } catch (error) {
    console.error('[ConvoQuest] Login error:', error);
    window.__setRibbon && window.__setRibbon('Auth: error ' + (error?.code || 'unknown'));
    const map = {
      'auth/invalid-email': 'That email looks invalid.',
      'auth/user-disabled': 'This account is disabled.',
      'auth/user-not-found': 'No account with that email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/operation-not-allowed': 'Email/password sign-in is not enabled.'
    };
    const code = error?.code || '';
    loginError.textContent = map[code] || (error?.message || 'Login failed.');
  }
});
