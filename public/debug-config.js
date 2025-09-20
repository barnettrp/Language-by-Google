import { getFirebaseConfigStatus } from './firebase.js';

// Snapshot of relevant env vars; these are not secrets (VITE_* are client-exposed)
const envSnapshot = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Get Firebase configuration status
const firebaseConfig = getFirebaseConfigStatus();

// Export debug information
export { envSnapshot, firebaseConfig };

// Console debugging for immediate inspection
console.log('[Debug Config] Environment Snapshot:', envSnapshot);
console.log('[Debug Config] Firebase Config Status:', firebaseConfig);
