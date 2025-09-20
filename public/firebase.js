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

// Check for missing or placeholder values
const isPlaceholder = (value) => {
  if (!value || value === 'undefined') return true;
  
  // Specific placeholder values from .env.example
  const placeholderValues = [
    'your-firebase-api-key',
    'your-project.firebaseapp.com',
    'your-project-id',
    'your-project.appspot.com',
    '123456789',
    '1:123456789:web:your-app-id'
  ];
  
  return placeholderValues.includes(value);
};

const missingConfig = requiredConfig.filter(key => isPlaceholder(firebaseConfig[key]));

let app, auth, db;
let configurationError = null;

if (missingConfig.length > 0) {
  const missingVars = missingConfig.map(key => `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
  configurationError = {
    type: 'missing_variables',
    missingFields: missingConfig,
    missingEnvVars: missingVars,
    message: `Firebase configuration contains placeholder values: ${missingConfig.join(', ')}. Please replace with actual Firebase project credentials.`
  };
  
  console.error('[ConvoQuest] Firebase configuration contains placeholder values:', missingConfig);
  console.error('[ConvoQuest] Environment variables with placeholder values:', missingVars);
  console.error('[ConvoQuest] Please replace placeholder values with actual Firebase project credentials from your Firebase Console.');
  
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
      message: `Firebase initialization failed: ${error.message}`
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
  const getConfigStatus = (value) => {
    if (!value || value === 'undefined') return '✗ Missing';
    if (isPlaceholder(value)) return '⚠️ Placeholder';
    return '✓ Set';
  };

  if (configurationError) {
    return {
      configured: false,
      error: configurationError,
      config: {
        apiKey: getConfigStatus(firebaseConfig.apiKey),
        authDomain: getConfigStatus(firebaseConfig.authDomain),
        projectId: getConfigStatus(firebaseConfig.projectId),
        storageBucket: getConfigStatus(firebaseConfig.storageBucket),
        messagingSenderId: getConfigStatus(firebaseConfig.messagingSenderId),
        appId: getConfigStatus(firebaseConfig.appId)
      }
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
      appId: '✓ Set'
    }
  };
}