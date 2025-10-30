// firebase.js - Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Support both Vite environment variables (for production build)
// and window variables (for dev-server.js)
const firebaseConfig = {
  apiKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || window.__FIREBASE_CONFIG__?.apiKey,
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || window.__FIREBASE_CONFIG__?.authDomain,
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || window.__FIREBASE_CONFIG__?.projectId,
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || window.__FIREBASE_CONFIG__?.storageBucket,
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || window.__FIREBASE_CONFIG__?.messagingSenderId,
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || window.__FIREBASE_CONFIG__?.appId,
};

// Validate Firebase configuration
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter(
  key => !firebaseConfig[key] || firebaseConfig[key] === 'undefined'
);

let app, auth, db;
let configurationError = null;

if (missingConfig.length > 0) {
  const missingVars = missingConfig.map(
    key => `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`
  );
  configurationError = {
    type: 'missing_variables',
    missingFields: missingConfig,
    missingEnvVars: missingVars,
    message: `Missing Firebase configuration: ${missingConfig.join(', ')}`,
  };

  console.error('[ConvoQuest] Missing Firebase configuration:', missingConfig);
  console.error('[ConvoQuest] Missing environment variables:', missingVars);
  console.error(
    '[ConvoQuest] Please check your environment variables and ensure they are properly set.'
  );

  // Export null instances to indicate configuration failure
  app = null;
  auth = null;
  db = null;
} else {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    console.log('[ConvoQuest] Firebase initialized successfully');
  } catch (error) {
    configurationError = {
      type: 'initialization_failed',
      error: error.message,
      message: `Firebase initialization failed: ${error.message}`,
    };

    console.error('[ConvoQuest] Firebase initialization failed:', error);
    app = null;
    auth = null;
    db = null;
  }
}

export { app, auth, db };

// Export a function to check if Firebase is configured
export function isFirebaseConfigured() {
  return app !== null && auth !== null && db !== null;
}

// Export detailed configuration status for debugging
export function getFirebaseConfigStatus() {
  if (configurationError) {
    return {
      configured: false,
      error: configurationError,
      config: {
        apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
        authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing',
        projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
        storageBucket: firebaseConfig.storageBucket ? '✓ Set' : '✗ Missing',
        messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Set' : '✗ Missing',
        appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing',
      },
    };
  }

  return {
    configured: true,
    config: {
      apiKey: '✓ Set',
      authDomain: '✓ Set',
      projectId: '✓ Set',
      storageBucket: '✓ Set',
      messagingSenderId: '✓ Set',
      appId: '✓ Set',
    },
  };
}
