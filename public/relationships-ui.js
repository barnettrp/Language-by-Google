/**
 * ConvoQuest - Relationships UI
 *
 * Handles the user interface for the character relationships system.
 */

/**
 * Show the relationships view
 */
export async function showRelationshipsView(currentUser, CHARACTER_DATABASE, relationshipFunctions) {
  console.log('📋 Showing relationships view...');

  // Hide other views
  document.getElementById('quest-view').classList.add('hidden');
  document.getElementById('quest-view').classList.remove('flex');
  document.getElementById('chat-view').classList.add('hidden');
  document.getElementById('chat-view').classList.remove('flex');

  // Show relationships view
  const relationshipsView = document.getElementById('relationships-view');
  relationshipsView.classList.remove('hidden');
  relationshipsView.classList.add('flex');

  // Load and display characters
  await loadCharactersList(currentUser, CHARACTER_DATABASE, relationshipFunctions);
}

/**
 * Hide the relationships view and return to quest list
 */
export function hideRelationshipsView() {
  console.log('📋 Hiding relationships view...');

  // Hide relationships view
  document.getElementById('relationships-view').classList.add('hidden');
  document.getElementById('relationships-view').classList.remove('flex');

  // Show quest view
  document.getElementById('quest-view').classList.remove('hidden');
  document.getElementById('quest-view').classList.add('flex');
}

/**
 * Load and display all characters grouped by relationship level
 */
async function loadCharactersList(currentUser, CHARACTER_DATABASE, relationshipFunctions) {
  if (!currentUser) return;

  // Get user's relationship data
  const relationships = await relationshipFunctions.getUserRelationships(currentUser.uid);

  // Clear all sections
  const sections = ['confidant', 'close-friend', 'friend', 'acquaintance', 'stranger'];
  sections.forEach(section => {
    document.getElementById(`${section}-section`).classList.add('hidden');
    document.getElementById(`${section}-list`).innerHTML = '';
  });

  // Group characters by relationship level
  const grouped = {
    confidant: [],
    closeFriend: [],
    friend: [],
    acquaintance: [],
    stranger: []
  };

  Object.values(CHARACTER_DATABASE).forEach(character => {
    const relationship = relationships[character.id];
    const affinity = relationship ? relationship.affinity : 0;

    const charData = {
      ...character,
      affinity: affinity,
      relationship: relationship
    };

    if (affinity >= 91) {
      grouped.confidant.push(charData);
    } else if (affinity >= 76) {
      grouped.closeFriend.push(charData);
    } else if (affinity >= 51) {
      grouped.friend.push(charData);
    } else if (affinity >= 21) {
      grouped.acquaintance.push(charData);
    } else {
      grouped.stranger.push(charData);
    }
  });

  // Display each group
  if (grouped.confidant.length > 0) {
    document.getElementById('confidant-section').classList.remove('hidden');
    grouped.confidant.forEach(char => {
      document.getElementById('confidant-list').appendChild(
        createCharacterCard(char, CHARACTER_DATABASE, relationships, relationshipFunctions)
      );
    });
  }

  if (grouped.closeFriend.length > 0) {
    document.getElementById('close-friend-section').classList.remove('hidden');
    grouped.closeFriend.forEach(char => {
      document.getElementById('close-friend-list').appendChild(
        createCharacterCard(char, CHARACTER_DATABASE, relationships, relationshipFunctions)
      );
    });
  }

  if (grouped.friend.length > 0) {
    document.getElementById('friend-section').classList.remove('hidden');
    grouped.friend.forEach(char => {
      document.getElementById('friend-list').appendChild(
        createCharacterCard(char, CHARACTER_DATABASE, relationships, relationshipFunctions)
      );
    });
  }

  if (grouped.acquaintance.length > 0) {
    document.getElementById('acquaintance-section').classList.remove('hidden');
    grouped.acquaintance.forEach(char => {
      document.getElementById('acquaintance-list').appendChild(
        createCharacterCard(char, CHARACTER_DATABASE, relationships, relationshipFunctions)
      );
    });
  }

  if (grouped.stranger.length > 0) {
    document.getElementById('stranger-section').classList.remove('hidden');
    grouped.stranger.forEach(char => {
      document.getElementById('stranger-list').appendChild(
        createCharacterCard(char, CHARACTER_DATABASE, relationships, relationshipFunctions)
      );
    });
  }

  // Show empty state if no characters met yet
  const totalCharacters = Object.keys(grouped).reduce((sum, key) => sum + grouped[key].length, 0);
  if (totalCharacters === 0) {
    document.getElementById('no-characters-message').classList.remove('hidden');
  } else {
    document.getElementById('no-characters-message').classList.add('hidden');
  }
}

/**
 * Create a character card element
 */
function createCharacterCard(character, CHARACTER_DATABASE, relationships, relationshipFunctions) {
  const card = document.createElement('div');
  card.className = 'bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer';

  const affinity = character.affinity || 0;
  const relationshipLevel = relationshipFunctions.getRelationshipLevelData(affinity);
  const conversationCount = character.relationship?.conversationCount || 0;
  const questsCompleted = character.relationship?.questsCompleted?.length || 0;

  card.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="text-4xl">${character.avatar}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-gray-800 truncate">${character.name}</h3>
        <p class="text-sm text-gray-600 truncate">${character.roleEn}</p>
        <p class="text-xs text-blue-600 truncate">📍 ${character.locationName}</p>

        <!-- Relationship Level -->
        <div class="mt-2 flex items-center gap-2">
          <span class="text-lg">${relationshipLevel.icon}</span>
          <span class="text-xs font-semibold" style="color: ${relationshipLevel.color}">${relationshipLevel.level}</span>
        </div>

        <!-- Affinity Bar -->
        <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div class="h-2 rounded-full transition-all" style="width: ${affinity}%; background-color: ${relationshipLevel.color}"></div>
        </div>

        <!-- Stats -->
        <div class="mt-2 flex gap-3 text-xs text-gray-500">
          <span>💬 ${conversationCount}</span>
          <span>🎯 ${questsCompleted}</span>
        </div>
      </div>
    </div>
  `;

  // Click to open detailed modal
  card.addEventListener('click', () => {
    showCharacterDetailModal(character, relationships, CHARACTER_DATABASE, relationshipFunctions);
  });

  return card;
}

/**
 * Show character detail modal
 */
function showCharacterDetailModal(character, relationships, CHARACTER_DATABASE, relationshipFunctions) {
  const modal = document.getElementById('character-detail-modal');
  const relationship = relationships[character.id];
  const affinity = relationship?.affinity || 0;
  const relationshipLevel = relationshipFunctions.getRelationshipLevelData(affinity);

  // Set basic info
  document.getElementById('modal-character-name').textContent = character.name;
  document.getElementById('modal-character-avatar').textContent = character.avatar;
  document.getElementById('modal-character-full-name').textContent = character.fullName;
  document.getElementById('modal-character-role').textContent = `${character.role} (${character.roleEn})`;
  document.getElementById('modal-character-location').textContent = `📍 ${character.locationName}`;

  // Set relationship level
  document.getElementById('modal-relationship-level').textContent = `${relationshipLevel.icon} ${relationshipLevel.level} (${relationshipLevel.levelEn})`;
  document.getElementById('modal-relationship-level').style.color = relationshipLevel.color;
  document.getElementById('modal-affinity-score').textContent = `${affinity}/100`;

  // Set affinity bar
  const affinityBar = document.getElementById('modal-affinity-bar');
  affinityBar.style.width = `${affinity}%`;
  affinityBar.style.backgroundColor = relationshipLevel.color;

  // Set stats
  document.getElementById('modal-conversation-count').textContent = relationship?.conversationCount || 0;
  document.getElementById('modal-quests-count').textContent = relationship?.questsCompleted?.length || 0;
  document.getElementById('modal-gifts-count').textContent = relationship?.giftsGiven?.length || 0;

  // Set last contact
  if (relationship?.lastContact) {
    const lastContact = new Date(relationship.lastContact);
    const daysSince = relationshipFunctions.getDaysSinceLastContact(relationship.lastContact);

    if (daysSince === 0) {
      document.getElementById('modal-last-contact').textContent = 'Today';
    } else if (daysSince === 1) {
      document.getElementById('modal-last-contact').textContent = 'Yesterday';
    } else if (daysSince < 7) {
      document.getElementById('modal-last-contact').textContent = `${daysSince} days ago`;
    } else {
      document.getElementById('modal-last-contact').textContent = lastContact.toLocaleDateString();
    }
  } else {
    document.getElementById('modal-last-contact').textContent = 'Never';
  }

  // Set backstory (based on affinity level)
  const backstoryContainer = document.getElementById('modal-backstory-container');
  backstoryContainer.innerHTML = '';

  const backstoryLevels = [];
  if (affinity >= 0) backstoryLevels.push({ level: 0, text: character.backstory.level_0 });
  if (affinity >= 20) backstoryLevels.push({ level: 20, text: character.backstory.level_20 });
  if (affinity >= 50) backstoryLevels.push({ level: 50, text: character.backstory.level_50 });
  if (affinity >= 75) backstoryLevels.push({ level: 75, text: character.backstory.level_75 });
  if (affinity >= 90) backstoryLevels.push({ level: 90, text: character.backstory.level_90 });

  backstoryLevels.forEach((item, index) => {
    const p = document.createElement('p');
    p.className = 'text-sm text-gray-700 leading-relaxed';
    if (index === backstoryLevels.length - 1 && affinity >= 50) {
      p.className += ' font-semibold text-purple-700';
    }
    p.textContent = item.text;
    backstoryContainer.appendChild(p);
  });

  // Add locked backstory hints
  if (affinity < 90) {
    const lockedHint = document.createElement('p');
    lockedHint.className = 'text-sm text-gray-400 italic mt-2';
    lockedHint.textContent = `🔒 More to discover at higher affinity levels...`;
    backstoryContainer.appendChild(lockedHint);
  }

  // Set favorites
  const favoritesContainer = document.getElementById('modal-favorites-container');
  favoritesContainer.innerHTML = `
    <div><span class="font-semibold">Color:</span> ${character.favorites.color} (${character.favorites.colorEn})</div>
    <div><span class="font-semibold">Food:</span> ${character.favorites.food}</div>
    <div><span class="font-semibold">Place:</span> ${character.favorites.placeEn}</div>
    <div><span class="font-semibold">Greeting:</span> "${character.favorites.greeting}"</div>
  `;

  // Set exclusive quests
  const availableQuests = character.exclusiveQuests.filter(quest => affinity >= quest.unlockAffinity);
  const questsSection = document.getElementById('modal-quests-section');
  const questsContainer = document.getElementById('modal-exclusive-quests');

  if (availableQuests.length > 0) {
    questsSection.classList.remove('hidden');
    questsContainer.innerHTML = '';

    availableQuests.forEach(quest => {
      const questDiv = document.createElement('div');
      questDiv.className = 'bg-blue-50 border border-blue-200 rounded-lg p-3';
      const isCompleted = relationship?.questsCompleted?.includes(quest.questId);

      questDiv.innerHTML = `
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h5 class="font-semibold text-gray-800">${quest.titleEn}</h5>
            <p class="text-xs text-gray-600 mt-1">${quest.descriptionEn}</p>
            <div class="mt-2 text-xs text-gray-500">
              ⏱️ ${quest.estimatedDuration} min • ⭐ ${quest.reward.xp} XP
            </div>
          </div>
          <div class="ml-2">
            ${isCompleted ? '<span class="text-green-600 text-xl">✅</span>' : '<span class="text-blue-600 text-xl">🆕</span>'}
          </div>
        </div>
      `;

      questsContainer.appendChild(questDiv);
    });
  } else {
    questsSection.classList.add('hidden');
  }

  // Show modal
  modal.classList.remove('hidden');

  // Close modal handler
  document.getElementById('close-character-modal').onclick = () => {
    modal.classList.add('hidden');
  };

  // Click outside to close
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  };

  // Chat button (placeholder for now)
  document.getElementById('modal-chat-btn').onclick = () => {
    alert(`Free chat with ${character.name} coming soon! For now, find them in quests.`);
  };

  // Gift button (disabled for Phase 1)
  document.getElementById('modal-gift-btn').onclick = () => {
    alert('Gift giving feature coming in Phase 3!');
  };
}

/**
 * Initialize search functionality
 */
export function initializeCharacterSearch() {
  const searchInput = document.getElementById('character-search');

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const allCards = document.querySelectorAll('#characters-container [class*="-list"] > div');

    allCards.forEach(card => {
      const characterName = card.querySelector('h3').textContent.toLowerCase();
      const characterRole = card.querySelector('.text-gray-600').textContent.toLowerCase();

      if (characterName.includes(searchTerm) || characterRole.includes(searchTerm)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });

    // Hide empty sections
    const sections = ['confidant', 'close-friend', 'friend', 'acquaintance', 'stranger'];
    sections.forEach(section => {
      const list = document.getElementById(`${section}-list`);
      const visibleCards = Array.from(list.children).filter(card => card.style.display !== 'none');

      const sectionElement = document.getElementById(`${section}-section`);
      if (visibleCards.length === 0) {
        sectionElement.classList.add('hidden');
      } else {
        sectionElement.classList.remove('hidden');
      }
    });
  });
}

/**
 * Show affinity gain notification
 */
export function showAffinityNotification(characterName, affinityChange, oldAffinity, newAffinity, reason) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'fixed top-20 right-4 bg-white border-2 border-green-400 rounded-lg shadow-xl p-4 max-w-sm z-50 animate-slide-in';
  notification.style.animation = 'slideInRight 0.3s ease-out';

  const sign = affinityChange > 0 ? '+' : '';
  const color = affinityChange > 0 ? 'text-green-600' : 'text-red-600';

  notification.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="text-3xl">${affinityChange > 0 ? '💚' : '💔'}</div>
      <div class="flex-1">
        <h3 class="font-bold text-gray-800">${sign}${affinityChange} Affinity</h3>
        <p class="text-sm text-gray-700">${characterName} • ${oldAffinity} → ${newAffinity}</p>
        ${reason ? `<p class="text-xs text-gray-500 mt-1">${reason}</p>` : ''}
      </div>
      <button class="text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
