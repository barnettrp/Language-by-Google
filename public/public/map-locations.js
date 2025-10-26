/**
 * Puerto Esperanza - Map Location Data
 *
 * Defines all locations in the village with their coordinates,
 * connections, and unlock requirements.
 */

const MAP_LOCATIONS = {
  "la-plaza": {
    id: "la-plaza",
    name: "La Plaza Central",
    nameEn: "Town Square",
    description: "The heart of Puerto Esperanza, where the community gathers",
    descriptionEs: "El corazón de Puerto Esperanza, donde la comunidad se reúne",
    icon: "🏛️",
    coordinates: { x: 50, y: 30 }, // Percentage position on map
    unlocked: true, // Always unlocked - starting point
    requiredQuests: [],
    requiredLevel: null,
    connectedLocations: ["el-mercado", "hotel-colonial", "el-parque"],
    backgroundColor: "#FFE5B4",
    category: "community"
  },

  "el-mercado": {
    id: "el-mercado",
    name: "El Mercado",
    nameEn: "The Market",
    description: "A vibrant market filled with fresh produce and friendly vendors",
    descriptionEs: "Un mercado vibrante lleno de productos frescos y vendedores amigables",
    icon: "🛒",
    coordinates: { x: 50, y: 50 },
    unlocked: false,
    requiredQuests: [],
    requiredLevel: "A1",
    connectedLocations: ["la-plaza", "la-cafe", "hotel-colonial"],
    backgroundColor: "#90EE90",
    category: "shopping"
  },

  "hotel-colonial": {
    id: "hotel-colonial",
    name: "El Hotel Colonial",
    nameEn: "The Colonial Hotel",
    description: "An elegant seaside hotel with a rich history",
    descriptionEs: "Un elegante hotel junto al mar con una rica historia",
    icon: "🏨",
    coordinates: { x: 35, y: 50 },
    unlocked: false,
    requiredQuests: [],
    requiredLevel: "A1",
    connectedLocations: ["la-plaza", "el-mercado", "escuela-musica"],
    backgroundColor: "#FFB6C1",
    category: "hospitality"
  },

  "la-cafe": {
    id: "la-cafe",
    name: "La Café del Puerto",
    nameEn: "Seaside Café",
    description: "A cozy café with ocean views and delicious coffee",
    descriptionEs: "Un café acogedor con vistas al mar y café delicioso",
    icon: "☕",
    coordinates: { x: 65, y: 50 },
    unlocked: false,
    requiredQuests: ["market-day"],
    requiredLevel: "A1",
    connectedLocations: ["el-mercado", "el-parque", "el-muelle"],
    backgroundColor: "#DEB887",
    category: "dining"
  },

  "la-playa": {
    id: "la-playa",
    name: "La Playa",
    nameEn: "The Beach",
    description: "Golden sands and crystal blue waters perfect for adventure",
    descriptionEs: "Arenas doradas y aguas azul cristalino perfectas para la aventura",
    icon: "🏖️",
    coordinates: { x: 30, y: 75 },
    unlocked: false,
    requiredQuests: [], // Unlocks after completing any 2 quests
    requiredLevel: "A1",
    minQuestsCompleted: 2,
    connectedLocations: ["hotel-colonial", "escuela-musica", "el-muelle"],
    backgroundColor: "#87CEEB",
    category: "recreation"
  },

  "escuela-musica": {
    id: "escuela-musica",
    name: "La Escuela de Música",
    nameEn: "Music School",
    description: "Where melodies fill the air and musicians gather",
    descriptionEs: "Donde las melodías llenan el aire y los músicos se reúnen",
    icon: "🎸",
    coordinates: { x: 20, y: 60 },
    unlocked: false,
    requiredQuests: ["missing-guitar"],
    requiredLevel: "A2",
    connectedLocations: ["hotel-colonial", "la-playa"],
    backgroundColor: "#DDA0DD",
    category: "arts"
  },

  "el-muelle": {
    id: "el-muelle",
    name: "El Muelle",
    nameEn: "The Dock",
    description: "A bustling pier with fishing boats and fresh seafood",
    descriptionEs: "Un muelle animado con barcos de pesca y mariscos frescos",
    icon: "⚓",
    coordinates: { x: 70, y: 65 },
    unlocked: false,
    requiredQuests: [], // Unlocks after beach
    requiredLevel: "A2",
    requiredLocations: ["la-playa"],
    connectedLocations: ["la-cafe", "la-playa"],
    backgroundColor: "#B0C4DE",
    category: "maritime"
  },

  "el-parque": {
    id: "el-parque",
    name: "El Parque",
    nameEn: "The Park",
    description: "A peaceful green space with fountains and walking paths",
    descriptionEs: "Un espacio verde tranquilo con fuentes y senderos",
    icon: "🌳",
    coordinates: { x: 65, y: 30 },
    unlocked: false,
    requiredQuests: [],
    requiredLevel: "A1",
    minQuestsCompleted: 3,
    connectedLocations: ["la-plaza", "la-cafe", "galeria-arte"],
    backgroundColor: "#98FB98",
    category: "nature"
  },

  "galeria-arte": {
    id: "galeria-arte",
    name: "La Galería de Arte",
    nameEn: "Art Gallery",
    description: "A sophisticated gallery showcasing local artists",
    descriptionEs: "Una galería sofisticada que exhibe artistas locales",
    icon: "🎨",
    coordinates: { x: 35, y: 20 },
    unlocked: false,
    requiredQuests: [],
    requiredLevel: "B1",
    minQuestsCompleted: 4,
    connectedLocations: ["la-plaza", "el-parque", "el-faro"],
    backgroundColor: "#F0E68C",
    category: "culture"
  },

  "el-faro": {
    id: "el-faro",
    name: "El Faro",
    nameEn: "The Lighthouse",
    description: "An ancient lighthouse with panoramic views and mysteries",
    descriptionEs: "Un faro antiguo con vistas panorámicas y misterios",
    icon: "🗼",
    coordinates: { x: 50, y: 10 },
    unlocked: false,
    requiredQuests: [],
    requiredLevel: "B2",
    minQuestsCompleted: 6,
    connectedLocations: ["galeria-arte"],
    backgroundColor: "#FFE4E1",
    category: "challenge"
  }
};

// Connection paths for breadcrumb trails (SVG paths will be generated)
const MAP_CONNECTIONS = [
  { from: "la-plaza", to: "el-mercado", style: "main" },
  { from: "la-plaza", to: "hotel-colonial", style: "main" },
  { from: "la-plaza", to: "el-parque", style: "main" },
  { from: "el-mercado", to: "hotel-colonial", style: "side" },
  { from: "el-mercado", to: "la-cafe", style: "main" },
  { from: "hotel-colonial", to: "escuela-musica", style: "main" },
  { from: "la-cafe", to: "el-parque", style: "side" },
  { from: "la-cafe", to: "el-muelle", style: "main" },
  { from: "escuela-musica", to: "la-playa", style: "main" },
  { from: "la-playa", to: "el-muelle", style: "side" },
  { from: "el-parque", to: "galeria-arte", style: "main" },
  { from: "galeria-arte", to: "la-plaza", style: "side" },
  { from: "galeria-arte", to: "el-faro", style: "main" }
];

// Location categories for filtering/organizing
const LOCATION_CATEGORIES = {
  community: { name: "Community", icon: "👥", color: "#FFE5B4" },
  shopping: { name: "Shopping", icon: "🛍️", color: "#90EE90" },
  hospitality: { name: "Hospitality", icon: "🏨", color: "#FFB6C1" },
  dining: { name: "Dining", icon: "🍽️", color: "#DEB887" },
  recreation: { name: "Recreation", icon: "⚽", color: "#87CEEB" },
  arts: { name: "Arts & Music", icon: "🎭", color: "#DDA0DD" },
  maritime: { name: "Maritime", icon: "⛵", color: "#B0C4DE" },
  nature: { name: "Nature", icon: "🌿", color: "#98FB98" },
  culture: { name: "Culture", icon: "🏛️", color: "#F0E68C" },
  challenge: { name: "Challenge", icon: "⚡", color: "#FFE4E1" }
};

// Helper function to check if a location should be unlocked
function checkLocationUnlock(locationId, userProgress) {
  const location = MAP_LOCATIONS[locationId];
  if (!location) return false;

  // Already unlocked
  if (location.unlocked) return true;

  // Check CEFR level requirement
  if (location.requiredLevel) {
    const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];
    const userLevelIndex = levelOrder.indexOf(userProgress.cefrLevel);
    const requiredLevelIndex = levelOrder.indexOf(location.requiredLevel);
    if (userLevelIndex < requiredLevelIndex) return false;
  }

  // Check minimum quests completed
  if (location.minQuestsCompleted) {
    if (userProgress.questsCompleted < location.minQuestsCompleted) return false;
  }

  // Check required quests
  if (location.requiredQuests && location.requiredQuests.length > 0) {
    const hasAllQuests = location.requiredQuests.every(questId =>
      userProgress.completedQuests.includes(questId)
    );
    if (!hasAllQuests) return false;
  }

  // Check required locations
  if (location.requiredLocations && location.requiredLocations.length > 0) {
    const hasAllLocations = location.requiredLocations.every(locId =>
      userProgress.unlockedLocations.includes(locId)
    );
    if (!hasAllLocations) return false;
  }

  return true;
}

// Helper function to get available quests at a location
function getQuestsAtLocation(locationId, questDatabase) {
  const quests = [];

  for (const [questId, quest] of Object.entries(questDatabase.quests)) {
    if (quest.mapLocation && quest.mapLocation.id === locationId) {
      quests.push({ id: questId, ...quest });
    }
  }

  return quests;
}

// Helper function to calculate breadcrumb path
function generateBreadcrumbPath(fromCoords, toCoords) {
  // Simple quadratic bezier curve
  const midX = (fromCoords.x + toCoords.x) / 2;
  const midY = (fromCoords.y + toCoords.y) / 2;

  // Add slight curve
  const controlX = midX;
  const controlY = midY - 5; // Curve upward slightly

  return `M ${fromCoords.x} ${fromCoords.y} Q ${controlX} ${controlY} ${toCoords.x} ${toCoords.y}`;
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.MAP_LOCATIONS = MAP_LOCATIONS;
  window.MAP_CONNECTIONS = MAP_CONNECTIONS;
  window.LOCATION_CATEGORIES = LOCATION_CATEGORIES;
  window.checkLocationUnlock = checkLocationUnlock;
  window.getQuestsAtLocation = getQuestsAtLocation;
  window.generateBreadcrumbPath = generateBreadcrumbPath;
}
