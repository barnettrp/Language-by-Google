// firebaseHelpers.js - Safe Firebase operations that handle missing configuration
import { db, getFirebaseConfigStatus } from './firebase.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Safely executes setDoc with error handling for missing Firebase configuration
 * @param {DocumentReference} ref - Firestore document reference
 * @param {object} data - Data to set
 * @param {object} options - Optional setDoc options
 * @returns {Promise<boolean>} - Success status
 */
export async function safeSetDoc(ref, data, options = {}) {
  if (!db) {
    const configStatus = getFirebaseConfigStatus();
    console.error('[FirebaseHelpers] Cannot save data: Firestore not configured', configStatus.error);
    
    // Update configuration banner if it exists
    updateConfigurationBanner('Cannot save data - Firebase not configured');
    
    return false;
  }

  try {
    await setDoc(ref, data, options);
    return true;
  } catch (error) {
    console.error('[FirebaseHelpers] Error saving data:', error);
    
    // Update configuration banner with error info
    updateConfigurationBanner(`Save failed: ${error.message}`);
    
    return false;
  }
}

/**
 * Safely executes getDoc with error handling for missing Firebase configuration
 * @param {DocumentReference} ref - Firestore document reference
 * @returns {Promise<DocumentSnapshot|null>} - Document snapshot or null on error
 */
export async function safeGetDoc(ref) {
  if (!db) {
    const configStatus = getFirebaseConfigStatus();
    console.error('[FirebaseHelpers] Cannot load data: Firestore not configured', configStatus.error);
    
    // Update configuration banner if it exists
    updateConfigurationBanner('Cannot load data - Firebase not configured');
    
    return null;
  }

  try {
    return await getDoc(ref);
  } catch (error) {
    console.error('[FirebaseHelpers] Error loading data:', error);
    
    // Update configuration banner with error info
    updateConfigurationBanner(`Load failed: ${error.message}`);
    
    return null;
  }
}

/**
 * Updates the configuration banner with error messages
 * @param {string} message - Error message to display
 */
function updateConfigurationBanner(message) {
  const banner = document.getElementById('firebase-config-banner');
  if (banner) {
    const messageEl = banner.querySelector('.banner-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }
}