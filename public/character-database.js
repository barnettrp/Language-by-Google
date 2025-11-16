/**
 * ConvoQuest - Character Relationship Database
 *
 * Defines all characters in Puerto Esperanza with their personalities,
 * backstories, preferences, and relationship progression data.
 */

/**
 * RELATIONSHIP LEVELS
 * Defines the 5 tiers of friendship in ConvoQuest
 */
const RELATIONSHIP_LEVELS = {
  stranger: {
    minAffinity: 0,
    maxAffinity: 20,
    level: "Desconocido",
    levelEn: "Stranger",
    icon: "👋",
    color: "#9CA3AF",
    description: "You've just met",
    descriptionEs: "Acabas de conocer",
    unlockedFeatures: ["basic_conversations"]
  },
  acquaintance: {
    minAffinity: 21,
    maxAffinity: 50,
    level: "Conocido",
    levelEn: "Acquaintance",
    icon: "🙂",
    color: "#60A5FA",
    description: "They recognize you",
    descriptionEs: "Te reconocen",
    unlockedFeatures: ["personal_questions", "character_info"]
  },
  friend: {
    minAffinity: 51,
    maxAffinity: 75,
    level: "Amigo",
    levelEn: "Friend",
    icon: "😊",
    color: "#34D399",
    description: "You're becoming friends",
    descriptionEs: "Te estás haciendo amigo",
    unlockedFeatures: ["backstory", "special_vocabulary", "gift_giving", "free_talk"]
  },
  closeFriend: {
    minAffinity: 76,
    maxAffinity: 90,
    level: "Buen Amigo",
    levelEn: "Close Friend",
    icon: "🤗",
    color: "#F59E0B",
    description: "They trust you deeply",
    descriptionEs: "Confían en ti profundamente",
    unlockedFeatures: ["secrets", "exclusive_quests", "relationship_discount"]
  },
  confidant: {
    minAffinity: 91,
    maxAffinity: 100,
    level: "Confidente",
    levelEn: "Confidant",
    icon: "💙",
    color: "#8B5CF6",
    description: "Inseparable companions",
    descriptionEs: "Compañeros inseparables",
    unlockedFeatures: ["romance_path", "final_secrets", "special_ending", "mentor_status"]
  }
};

/**
 * AFFINITY ACTIONS
 * How different actions affect relationship affinity
 */
const AFFINITY_ACTIONS = {
  // Basic interactions
  completeQuestStage: 5,
  haveConversation: 2,
  usePoliteLanguage: 3,

  // Memory & personalization
  rememberDetail: 8,
  useFavoriteWord: 5,
  askAboutFamily: 6,

  // Special actions
  giveGift: 10,
  helpOtherCharacter: 7,
  completeCharacterQuest: 15,

  // Negative actions
  beRude: -5,
  ignoreGreeting: -3,
  forgetName: -10,
  daysWithoutContact: -2  // Per day after 7 days
};

/**
 * CHARACTER DATABASE
 * Main characters in Puerto Esperanza
 */
const CHARACTER_DATABASE = {
  carlos: {
    id: "carlos",
    name: "Carlos",
    fullName: "Carlos Mendoza",
    role: "Músico",
    roleEn: "Musician",
    age: 28,
    avatar: "🎸",
    portraitImage: "/images/characters/carlos.png",
    location: "hotel-colonial",
    locationName: "Hotel Colonial",

    // Personality
    personality: {
      traits: ["passionate", "romantic", "creative", "nervous"],
      formality: "informal",
      humor: "gentle",
      interests: ["music", "love", "performance", "flamenco"]
    },

    // Relationships with other characters
    relationships: {
      loves: ["elena"],
      friends: ["mateo"],
      rivals: ["javier"],
      family: ["madre_in_spain"]
    },

    // Backstory unlocked at different affinity levels
    backstory: {
      level_0: "Carlos plays guitar at the hotel most evenings.",
      level_20: "He's a talented musician from Madrid who performs traditional Spanish music.",
      level_50: "He moved from Madrid two years ago to pursue his music career and fell in love with Puerto Esperanza - and with Elena, the market vendor.",
      level_75: "His mother in Spain doesn't approve of his musician lifestyle - she wanted him to be a doctor. The pressure weighs on him, but he can't imagine giving up music.",
      level_90: "He's planning to propose to Elena but is terrified of rejection. His guitar was his grandfather's - the only family heirloom he has. It means everything to him."
    },

    // Favorites & preferences
    favorites: {
      color: "azul",
      colorEn: "blue",
      food: "paella",
      place: "la playa al atardecer",
      placeEn: "the beach at sunset",
      music: "flamenco",
      greeting: "¡Hola, amigo!",
      drink: "café con leche"
    },

    // Teaching style & vocabulary focus
    teachingStyle: {
      vocabularyFocus: ["music", "emotions", "romance", "performance"],
      phraseExamples: [
        "Estoy nervioso (I'm nervous)",
        "Te quiero (I love you)",
        "Mi corazón (My heart)",
        "Tocar la guitarra (To play guitar)"
      ],
      culturalNotes: [
        "Spanish music traditions",
        "Courtship customs in Spain",
        "Flamenco history"
      ]
    },

    // Unlockable exclusive quests
    exclusiveQuests: [
      {
        questId: "carlos-proposal-help",
        unlockAffinity: 75,
        title: "Ayuda con la Propuesta",
        titleEn: "Help with the Proposal",
        description: "Carlos needs your help planning the perfect proposal for Elena",
        descriptionEs: "Carlos necesita tu ayuda para planear la propuesta perfecta para Elena",
        estimatedDuration: 20,
        reward: { badge: "matchmaker", xp: 200, coins: 150 }
      },
      {
        questId: "carlos-concert",
        unlockAffinity: 60,
        title: "El Gran Concierto",
        titleEn: "The Big Concert",
        description: "Help Carlos prepare for his biggest performance yet",
        descriptionEs: "Ayuda a Carlos a prepararse para su presentación más importante",
        estimatedDuration: 15,
        reward: { badge: "music_supporter", xp: 150, coins: 100 }
      }
    ],

    // Gift preferences
    giftPreferences: {
      loves: [
        { item: "guitar_strings", name: "Cuerdas de Guitarra", nameEn: "Guitar Strings", affinity: 15 },
        { item: "music_book", name: "Libro de Música", nameEn: "Music Book", affinity: 12 }
      ],
      likes: [
        { item: "flowers", name: "Flores", nameEn: "Flowers", affinity: 8 },
        { item: "coffee", name: "Café", nameEn: "Coffee", affinity: 6 }
      ],
      dislikes: [
        { item: "spicy_food", name: "Comida Picante", nameEn: "Spicy Food", affinity: -2 }
      ]
    }
  },

  maria: {
    id: "maria",
    name: "María",
    fullName: "María González",
    role: "Vendedora",
    roleEn: "Market Vendor",
    age: 45,
    avatar: "👩‍🦱",
    portraitImage: "/images/characters/cq_vendor_female_1.PNG",
    location: "mercado",
    locationName: "El Mercado",

    personality: {
      traits: ["warm", "motherly", "business-savvy", "generous"],
      formality: "informal",
      humor: "warm",
      interests: ["cooking", "family", "community", "recipes"]
    },

    relationships: {
      family: ["son_university", "husband"],
      friends: ["elena", "sofia", "ana"],
      business: ["don_ernesto"]
    },

    backstory: {
      level_0: "María runs a popular fruit stand at the market.",
      level_20: "She's been running her fruit stand for over 20 years and knows everyone in Puerto Esperanza.",
      level_50: "She's saving every extra peso to send her son to university in Mexico City. He wants to be an engineer, and she's determined to make it happen.",
      level_75: "Her secret: She makes the best mango jam in Puerto Esperanza using her grandmother's recipe. She's only shared it with two people in her entire life.",
      level_90: "She dreams of opening a small restaurant serving her grandmother's traditional recipes, but fears it's too late to start over at her age. Would you encourage her?"
    },

    favorites: {
      color: "amarillo",
      colorEn: "yellow",
      food: "tamales",
      place: "el mercado por la mañana",
      placeEn: "the market in the morning",
      season: "verano",
      seasonEn: "summer",
      greeting: "¡Buenos días, mijo!",
      drink: "agua de jamaica"
    },

    teachingStyle: {
      vocabularyFocus: ["food", "family", "market", "prices", "cooking"],
      phraseExamples: [
        "¿Cuánto cuesta? (How much does it cost?)",
        "Está fresco (It's fresh)",
        "Para mi familia (For my family)",
        "¿Qué desea? (What would you like?)"
      ],
      culturalNotes: [
        "Mexican market culture",
        "Haggling etiquette",
        "Traditional Mexican recipes",
        "Family values in Hispanic culture"
      ]
    },

    exclusiveQuests: [
      {
        questId: "maria-secret-recipe",
        unlockAffinity: 75,
        title: "La Receta Secreta de Abuela",
        titleEn: "Grandma's Secret Recipe",
        description: "María trusts you enough to share her grandmother's famous mango jam recipe",
        descriptionEs: "María confía en ti lo suficiente para compartir la famosa receta de mermelada de mango de su abuela",
        estimatedDuration: 18,
        reward: { badge: "trusted_friend", item: "recipe_book", xp: 180, coins: 120 }
      },
      {
        questId: "maria-son-university",
        unlockAffinity: 90,
        title: "Ayuda para la Universidad",
        titleEn: "Help with University",
        description: "Help María prepare her son for university life in Mexico City",
        descriptionEs: "Ayuda a María a preparar a su hijo para la vida universitaria en la Ciudad de México",
        estimatedDuration: 22,
        reward: { badge: "family_friend", xp: 250, coins: 200 }
      },
      {
        questId: "maria-restaurant-dream",
        unlockAffinity: 85,
        title: "El Sueño del Restaurante",
        titleEn: "The Restaurant Dream",
        description: "Encourage María to pursue her dream of opening a restaurant",
        descriptionEs: "Anima a María a perseguir su sueño de abrir un restaurante",
        estimatedDuration: 20,
        reward: { badge: "dream_supporter", xp: 220, coins: 180 }
      }
    ],

    giftPreferences: {
      loves: [
        { item: "ingredients", name: "Ingredientes Especiales", nameEn: "Special Ingredients", affinity: 14 },
        { item: "recipe_cards", name: "Tarjetas de Recetas", nameEn: "Recipe Cards", affinity: 12 }
      ],
      likes: [
        { item: "flowers", name: "Flores", nameEn: "Flowers", affinity: 10 },
        { item: "family_photo_frame", name: "Marco de Fotos", nameEn: "Photo Frame", affinity: 9 },
        { item: "fruit", name: "Frutas Exóticas", nameEn: "Exotic Fruit", affinity: 7 }
      ],
      dislikes: [
        { item: "expensive_jewelry", name: "Joyería Cara", nameEn: "Expensive Jewelry", affinity: -3, reason: "She'd feel uncomfortable accepting something so valuable" }
      ]
    }
  },

  sofia: {
    id: "sofia",
    name: "Sofia",
    fullName: "Sofia Ramirez",
    role: "Barista",
    roleEn: "Barista",
    age: 24,
    avatar: "☕",
    portraitImage: "/images/characters/cq_barista_female_1.PNG",
    location: "cafe-del-puerto",
    locationName: "Café del Puerto",

    personality: {
      traits: ["friendly", "energetic", "curious", "talkative"],
      formality: "informal",
      humor: "playful",
      interests: ["coffee", "gossip", "art", "travel"]
    },

    relationships: {
      friends: ["maria", "elena", "carolina"],
      crush: ["miguel_taxi"],
      mentor: ["roberto_chef"]
    },

    backstory: {
      level_0: "Sofia is the cheerful barista at Café del Puerto.",
      level_20: "She's studying art history at night while working at the café during the day. Her dream is to visit the Prado Museum in Madrid.",
      level_50: "She moved to Puerto Esperanza from Guadalajara a year ago to escape family pressure to become a lawyer. The café is her sanctuary.",
      level_75: "She's secretly in love with Miguel, the taxi driver, but doesn't know how to tell him. She makes his coffee exactly how he likes it every morning and hopes he'll notice.",
      level_90: "She's been accepted to an art program in Barcelona but is terrified to leave Puerto Esperanza and the life she's built here. She values your advice more than anyone's."
    },

    favorites: {
      color: "rosa",
      colorEn: "pink",
      food: "pan dulce",
      place: "la galería de arte",
      placeEn: "the art gallery",
      artist: "Frida Kahlo",
      greeting: "¡Hola! ¿Qué tal?",
      drink: "café con canela"
    },

    teachingStyle: {
      vocabularyFocus: ["coffee", "drinks", "conversation", "art", "feelings"],
      phraseExamples: [
        "¿Qué te gustaría? (What would you like?)",
        "Con mucho gusto (With pleasure)",
        "Me encanta (I love it)",
        "¿Cómo te sientes? (How do you feel?)"
      ],
      culturalNotes: [
        "Café culture in Latin America",
        "Mexican art history",
        "Social customs in cafés",
        "Frida Kahlo's legacy"
      ]
    },

    exclusiveQuests: [
      {
        questId: "sofia-miguel-confession",
        unlockAffinity: 75,
        title: "Ayuda con el Amor",
        titleEn: "Help with Love",
        description: "Help Sofia find the courage to tell Miguel how she feels",
        descriptionEs: "Ayuda a Sofia a encontrar el valor para decirle a Miguel cómo se siente",
        estimatedDuration: 16,
        reward: { badge: "cupid", xp: 170, coins: 130 }
      },
      {
        questId: "sofia-barcelona-decision",
        unlockAffinity: 90,
        title: "La Decisión de Barcelona",
        titleEn: "The Barcelona Decision",
        description: "Help Sofia decide whether to pursue her dream in Barcelona or stay in Puerto Esperanza",
        descriptionEs: "Ayuda a Sofia a decidir si perseguir su sueño en Barcelona o quedarse en Puerto Esperanza",
        estimatedDuration: 25,
        reward: { badge: "life_advisor", xp: 240, coins: 190 }
      },
      {
        questId: "sofia-art-exhibition",
        unlockAffinity: 65,
        title: "La Primera Exposición",
        titleEn: "The First Exhibition",
        description: "Help Sofia prepare for her first art exhibition at the local gallery",
        descriptionEs: "Ayuda a Sofia a prepararse para su primera exposición de arte en la galería local",
        estimatedDuration: 18,
        reward: { badge: "art_supporter", xp: 160, coins: 110 }
      }
    ],

    giftPreferences: {
      loves: [
        { item: "art_book", name: "Libro de Arte", nameEn: "Art Book", affinity: 16 },
        { item: "frida_poster", name: "Póster de Frida Kahlo", nameEn: "Frida Kahlo Poster", affinity: 14 }
      ],
      likes: [
        { item: "coffee_beans", name: "Granos de Café", nameEn: "Coffee Beans", affinity: 9 },
        { item: "flowers", name: "Flores", nameEn: "Flowers", affinity: 8 },
        { item: "pastries", name: "Pasteles", nameEn: "Pastries", affinity: 7 }
      ],
      dislikes: [
        { item: "energy_drink", name: "Bebida Energética", nameEn: "Energy Drink", affinity: -2, reason: "She believes in natural energy from good coffee" }
      ]
    }
  },

  mateo: {
    id: "mateo",
    name: "Mateo",
    fullName: "Mateo Vargas",
    role: "Conserje",
    roleEn: "Concierge",
    age: 52,
    avatar: "👨‍💼",
    portraitImage: "/images/characters/mateo.png",
    location: "hotel-colonial",
    locationName: "Hotel Colonial",

    personality: {
      traits: ["professional", "wise", "discreet", "observant"],
      formality: "formal",
      humor: "dry",
      interests: ["history", "service", "classical_music", "wine"]
    },

    relationships: {
      friends: ["carlos", "roberto"],
      mentors: ["young_staff"],
      family: ["daughter_doctor"],
      respects: ["lucia_security"]
    },

    backstory: {
      level_0: "Mateo is the professional and courteous concierge at Hotel Colonial.",
      level_20: "He's worked at Hotel Colonial for 30 years and knows every secret passage and hidden story in the building. Nothing escapes his notice.",
      level_50: "He was once a history professor but left academia after his wife passed away. The hotel became his new home, and helping guests became his purpose.",
      level_75: "His daughter is a successful doctor in Buenos Aires, and he's incredibly proud of her. She wants him to retire and move in with her, but he can't imagine leaving the hotel or Puerto Esperanza.",
      level_90: "He's writing a book about the history of Hotel Colonial and Puerto Esperanza. You're the first person he's shown his manuscript to. He values your opinion deeply and considers you like family."
    },

    favorites: {
      color: "azul marino",
      colorEn: "navy blue",
      food: "ceviche",
      place: "la biblioteca del hotel",
      placeEn: "the hotel library",
      music: "música clásica",
      musicEn: "classical music",
      greeting: "Buenos días, señor/señorita",
      drink: "vino tinto"
    },

    teachingStyle: {
      vocabularyFocus: ["hospitality", "formal_language", "history", "professionalism"],
      phraseExamples: [
        "¿En qué puedo servirle? (How may I serve you?)",
        "Con permiso (Excuse me)",
        "Es un placer (It's a pleasure)",
        "A sus órdenes (At your service)"
      ],
      culturalNotes: [
        "Formal vs informal address in Spanish",
        "Hotel and hospitality culture",
        "Latin American history",
        "Professional etiquette"
      ]
    },

    exclusiveQuests: [
      {
        questId: "mateo-hotel-history",
        unlockAffinity: 70,
        title: "Historia del Hotel Colonial",
        titleEn: "History of Hotel Colonial",
        description: "Help Mateo research the hotel's fascinating history for his book",
        descriptionEs: "Ayuda a Mateo a investigar la fascinante historia del hotel para su libro",
        estimatedDuration: 20,
        reward: { badge: "historian", xp: 190, coins: 140 }
      },
      {
        questId: "mateo-retirement-decision",
        unlockAffinity: 90,
        title: "La Decisión de Jubilación",
        titleEn: "The Retirement Decision",
        description: "Help Mateo decide whether to retire to Buenos Aires or continue at the hotel",
        descriptionEs: "Ayuda a Mateo a decidir si jubilarse en Buenos Aires o continuar en el hotel",
        estimatedDuration: 24,
        reward: { badge: "trusted_advisor", xp: 260, coins: 210 }
      },
      {
        questId: "mateo-hidden-passages",
        unlockAffinity: 60,
        title: "Los Pasajes Secretos",
        titleEn: "The Secret Passages",
        description: "Mateo reveals the hotel's secret passages and hidden rooms",
        descriptionEs: "Mateo revela los pasajes secretos y habitaciones ocultas del hotel",
        estimatedDuration: 17,
        reward: { badge: "explorer", xp: 155, coins: 115 }
      }
    ],

    giftPreferences: {
      loves: [
        { item: "vintage_wine", name: "Vino Vintage", nameEn: "Vintage Wine", affinity: 17 },
        { item: "history_book", name: "Libro de Historia", nameEn: "History Book", affinity: 15 }
      ],
      likes: [
        { item: "classical_cd", name: "CD de Música Clásica", nameEn: "Classical Music CD", affinity: 10 },
        { item: "leather_journal", name: "Diario de Cuero", nameEn: "Leather Journal", affinity: 9 },
        { item: "tea", name: "Té Fino", nameEn: "Fine Tea", affinity: 7 }
      ],
      dislikes: [
        { item: "casual_clothes", name: "Ropa Casual", nameEn: "Casual Clothes", affinity: -1, reason: "He only wears formal attire" }
      ]
    }
  },

  elena: {
    id: "elena",
    name: "Elena",
    fullName: "Elena Torres",
    role: "Vendedora",
    roleEn: "Vendor",
    age: 26,
    avatar: "👩‍🦱",
    portraitImage: "/images/characters/elena.png",
    location: "mercado",
    locationName: "El Mercado",

    personality: {
      traits: ["kind", "shy", "artistic", "thoughtful"],
      formality: "informal",
      humor: "gentle",
      interests: ["flowers", "poetry", "nature", "music"]
    },

    relationships: {
      admirers: ["carlos"],
      friends: ["maria", "sofia"],
      family: ["grandmother_countryside"]
    },

    backstory: {
      level_0: "Elena sells beautiful flowers at the market.",
      level_20: "She grows many of the flowers herself in her small garden. Each arrangement is a work of art to her.",
      level_50: "She writes poetry in a journal every night but has never shown it to anyone. She dreams of publishing a book someday but thinks it's silly.",
      level_75: "She knows Carlos likes her - she's noticed how he always finds excuses to buy flowers. She likes him too but is afraid of getting hurt. Her last relationship ended badly when her ex moved away without saying goodbye.",
      level_90: "Her grandmother in the countryside is getting older and Elena worries about her constantly. She's torn between staying in Puerto Esperanza (where Carlos is) and moving back to care for her abuela. She trusts you with this secret burden."
    },

    favorites: {
      color: "lavanda",
      colorEn: "lavender",
      food: "ensalada fresca",
      place: "el jardín",
      placeEn: "the garden",
      flower: "girasoles",
      flowerEn: "sunflowers",
      greeting: "Hola... ¿cómo estás?",
      drink: "té de manzanilla"
    },

    teachingStyle: {
      vocabularyFocus: ["flowers", "nature", "emotions", "beauty", "poetry"],
      phraseExamples: [
        "¡Qué bonito! (How beautiful!)",
        "Me gusta mucho (I really like it)",
        "Con cuidado (Carefully)",
        "Es hermoso (It's beautiful)"
      ],
      culturalNotes: [
        "Flower symbolism in Hispanic culture",
        "Spanish romantic poetry",
        "Nature and gardening traditions",
        "Family bonds in Latin culture"
      ]
    },

    exclusiveQuests: [
      {
        questId: "elena-poetry-book",
        unlockAffinity: 75,
        title: "El Libro de Poesía",
        titleEn: "The Poetry Book",
        description: "Elena shares her secret poetry with you and asks for your honest opinion",
        descriptionEs: "Elena comparte su poesía secreta contigo y pide tu opinión honesta",
        estimatedDuration: 19,
        reward: { badge: "poetry_critic", xp: 185, coins: 135 }
      },
      {
        questId: "elena-carlos-feelings",
        unlockAffinity: 65,
        title: "Sentimientos Confusos",
        titleEn: "Confused Feelings",
        description: "Elena confides in you about her feelings for Carlos",
        descriptionEs: "Elena te confía sus sentimientos por Carlos",
        estimatedDuration: 16,
        reward: { badge: "confidant", xp: 165, coins: 120 }
      },
      {
        questId: "elena-grandmother-dilemma",
        unlockAffinity: 90,
        title: "El Dilema de la Abuela",
        titleEn: "Grandmother's Dilemma",
        description: "Help Elena make the difficult choice between love and family duty",
        descriptionEs: "Ayuda a Elena a tomar la difícil decisión entre el amor y el deber familiar",
        estimatedDuration: 26,
        reward: { badge: "wise_counselor", xp: 270, coins: 220 }
      }
    ],

    giftPreferences: {
      loves: [
        { item: "poetry_book", name: "Libro de Poesía", nameEn: "Poetry Book", affinity: 18 },
        { item: "gardening_tools", name: "Herramientas de Jardinería", nameEn: "Gardening Tools", affinity: 14 }
      ],
      likes: [
        { item: "seeds", name: "Semillas Raras", nameEn: "Rare Seeds", affinity: 11 },
        { item: "journal", name: "Diario Bonito", nameEn: "Pretty Journal", affinity: 10 },
        { item: "tea", name: "Té de Hierbas", nameEn: "Herbal Tea", affinity: 8 }
      ],
      dislikes: [
        { item: "perfume", name: "Perfume", nameEn: "Perfume", affinity: -2, reason: "She prefers natural flower scents" }
      ]
    }
  }
};

/**
 * Helper function to get relationship level based on affinity score
 */
function getRelationshipLevel(affinity) {
  if (affinity >= 91) return RELATIONSHIP_LEVELS.confidant;
  if (affinity >= 76) return RELATIONSHIP_LEVELS.closeFriend;
  if (affinity >= 51) return RELATIONSHIP_LEVELS.friend;
  if (affinity >= 21) return RELATIONSHIP_LEVELS.acquaintance;
  return RELATIONSHIP_LEVELS.stranger;
}

/**
 * Helper function to get character's unlocked backstory based on affinity
 */
function getUnlockedBackstory(characterId, affinity) {
  const character = CHARACTER_DATABASE[characterId];
  if (!character) return null;

  const backstoryLevels = [];

  if (affinity >= 0) backstoryLevels.push(character.backstory.level_0);
  if (affinity >= 20) backstoryLevels.push(character.backstory.level_20);
  if (affinity >= 50) backstoryLevels.push(character.backstory.level_50);
  if (affinity >= 75) backstoryLevels.push(character.backstory.level_75);
  if (affinity >= 90) backstoryLevels.push(character.backstory.level_90);

  return backstoryLevels;
}

/**
 * Helper function to get available exclusive quests for a character
 */
function getAvailableQuests(characterId, affinity) {
  const character = CHARACTER_DATABASE[characterId];
  if (!character || !character.exclusiveQuests) return [];

  return character.exclusiveQuests.filter(quest => affinity >= quest.unlockAffinity);
}

/**
 * Helper function to calculate affinity change based on days since last contact
 */
function calculateInactivityPenalty(daysSinceLastContact) {
  if (daysSinceLastContact <= 7) return 0;
  return (daysSinceLastContact - 7) * AFFINITY_ACTIONS.daysWithoutContact;
}

/**
 * Get all characters sorted by affinity (for UI display)
 */
function getCharactersByAffinity(userRelationships) {
  const characters = Object.values(CHARACTER_DATABASE).map(char => {
    const relationship = userRelationships[char.id] || { affinity: 0 };
    return {
      ...char,
      currentAffinity: relationship.affinity || 0,
      relationshipLevel: getRelationshipLevel(relationship.affinity || 0)
    };
  });

  // Sort by affinity (highest first)
  return characters.sort((a, b) => b.currentAffinity - a.currentAffinity);
}

/**
 * Get characters grouped by relationship level
 */
function getCharactersGroupedByLevel(userRelationships) {
  const grouped = {
    confidant: [],
    closeFriend: [],
    friend: [],
    acquaintance: [],
    stranger: []
  };

  Object.values(CHARACTER_DATABASE).forEach(char => {
    const relationship = userRelationships[char.id] || { affinity: 0 };
    const affinity = relationship.affinity || 0;
    const level = getRelationshipLevel(affinity);

    const charData = {
      ...char,
      currentAffinity: affinity,
      relationshipLevel: level
    };

    if (affinity >= 91) grouped.confidant.push(charData);
    else if (affinity >= 76) grouped.closeFriend.push(charData);
    else if (affinity >= 51) grouped.friend.push(charData);
    else if (affinity >= 21) grouped.acquaintance.push(charData);
    else grouped.stranger.push(charData);
  });

  return grouped;
}

// ES Module exports for use in browser
export {
  CHARACTER_DATABASE,
  RELATIONSHIP_LEVELS,
  AFFINITY_ACTIONS,
  getRelationshipLevel,
  getUnlockedBackstory,
  getAvailableQuests,
  calculateInactivityPenalty,
  getCharactersByAffinity,
  getCharactersGroupedByLevel
};
