// firebase.js - Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
const requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key] || firebaseConfig[key] === 'undefined');

let app, auth, db;

if (missingConfig.length > 0) {
  console.error('[ConvoQuest] Missing Firebase configuration:', missingConfig);
  console.error('[ConvoQuest] Please check your environment variables and ensure they are properly set.');
  
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