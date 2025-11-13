/**
 * ConvoQuest - Relationship System
 *
 * Handles character relationship tracking, affinity calculations,
 * and Firestore integration for the relationship system.
 */

import { db } from './firebase.js';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Initialize or get user's relationship data from Firestore
 */
export async function getUserRelationships(userId) {
  try {
    const relationshipsRef = doc(db, 'users', userId, 'gameData', 'relationships');
    const relationshipsDoc = await getDoc(relationshipsRef);

    if (relationshipsDoc.exists()) {
      return relationshipsDoc.data().characters || {};
    }

    // Initialize empty relationships if none exist
    return {};
  } catch (error) {
    console.error('Error fetching user relationships:', error);
    return {};
  }
}

/**
 * Initialize a new relationship with a character
 */
export async function initializeRelationship(userId, characterId) {
  try {
    const relationshipsRef = doc(db, 'users', userId, 'gameData', 'relationships');
    const relationshipsDoc = await getDoc(relationshipsRef);

    const currentRelationships = relationshipsDoc.exists()
      ? (relationshipsDoc.data().characters || {})
      : {};

    // Don't reinitialize if already exists
    if (currentRelationships[characterId]) {
      return currentRelationships[characterId];
    }

    // Create new relationship
    const newRelationship = {
      characterId: characterId,
      affinity: 0,
      level: 'stranger',
      firstMet: new Date().toISOString(),
      lastContact: new Date().toISOString(),
      conversationCount: 0,
      questsCompleted: [],
      giftsGiven: [],
      factsLearned: [],
      unlockedContent: [],
      specialMoments: []
    };

    currentRelationships[characterId] = newRelationship;

    await setDoc(relationshipsRef, {
      characters: currentRelationships,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log(`✅ Initialized relationship with ${characterId}`);
    return newRelationship;
  } catch (error) {
    console.error('Error initializing relationship:', error);
    return null;
  }
}

/**
 * Update character affinity
 */
export async function updateAffinity(userId, characterId, affinityChange, reason = '') {
  try {
    const relationshipsRef = doc(db, 'users', userId, 'gameData', 'relationships');
    const relationshipsDoc = await getDoc(relationshipsRef);

    if (!relationshipsDoc.exists()) {
      console.error('No relationships data found');
      return null;
    }

    const relationships = relationshipsDoc.data().characters || {};
    const currentRelationship = relationships[characterId];

    if (!currentRelationship) {
      console.error(`No relationship found for character ${characterId}`);
      return null;
    }

    // Calculate new affinity (capped at 0-100)
    const oldAffinity = currentRelationship.affinity || 0;
    const newAffinity = Math.max(0, Math.min(100, oldAffinity + affinityChange));

    // Determine if level changed
    const oldLevel = getRelationshipLevelName(oldAffinity);
    const newLevel = getRelationshipLevelName(newAffinity);
    const levelChanged = oldLevel !== newLevel;

    // Update relationship
    currentRelationship.affinity = newAffinity;
    currentRelationship.level = newLevel;
    currentRelationship.lastContact = new Date().toISOString();

    // Log the affinity change
    if (!currentRelationship.affinityHistory) {
      currentRelationship.affinityHistory = [];
    }
    currentRelationship.affinityHistory.push({
      timestamp: new Date().toISOString(),
      change: affinityChange,
      oldValue: oldAffinity,
      newValue: newAffinity,
      reason: reason
    });

    // Save to Firestore
    relationships[characterId] = currentRelationship;
    await setDoc(relationshipsRef, {
      characters: relationships,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log(`✅ Updated affinity for ${characterId}: ${oldAffinity} → ${newAffinity} (${affinityChange > 0 ? '+' : ''}${affinityChange}) - ${reason}`);

    return {
      oldAffinity,
      newAffinity,
      affinityChange,
      levelChanged,
      oldLevel,
      newLevel,
      reason
    };
  } catch (error) {
    console.error('Error updating affinity:', error);
    return null;
  }
}

/**
 * Record a conversation with a character
 */
export async function recordConversation(userId, characterId, questId = null) {
  try {
    const relationshipsRef = doc(db, 'users', userId, 'gameData', 'relationships');
    const relationshipsDoc = await getDoc(relationshipsRef);

    if (!relationshipsDoc.exists()) {
      // Initialize relationship if it doesn't exist
      await initializeRelationship(userId, characterId);
    }

    const relationships = (await getDoc(relationshipsRef)).data().characters || {};
    const relationship = relationships[characterId];

    if (!relationship) {
      console.error(`No relationship found for ${characterId}`);
      return;
    }

    // Increment conversation count
    relationship.conversationCount = (relationship.conversationCount || 0) + 1;
    relationship.lastContact = new Date().toISOString();

    // Add to conversation history
    if (!relationship.conversationHistory) {
      relationship.conversationHistory = [];
    }
    relationship.conversationHistory.push({
      timestamp: new Date().toISOString(),
      questId: questId
    });

    // Save to Firestore
    relationships[characterId] = relationship;
    await setDoc(relationshipsRef, {
      characters: relationships,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log(`✅ Recorded conversation with ${characterId} (Total: ${relationship.conversationCount})`);
  } catch (error) {
    console.error('Error recording conversation:', error);
  }
}

/**
 * Record quest completion with a character
 */
export async function recordQuestCompletion(userId, characterId, questId) {
  try {
    const relationshipsRef = doc(db, 'users', userId, 'gameData', 'relationships');
    const relationshipsDoc = await getDoc(relationshipsRef);

    if (!relationshipsDoc.exists()) {
      await initializeRelationship(userId, characterId);
    }

    const relationships = (await getDoc(relationshipsRef)).data().characters || {};
    const relationship = relationships[characterId];

    if (!relationship) return;

    // Add quest to completed list if not already there
    if (!relationship.questsCompleted) {
      relationship.questsCompleted = [];
    }
    if (!relationship.questsCompleted.includes(questId)) {
      relationship.questsCompleted.push(questId);
    }

    // Save to Firestore
    relationships[characterId] = relationship;
    await setDoc(relationshipsRef, {
      characters: relationships,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log(`✅ Recorded quest completion: ${questId} with ${characterId}`);
  } catch (error) {
    console.error('Error recording quest completion:', error);
  }
}

/**
 * Record a gift given to a character
 */
export async function recordGift(userId, characterId, giftItem, affinityGain) {
  try {
    const relationshipsRef = doc(db, 'users', userId, 'gameData', 'relationships');
    const relationshipsDoc = await getDoc(relationshipsRef);

    if (!relationshipsDoc.exists()) {
      await initializeRelationship(userId, characterId);
    }

    const relationships = (await getDoc(relationshipsRef)).data().characters || {};
    const relationship = relationships[characterId];

    if (!relationship) return;

    // Add gift to history
    if (!relationship.giftsGiven) {
      relationship.giftsGiven = [];
    }
    relationship.giftsGiven.push({
      item: giftItem,
      date: new Date().toISOString(),
      affinityGain: affinityGain
    });

    // Save to Firestore
    relationships[characterId] = relationship;
    await setDoc(relationshipsRef, {
      characters: relationships,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log(`✅ Recorded gift: ${giftItem} to ${characterId}`);
  } catch (error) {
    console.error('Error recording gift:', error);
  }
}

/**
 * Unlock content for a character (backstory, quests, etc.)
 */
export async function unlockContent(userId, characterId, contentId) {
  try {
    const relationshipsRef = doc(db, 'users', userId, 'gameData', 'relationships');
    const relationshipsDoc = await getDoc(relationshipsRef);

    if (!relationshipsDoc.exists()) {
      await initializeRelationship(userId, characterId);
    }

    const relationships = (await getDoc(relationshipsRef)).data().characters || {};
    const relationship = relationships[characterId];

    if (!relationship) return;

    // Add to unlocked content if not already there
    if (!relationship.unlockedContent) {
      relationship.unlockedContent = [];
    }
    if (!relationship.unlockedContent.includes(contentId)) {
      relationship.unlockedContent.push(contentId);
    }

    // Save to Firestore
    relationships[characterId] = relationship;
    await setDoc(relationshipsRef, {
      characters: relationships,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log(`✅ Unlocked content: ${contentId} for ${characterId}`);
  } catch (error) {
    console.error('Error unlocking content:', error);
  }
}

/**
 * Record a special moment with a character
 */
export async function recordSpecialMoment(userId, characterId, momentId, affinityBonus = 0) {
  try {
    const relationshipsRef = doc(db, 'users', userId, 'gameData', 'relationships');
    const relationshipsDoc = await getDoc(relationshipsRef);

    if (!relationshipsDoc.exists()) {
      await initializeRelationship(userId, characterId);
    }

    const relationships = (await getDoc(relationshipsRef)).data().characters || {};
    const relationship = relationships[characterId];

    if (!relationship) return;

    // Add special moment
    if (!relationship.specialMoments) {
      relationship.specialMoments = [];
    }
    relationship.specialMoments.push({
      moment: momentId,
      date: new Date().toISOString(),
      affinityBonus: affinityBonus
    });

    // Save to Firestore
    relationships[characterId] = relationship;
    await setDoc(relationshipsRef, {
      characters: relationships,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    console.log(`✅ Recorded special moment: ${momentId} with ${characterId}`);
  } catch (error) {
    console.error('Error recording special moment:', error);
  }
}

/**
 * Get relationship level name based on affinity score
 */
export function getRelationshipLevelName(affinity) {
  if (affinity >= 91) return 'confidant';
  if (affinity >= 76) return 'closeFriend';
  if (affinity >= 51) return 'friend';
  if (affinity >= 21) return 'acquaintance';
  return 'stranger';
}

/**
 * Get relationship level data based on affinity score
 */
export function getRelationshipLevelData(affinity) {
  const levelName = getRelationshipLevelName(affinity);

  const levels = {
    stranger: { minAffinity: 0, maxAffinity: 20, level: "Desconocido", levelEn: "Stranger", icon: "👋", color: "#9CA3AF" },
    acquaintance: { minAffinity: 21, maxAffinity: 50, level: "Conocido", levelEn: "Acquaintance", icon: "🙂", color: "#60A5FA" },
    friend: { minAffinity: 51, maxAffinity: 75, level: "Amigo", levelEn: "Friend", icon: "😊", color: "#34D399" },
    closeFriend: { minAffinity: 76, maxAffinity: 90, level: "Buen Amigo", levelEn: "Close Friend", icon: "🤗", color: "#F59E0B" },
    confidant: { minAffinity: 91, maxAffinity: 100, level: "Confidente", levelEn: "Confidant", icon: "💙", color: "#8B5CF6" }
  };

  return levels[levelName];
}

/**
 * Calculate days since last contact
 */
export function getDaysSinceLastContact(lastContactISO) {
  if (!lastContactISO) return 0;

  const lastContact = new Date(lastContactISO);
  const now = new Date();
  const diffTime = Math.abs(now - lastContact);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Apply inactivity penalty if user hasn't contacted character in a while
 */
export async function applyInactivityPenalty(userId, characterId) {
  try {
    const relationshipsRef = doc(db, 'users', userId, 'gameData', 'relationships');
    const relationshipsDoc = await getDoc(relationshipsRef);

    if (!relationshipsDoc.exists()) return;

    const relationships = relationshipsDoc.data().characters || {};
    const relationship = relationships[characterId];

    if (!relationship || !relationship.lastContact) return;

    const daysSince = getDaysSinceLastContact(relationship.lastContact);

    // Only apply penalty if more than 7 days
    if (daysSince > 7) {
      const penalty = (daysSince - 7) * -2; // -2 affinity per day after 7 days
      await updateAffinity(userId, characterId, penalty, `Inactivity penalty (${daysSince} days)`);
    }
  } catch (error) {
    console.error('Error applying inactivity penalty:', error);
  }
}

/**
 * Get a dynamic greeting based on relationship level and time since last contact
 */
export function getDynamicGreeting(characterName, affinity, daysSinceLastContact, characterGreeting = null) {
  const level = getRelationshipLevelName(affinity);

  if (level === 'stranger') {
    return `¡Hola! I don't think we've met. I'm ${characterName}.`;
  } else if (level === 'acquaintance') {
    return `¡Hola! Nice to see you again. How's your Spanish going?`;
  } else if (level === 'friend') {
    if (daysSinceLastContact > 7) {
      return `¡Amigo! I haven't seen you in a while! I missed our conversations!`;
    }
    return characterGreeting || `¡Hola, amigo! Great to see you! How have you been?`;
  } else if (level === 'closeFriend' || level === 'confidant') {
    if (daysSinceLastContact > 7) {
      return `¡Por fin! I was worried about you! Where have you been?`;
    }
    return characterGreeting || `¡Qué alegría verte! (How wonderful to see you!)`;
  }

  return characterGreeting || `¡Hola!`;
}
