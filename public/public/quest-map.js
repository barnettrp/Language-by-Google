/**
 * Quest Map - Interactive Village Map for Puerto Esperanza
 */

// Map state
let currentMapView = 'list'; // 'list' or 'map'
let userProgress = {
  cefrLevel: 'A1',
  questsCompleted: 0,
  completedQuests: [],
  unlockedLocations: ['la-plaza'] // Always start with plaza unlocked
};

// DOM references
const dom = {
  questListContainer: null,
  questMapContainer: null,
  showQuestListBtn: null,
  showQuestMapBtn: null,
  mapSvg: null,
  mapTrails: null,
  mapLocations: null,
  locationInfoPanel: null,
  locationIcon: null,
  locationName: null,
  locationDescription: null,
  locationQuests: null,
  locationLockedMessage: null,
  unlockRequirement: null,
  closeLocationPanel: null
};

/**
 * Initialize the quest map system
 */
function initializeQuestMap() {
  console.log('[QuestMap] Initializing quest map system...');

  // Get DOM references
  dom.questListContainer = document.getElementById('quest-list-container');
  dom.questMapContainer = document.getElementById('quest-map-container');
  dom.showQuestListBtn = document.getElementById('show-quest-list-btn');
  dom.showQuestMapBtn = document.getElementById('show-quest-map-btn');
  dom.mapSvg = document.getElementById('map-svg');
  dom.mapTrails = document.getElementById('map-trails');
  dom.mapLocations = document.getElementById('map-locations');
  dom.locationInfoPanel = document.getElementById('location-info-panel');
  dom.locationIcon = document.getElementById('location-icon');
  dom.locationName = document.getElementById('location-name');
  dom.locationDescription = document.getElementById('location-description');
  dom.locationQuests = document.getElementById('location-quests');
  dom.locationLockedMessage = document.getElementById('location-locked-message');
  dom.unlockRequirement = document.getElementById('unlock-requirement');
  dom.closeLocationPanel = document.getElementById('close-location-panel');

  // Check if all DOM elements exist
  const missingElements = Object.entries(dom)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingElements.length > 0) {
    console.error('[QuestMap] Missing DOM elements:', missingElements);
    return;
  }

  // Add event listeners
  dom.showQuestListBtn.addEventListener('click', () => switchView('list'));
  dom.showQuestMapBtn.addEventListener('click', () => switchView('map'));
  dom.closeLocationPanel.addEventListener('click', closeLocationPanel);

  // Render the map
  renderQuestMap();

  console.log('[QuestMap] Quest map system initialized successfully');
}

/**
 * Switch between list and map views
 */
function switchView(view) {
  currentMapView = view;

  if (view === 'list') {
    // Show list, hide map
    dom.questListContainer.classList.remove('hidden');
    dom.questMapContainer.classList.add('hidden');

    // Update button styles
    dom.showQuestListBtn.classList.add('bg-white', 'text-gray-800', 'shadow-sm');
    dom.showQuestListBtn.classList.remove('text-gray-600');
    dom.showQuestMapBtn.classList.remove('bg-white', 'text-gray-800', 'shadow-sm');
    dom.showQuestMapBtn.classList.add('text-gray-600');
  } else {
    // Show map, hide list
    dom.questListContainer.classList.add('hidden');
    dom.questMapContainer.classList.remove('hidden');

    // Update button styles
    dom.showQuestMapBtn.classList.add('bg-white', 'text-gray-800', 'shadow-sm');
    dom.showQuestMapBtn.classList.remove('text-gray-600');
    dom.showQuestListBtn.classList.remove('bg-white', 'text-gray-800', 'shadow-sm');
    dom.showQuestListBtn.classList.add('text-gray-600');

    // Refresh map view
    renderQuestMap();
  }
}

/**
 * Render the quest map with locations and trails
 */
function renderQuestMap() {
  if (!window.MAP_LOCATIONS || !window.MAP_CONNECTIONS) {
    console.error('[QuestMap] MAP_LOCATIONS or MAP_CONNECTIONS not loaded');
    return;
  }

  // Clear existing elements
  dom.mapTrails.innerHTML = '';
  dom.mapLocations.innerHTML = '';

  // Render trails (connections between locations)
  renderTrails();

  // Render location pins
  renderLocations();
}

/**
 * Render breadcrumb trails between locations
 */
function renderTrails() {
  window.MAP_CONNECTIONS.forEach(connection => {
    const fromLoc = window.MAP_LOCATIONS[connection.from];
    const toLoc = window.MAP_LOCATIONS[connection.to];

    if (!fromLoc || !toLoc) return;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const pathData = window.generateBreadcrumbPath(fromLoc.coordinates, toLoc.coordinates);

    path.setAttribute('d', pathData);
    path.setAttribute('class', 'map-trail');
    path.setAttribute('stroke', '#9ca3af');
    path.setAttribute('fill', 'none');

    // Check if trail is completed (both locations visited/unlocked)
    const bothUnlocked =
      userProgress.unlockedLocations.includes(connection.from) &&
      userProgress.unlockedLocations.includes(connection.to);

    if (bothUnlocked) {
      path.classList.add('completed');
      path.setAttribute('stroke', '#3b82f6');
    }

    dom.mapTrails.appendChild(path);
  });
}

/**
 * Render location pins on the map
 */
function renderLocations() {
  Object.values(window.MAP_LOCATIONS).forEach(location => {
    const isUnlocked = checkIfLocationUnlocked(location);

    // Create location group
    const locationGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    locationGroup.setAttribute('class', `map-location ${isUnlocked ? 'unlocked' : 'locked'}`);
    locationGroup.setAttribute('data-location-id', location.id);
    locationGroup.setAttribute('transform', `translate(${location.coordinates.x}, ${location.coordinates.y})`);

    if (isUnlocked) {
      locationGroup.style.cursor = 'pointer';
      locationGroup.addEventListener('click', () => openLocationPanel(location));
    }

    // Background circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '0');
    circle.setAttribute('cy', '0');
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', isUnlocked ? location.backgroundColor : '#9ca3af');
    circle.setAttribute('stroke', isUnlocked ? '#1f2937' : '#6b7280');
    circle.setAttribute('stroke-width', '0.5');

    // Icon text (emoji)
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '0');
    text.setAttribute('y', '0');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-size', '4');
    text.textContent = isUnlocked ? location.icon : '🔒';

    // Location name label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '0');
    label.setAttribute('y', '8');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '2.5');
    label.setAttribute('font-weight', 'bold');
    label.setAttribute('fill', isUnlocked ? '#1f2937' : '#6b7280');
    label.textContent = location.name;

    locationGroup.appendChild(circle);
    locationGroup.appendChild(text);
    locationGroup.appendChild(label);

    dom.mapLocations.appendChild(locationGroup);
  });
}

/**
 * Check if a location should be unlocked
 */
function checkIfLocationUnlocked(location) {
  return window.checkLocationUnlock(location.id, userProgress);
}

/**
 * Open the location info panel
 */
function openLocationPanel(location) {
  const isUnlocked = checkIfLocationUnlocked(location);

  // Update panel content
  dom.locationIcon.textContent = location.icon;
  dom.locationName.textContent = location.name;
  dom.locationDescription.textContent = location.description;

  if (isUnlocked) {
    // Show quests at this location
    dom.locationLockedMessage.classList.add('hidden');
    dom.locationQuests.classList.remove('hidden');
    renderLocationQuests(location);
  } else {
    // Show locked message
    dom.locationQuests.classList.add('hidden');
    dom.locationLockedMessage.classList.remove('hidden');

    // Determine unlock requirement
    const requirement = getUnlockRequirement(location);
    dom.unlockRequirement.textContent = requirement;
  }

  // Show panel
  dom.locationInfoPanel.classList.remove('hidden');
}

/**
 * Close the location info panel
 */
function closeLocationPanel() {
  dom.locationInfoPanel.classList.add('hidden');
}

/**
 * Render quests available at a location
 */
function renderLocationQuests(location) {
  dom.locationQuests.innerHTML = '';

  const quests = window.getQuestsAtLocation(location.id, window.QUEST_DATABASE);

  if (quests.length === 0) {
    dom.locationQuests.innerHTML = '<p class="text-sm text-gray-500 text-center py-2">No quests available here yet</p>';
    return;
  }

  quests.forEach(quest => {
    const questCard = createQuestCard(quest);
    dom.locationQuests.appendChild(questCard);
  });
}

/**
 * Create a quest card element
 */
function createQuestCard(quest) {
  const card = document.createElement('div');
  card.className = 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer';

  // Check if quest is completed
  const isCompleted = userProgress.completedQuests.includes(quest.id);

  card.innerHTML = `
    <div class="flex items-start justify-between mb-2">
      <h4 class="font-bold text-gray-800 text-sm flex items-center gap-2">
        ${quest.title}
        ${isCompleted ? '<span class="text-green-500">✓</span>' : ''}
      </h4>
      <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">${quest.requiredLevel}</span>
    </div>
    <p class="text-xs text-gray-600 mb-2">${quest.objective}</p>
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-500">⏱️ ${quest.estimatedDuration} min</span>
      <span class="text-blue-600 font-medium">${isCompleted ? 'Replay' : 'Start'} →</span>
    </div>
  `;

  // Add click handler (you'll need to connect this to your existing quest start logic)
  card.addEventListener('click', () => {
    console.log('[QuestMap] Starting quest:', quest.id);
    closeLocationPanel();
    // TODO: Connect to existing startQuest function
    if (typeof window.startQuest === 'function') {
      window.startQuest(quest.id);
    }
  });

  return card;
}

/**
 * Get unlock requirement text for a locked location
 */
function getUnlockRequirement(location) {
  const requirements = [];

  if (location.requiredLevel) {
    const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const userLevelIndex = levelOrder.indexOf(userProgress.cefrLevel);
    const requiredLevelIndex = levelOrder.indexOf(location.requiredLevel);

    if (userLevelIndex < requiredLevelIndex) {
      requirements.push(`Reach ${location.requiredLevel} level`);
    }
  }

  if (location.minQuestsCompleted) {
    const remaining = location.minQuestsCompleted - userProgress.questsCompleted;
    if (remaining > 0) {
      requirements.push(`Complete ${remaining} more quest${remaining > 1 ? 's' : ''}`);
    }
  }

  if (location.requiredQuests && location.requiredQuests.length > 0) {
    const incomplete = location.requiredQuests.filter(
      qId => !userProgress.completedQuests.includes(qId)
    );
    if (incomplete.length > 0) {
      requirements.push(`Complete required quests first`);
    }
  }

  if (location.requiredLocations && location.requiredLocations.length > 0) {
    const locked = location.requiredLocations.filter(
      locId => !userProgress.unlockedLocations.includes(locId)
    );
    if (locked.length > 0) {
      requirements.push(`Unlock previous locations`);
    }
  }

  return requirements.length > 0 ? requirements.join(' • ') : 'Requirements not met';
}

/**
 * Update user progress (call this from main app when quests are completed)
 */
function updateUserProgress(progress) {
  userProgress = { ...userProgress, ...progress };

  // Update unlocked locations based on progress
  Object.keys(window.MAP_LOCATIONS).forEach(locationId => {
    if (checkIfLocationUnlocked(window.MAP_LOCATIONS[locationId])) {
      if (!userProgress.unlockedLocations.includes(locationId)) {
        userProgress.unlockedLocations.push(locationId);
        console.log('[QuestMap] Location unlocked:', locationId);
      }
    }
  });

  // Re-render map if we're in map view
  if (currentMapView === 'map') {
    renderQuestMap();
  }
}

/**
 * Get current user progress
 */
function getUserProgress() {
  return userProgress;
}

// Export functions to window for use in main app
if (typeof window !== 'undefined') {
  window.initializeQuestMap = initializeQuestMap;
  window.updateUserProgress = updateUserProgress;
  window.getUserProgress = getUserProgress;
  window.switchQuestView = switchView;
}
