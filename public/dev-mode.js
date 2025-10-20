/**
 * Developer Mode - Testing utilities for quest development
 */

let devMode = {
  enabled: true,
  currentQuestId: null,
  currentStageId: null,
  questsCompleted: [],
  cefrLevel: 'A1'
};

/**
 * Initialize developer mode panel
 */
function initDevMode() {
  console.log('[DevMode] Initializing developer testing panel...');

  // DOM references
  const dom = {
    panel: document.getElementById('dev-panel'),
    resetBtn: document.getElementById('dev-panel-reset'),
    toggleBtn: document.getElementById('toggle-dev-panel'),
    controls: document.getElementById('dev-controls'),
    questCount: document.getElementById('dev-quest-count'),
    cefrLevel: document.getElementById('dev-cefr-level'),
    locationsUnlocked: document.getElementById('dev-locations-unlocked'),
    completeQuestBtn: document.getElementById('dev-complete-quest'),
    completeStageBtn: document.getElementById('dev-complete-stage'),
    unlockAllBtn: document.getElementById('dev-unlock-all'),
    resetProgressBtn: document.getElementById('dev-reset-progress'),
    levelSelect: document.getElementById('dev-level-select'),
    log: document.getElementById('dev-log')
  };

  // Check if all elements exist
  const missing = Object.entries(dom).filter(([k, v]) => !v).map(([k]) => k);
  if (missing.length > 0) {
    console.error('[DevMode] Missing elements:', missing);
    return;
  }

  // Toggle panel minimize/maximize
  let isMinimized = false;
  dom.toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering drag
    isMinimized = !isMinimized;
    if (isMinimized) {
      dom.controls.style.display = 'none';
      dom.toggleBtn.textContent = 'Expand';
    } else {
      dom.controls.style.display = 'flex';
      dom.toggleBtn.textContent = 'Minimize';
    }
  });

  // Complete current quest
  dom.completeQuestBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    devLog('Completing current quest...', 'info');
    devCompleteCurrentQuest();
  });

  // Complete/skip current stage
  dom.completeStageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    devLog('Skipping to next stage...', 'info');
    devCompleteCurrentStage();
  });

  // Unlock all locations
  dom.unlockAllBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    devLog('Unlocking all locations...', 'warn');
    devUnlockAllLocations();
  });

  // Reset all progress
  dom.resetProgressBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Reset all progress? This will clear completed quests and locked locations.')) {
      devLog('Resetting all progress...', 'error');
      devResetProgress();
    }
  });

  // Change CEFR level
  dom.levelSelect.addEventListener('change', (e) => {
    e.stopPropagation();
    const newLevel = e.target.value;
    devLog(`Changing level to ${newLevel}`, 'info');
    devSetCEFRLevel(newLevel);
  });

  // Update stats display
  updateDevStats();

  // Update stats every 2 seconds
  setInterval(updateDevStats, 2000);

  // Make panel draggable
  makePanelDraggable();

  // Prevent clicks inside panel from propagating to document
  dom.panel.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('[DevMode] Panel clicked, target:', e.target.tagName, e.target.id);
  });

  // Reset panel position button
  dom.resetBtn.addEventListener('click', () => {
    resetPanelPosition(dom.panel);
  });

  // Keyboard shortcut: Ctrl+Shift+D to reset panel position
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      resetPanelPosition(dom.panel);
      console.log('[DevMode] Panel position reset via keyboard shortcut');
    }
  });

  console.log('[DevMode] Developer panel initialized');
  console.log('[DevMode] Press Ctrl+Shift+D to reset panel position');
}

/**
 * Reset panel to default position
 */
function resetPanelPosition(panel) {
  if (!panel) return;

  panel.style.left = 'auto';
  panel.style.right = '20px';
  panel.style.top = '20px';

  console.log('[DevMode] Panel position reset to default');
}

/**
 * Make the dev panel draggable
 */
function makePanelDraggable() {
  const panel = document.getElementById('dev-panel');
  const header = document.getElementById('dev-panel-header');

  if (!panel || !header) {
    console.warn('[DevMode] Cannot make panel draggable - elements not found');
    return;
  }

  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  // Get the initial position from the panel's computed style
  const rect = panel.getBoundingClientRect();
  xOffset = rect.left;
  yOffset = rect.top;

  header.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  function dragStart(e) {
    // Don't drag if clicking on the minimize button
    const target = e.target;
    if (target.id === 'toggle-dev-panel' || target.closest('#toggle-dev-panel')) {
      console.log('[DevMode] Click on minimize button, not dragging');
      return;
    }

    // Get current position from panel
    const rect = panel.getBoundingClientRect();
    xOffset = rect.left;
    yOffset = rect.top;

    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    isDragging = true;
    header.style.cursor = 'grabbing';
    e.preventDefault(); // Prevent text selection while dragging
    console.log('[DevMode] Drag started at', e.clientX, e.clientY, 'from offset', xOffset, yOffset);
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();

      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;

      xOffset = currentX;
      yOffset = currentY;

      // Keep panel within viewport bounds
      const maxX = window.innerWidth - panel.offsetWidth;
      const maxY = window.innerHeight - panel.offsetHeight;

      xOffset = Math.max(0, Math.min(xOffset, maxX));
      yOffset = Math.max(0, Math.min(yOffset, maxY));

      setTranslate(xOffset, yOffset, panel);
    }
  }

  // Add a test log to verify the function was set up
  console.log('[DevMode] Drag handlers attached to header');

  function dragEnd() {
    if (isDragging) {
      console.log('[DevMode] Drag ended');
    }

    initialX = currentX;
    initialY = currentY;

    isDragging = false;
    header.style.cursor = 'move';
  }

  function setTranslate(xPos, yPos, el) {
    el.style.left = xPos + 'px';
    el.style.top = yPos + 'px';
    el.style.right = 'auto'; // Remove right positioning when using left
  }
}

/**
 * Log message to dev panel
 */
function devLog(message, type = 'info') {
  const log = document.getElementById('dev-log');
  if (!log) return;

  const colors = {
    info: '#3b82f6',
    success: '#10b981',
    warn: '#f59e0b',
    error: '#ef4444'
  };

  const icons = {
    info: 'ℹ️',
    success: '✓',
    warn: '⚠️',
    error: '✗'
  };

  const entry = document.createElement('div');
  entry.style.color = colors[type];
  entry.innerHTML = `${icons[type]} ${message}`;

  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;

  // Keep only last 10 messages
  while (log.children.length > 10) {
    log.removeChild(log.firstChild);
  }

  console.log(`[DevMode] ${message}`);
}

/**
 * Update dev panel statistics
 */
function updateDevStats() {
  const questCount = document.getElementById('dev-quest-count');
  const cefrLevel = document.getElementById('dev-cefr-level');
  const locationsUnlocked = document.getElementById('dev-locations-unlocked');

  if (!questCount || !cefrLevel || !locationsUnlocked) return;

  // Get user progress from quest map
  let progress = {
    questsCompleted: 0,
    cefrLevel: 'A1',
    unlockedLocations: ['la-plaza']
  };

  if (typeof window.getUserProgress === 'function') {
    progress = window.getUserProgress();
  }

  questCount.textContent = progress.questsCompleted || devMode.questsCompleted.length;
  cefrLevel.textContent = progress.cefrLevel || devMode.cefrLevel;
  locationsUnlocked.textContent = (progress.unlockedLocations || []).length;
}

/**
 * Complete the current quest instantly
 */
function devCompleteCurrentQuest() {
  // Check if there's an active quest
  if (!devMode.currentQuestId) {
    devLog('No active quest to complete', 'warn');
    alert('Start a quest first, then use this button to complete it instantly.');
    return;
  }

  const questId = devMode.currentQuestId;

  // Add to completed quests
  if (!devMode.questsCompleted.includes(questId)) {
    devMode.questsCompleted.push(questId);
  }

  // Update quest map progress
  if (typeof window.updateUserProgress === 'function') {
    const currentProgress = window.getUserProgress();
    window.updateUserProgress({
      questsCompleted: currentProgress.questsCompleted + 1,
      completedQuests: [...currentProgress.completedQuests, questId]
    });
  }

  devLog(`✓ Quest "${questId}" marked as complete!`, 'success');

  // Go back to quest list
  if (typeof window.showQuestList === 'function') {
    window.showQuestList();
  } else {
    // Try to find and click back button
    const backBtn = document.getElementById('back-to-quests-btn');
    if (backBtn) {
      backBtn.click();
    }
  }

  updateDevStats();
}

/**
 * Skip to next stage in current quest
 */
function devCompleteCurrentStage() {
  devLog('Stage skip functionality coming soon', 'info');
  alert('This will skip to the next stage of the current quest.\nFor now, use "Complete Current Quest" to finish the entire quest.');
}

/**
 * Unlock all locations on the map
 */
function devUnlockAllLocations() {
  if (typeof window.MAP_LOCATIONS === 'undefined') {
    devLog('Map locations not loaded', 'error');
    return;
  }

  const allLocationIds = Object.keys(window.MAP_LOCATIONS);

  if (typeof window.updateUserProgress === 'function') {
    window.updateUserProgress({
      unlockedLocations: allLocationIds,
      questsCompleted: 100, // High number to satisfy minQuestsCompleted requirements
      cefrLevel: 'C2' // Highest level to satisfy level requirements
    });
  }

  devLog(`Unlocked ${allLocationIds.length} locations`, 'success');
  updateDevStats();

  // Refresh map if visible
  if (typeof window.switchQuestView === 'function') {
    const currentView = document.getElementById('quest-map-container')?.classList.contains('hidden') ? 'list' : 'map';
    if (currentView === 'map') {
      window.switchQuestView('map'); // Refresh map
    }
  }
}

/**
 * Reset all progress
 */
function devResetProgress() {
  devMode.questsCompleted = [];
  devMode.cefrLevel = 'A1';

  if (typeof window.updateUserProgress === 'function') {
    window.updateUserProgress({
      questsCompleted: 0,
      completedQuests: [],
      unlockedLocations: ['la-plaza'],
      cefrLevel: 'A1'
    });
  }

  devLog('Progress reset to defaults', 'success');
  updateDevStats();

  // Refresh map if visible
  if (typeof window.switchQuestView === 'function') {
    const currentView = document.getElementById('quest-map-container')?.classList.contains('hidden') ? 'list' : 'map';
    if (currentView === 'map') {
      window.switchQuestView('map'); // Refresh map
    }
  }
}

/**
 * Set CEFR level
 */
function devSetCEFRLevel(level) {
  devMode.cefrLevel = level;

  if (typeof window.updateUserProgress === 'function') {
    window.updateUserProgress({
      cefrLevel: level
    });
  }

  devLog(`CEFR level set to ${level}`, 'success');
  updateDevStats();
}

/**
 * Track when a quest is started (call this from main app)
 */
function devTrackQuestStart(questId, stageId) {
  devMode.currentQuestId = questId;
  devMode.currentStageId = stageId;
  devLog(`Quest started: ${questId} (Stage ${stageId})`, 'info');
}

/**
 * Track when a quest is completed (call this from main app)
 */
function devTrackQuestComplete(questId) {
  if (!devMode.questsCompleted.includes(questId)) {
    devMode.questsCompleted.push(questId);
  }
  devLog(`Quest completed: ${questId}`, 'success');
  updateDevStats();
}

// Console commands for power users
window.devMode = {
  completeQuest: devCompleteCurrentQuest,
  unlockAll: devUnlockAllLocations,
  reset: devResetProgress,
  setLevel: devSetCEFRLevel,
  help: () => {
    console.log(`
%c🛠️ DevMode Console Commands

Available commands:
  devMode.completeQuest()      - Complete current quest
  devMode.unlockAll()          - Unlock all locations
  devMode.reset()              - Reset all progress
  devMode.setLevel('B1')       - Set CEFR level (A1-C2)
  devMode.help()               - Show this help

Examples:
  devMode.setLevel('B2')
  devMode.unlockAll()
  devMode.completeQuest()
    `, 'color: #667eea; font-size: 14px; font-weight: bold');
  }
};

// Auto-show help on load
setTimeout(() => {
  console.log('%c🛠️ Developer Mode Active', 'color: #667eea; font-size: 16px; font-weight: bold');
  console.log('%cType devMode.help() for console commands', 'color: #999; font-size: 12px');
}, 1000);

// Export functions
if (typeof window !== 'undefined') {
  window.initDevMode = initDevMode;
  window.devTrackQuestStart = devTrackQuestStart;
  window.devTrackQuestComplete = devTrackQuestComplete;
  window.devLog = devLog;
}
