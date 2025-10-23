/**
 * ConvoQuest - Quest Database
 *
 * This file contains all quest definitions with enhanced metadata,
 * learning objectives, and progression logic.
 */

const QUEST_DATABASE = {
  quests: {
    "missing-guitar": {
      id: "missing-guitar",
      title: "The Missing Guitar",
      objective: "Piece together clues across Puerto Esperanza to recover Carlos's missing guitar before his headline performance.",

      // Map Location
      mapLocation: {
        id: "hotel-colonial",
        name: "El Hotel Colonial",
        icon: "🏨"
      },

      // Metadata
      difficulty: "beginner",
      requiredLevel: "A1",
      estimatedDuration: 25, // minutes
      category: "mystery",
      tags: ["music", "investigation", "mexico", "coastal", "hotel"],

      // Media
      thumbnailImage: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop",
      mapImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1887&auto=format&fit=crop",

      // Learning objectives
      focusGrammar: ["present tense", "question formation", "past tense"],
      focusVocabulary: ["music instruments", "locations", "descriptions", "time expressions"],

      // Prerequisites
      prerequisites: [],

      // Stages
      stages: {
        "1": {
          id: "1",
          characterName: "Mateo, the Concierge",
          characterGender: "male",
          characterAvatar: "👨‍💼",
          location: "Hotel Colonial Lobby, Puerto Esperanza",

          vignette: {
            en: "You're in the elegant lobby of Hotel Colonial. The concierge looks worried. Your goal: Find out who the musician is and where he was last seen.",
            es: "Estás en el elegante vestíbulo del Hotel Colonial. El conserje parece preocupado. Tu objetivo: Descubrir quién es el músico y dónde fue visto por última vez."
          },

          systemPrompt: "You are Mateo, a professional but worried hotel concierge at Hotel Colonial in Puerto Esperanza. A famous musician named Carlos has lost his guitar and he's staying at your hotel. You're very concerned about the hotel's reputation. Speak naturally and show your worry. Answer questions about Carlos and mention that he was last seen at the plaza.",

          initialMessage: "Buenos días. ¿En qué puedo ayudarle hoy?",

          // Stage objectives for tracking
          objectives: [
            {
              id: "learn_musician_name",
              type: "extract_info",
              target: "musician_name",
              description: "Find out the musician's name",
              keywords: ["Carlos", "musician", "artista"],
              required: true,
              hints: [
                "Try asking 'Who is the musician?'",
                "Say 'Can you tell me about the guest who lost something?'",
                "Ask '¿Quién es el músico?'"
              ]
            },
            {
              id: "learn_last_location",
              type: "extract_info",
              target: "last_seen_location",
              description: "Find out where he was last seen",
              keywords: ["plaza", "last seen", "vio", "última vez"],
              required: true,
              hints: [
                "Ask 'Where was he last seen?'",
                "Try '¿Dónde lo viste por última vez?'",
                "Say 'Do you know where he went?'"
              ]
            }
          ],

          // Adaptive difficulty
          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "short" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "B2": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "C1": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" },
            "C2": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 3,
            objectivesRequired: 1, // At least 1 of 2 objectives
            timeLimit: null
          },

          reward: {
            clue: "Musician 'Carlos' was last seen at the plaza.",
            xp: 50,
            achievements: ["first_investigation"],
            unlockedContent: ["plaza_location"],
            items: []
          },

          nextStages: [
            {
              id: "2a",
              condition: "default",
              label: "Visit the Plaza"
            },
            {
              id: "2b",
              condition: "alternative",
              label: "Check the Restaurant"
            }
          ]
        },

        "2a": {
          id: "2a",
          characterName: "Elena, the Vendor",
          characterGender: "female",
          characterAvatar: "👩‍🦱",
          location: "La Plaza Central, Puerto Esperanza",

          vignette: {
            en: "You arrive at the bustling plaza filled with vendors and street performers. A friendly vendor catches your eye. Your goal: Ask her if she saw Carlos and learn about the rival musician.",
            es: "Llegas a la plaza bulliciosa llena de vendedores y artistas callejeros. Una vendedora amigable llama tu atención. Tu objetivo: Pregúntale si vio a Carlos y aprende sobre el músico rival."
          },

          systemPrompt: "You are Elena, a chatty and knowledgeable street vendor in La Plaza Central of Puerto Esperanza. You sell handmade crafts and know everyone in the area. You saw Carlos yesterday with another musician named Javier - they seemed to be arguing. You're friendly and love to talk, but customers need to ask you specific questions. Speak naturally with some local coastal expressions.",

          initialMessage: "¡Hola! ¿Buscas algo bonito? ¡Tengo artesanías hermosas!",

          objectives: [
            {
              id: "ask_about_carlos",
              type: "extract_info",
              target: "carlos_sighting",
              description: "Ask if she saw Carlos",
              keywords: ["Carlos", "musician", "guitar", "viste"],
              required: true,
              hints: [
                "Try asking '¿Viste a Carlos?'",
                "Say 'Did you see a musician here?'",
                "Ask about someone with a guitar"
              ]
            },
            {
              id: "learn_about_javier",
              type: "extract_info",
              target: "rival_musician",
              description: "Learn about the rival musician Javier",
              keywords: ["Javier", "otro músico", "another musician", "arguing", "discutiendo"],
              required: true,
              hints: [
                "Ask who Carlos was with",
                "Try '¿Con quién estaba?'",
                "Say 'Did you see anyone with him?'"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "B2": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" },
            "C1": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" },
            "C2": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Carlos was seen with a rival musician, Javier. They were arguing!",
            xp: 75,
            achievements: ["social_butterfly"],
            unlockedContent: ["javier_profile"],
            items: []
          },

          nextStages: [
            {
              id: "3",
              condition: "default",
              label: "Find Javier's Studio"
            }
          ]
        },

        "2b": {
          id: "2b",
          characterName: "Roberto, the Chef",
          characterGender: "male",
          characterAvatar: "👨‍🍳",
          location: "Hotel Restaurant",

          vignette: {
            en: "You head to the hotel restaurant. The chef is preparing for lunch service. Your goal: Find out if Carlos ate here recently and what he talked about.",
            es: "Te diriges al restaurante del hotel. El chef está preparando el servicio de almuerzo. Tu objetivo: Averiguar si Carlos comió aquí recientemente y de qué habló."
          },

          systemPrompt: "You are Roberto, a passionate chef at the hotel restaurant. You remember Carlos came for breakfast yesterday morning and seemed nervous. He mentioned having a big performance tonight and something about a rival musician. You're busy but willing to help if asked nicely. Speak with pride about your food.",

          initialMessage: "¡Bienvenido! ¿Vienes para el almuerzo?",

          objectives: [
            {
              id: "ask_about_carlos_visit",
              type: "extract_info",
              target: "carlos_breakfast",
              description: "Find out if Carlos was here",
              keywords: ["Carlos", "desayuno", "breakfast", "yesterday", "ayer"],
              required: true,
              hints: [
                "Ask if Carlos ate here recently",
                "Try '¿Carlos estuvo aquí?'",
                "Say 'Did a musician come for breakfast?'"
              ]
            },
            {
              id: "learn_about_performance",
              type: "extract_info",
              target: "performance_info",
              description: "Learn about tonight's performance",
              keywords: ["performance", "tonight", "esta noche", "concierto", "show"],
              required: true,
              hints: [
                "Ask what Carlos talked about",
                "Try '¿De qué hablaba?'",
                "Say 'Did he mention anything important?'"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "B2": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" },
            "C1": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" },
            "C2": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Carlos has a performance tonight. He mentioned a rival musician and seemed worried.",
            xp: 75,
            achievements: ["detective_work"],
            unlockedContent: ["performance_venue"],
            items: []
          },

          nextStages: [
            {
              id: "3",
              condition: "default",
              label: "Find Javier's Studio"
            }
          ]
        },

        "3": {
          id: "3",
          characterName: "Javier, the Rival",
          characterGender: "male",
          characterAvatar: "🎸",
          location: "Music Studio",

          vignette: {
            en: "You find Javier's music studio. He's practicing guitar. Your goal: Confront him about the missing guitar and solve the mystery!",
            es: "Encuentras el estudio de música de Javier. Está practicando la guitarra. Tu objetivo: ¡Confróntalo sobre la guitarra perdida y resuelve el misterio!"
          },

          systemPrompt: "You are Javier, another musician and Carlos's rival. You and Carlos had an argument yesterday about a music competition, but you didn't take his guitar - you actually saw someone suspicious near the hotel storage room. You're defensive at first but willing to help once you realize the player is trying to help Carlos. Speak with a bit of attitude initially, then become more cooperative.",

          initialMessage: "¿Qué quieres? I'm busy practicing for MY performance tonight.",

          objectives: [
            {
              id: "confront_about_guitar",
              type: "extract_info",
              target: "guitar_accusation",
              description: "Ask Javier directly about the missing guitar",
              keywords: ["guitar", "guitarra", "Carlos", "took", "tomaste", "robaste"],
              required: true,
              hints: [
                "Ask if he took Carlos's guitar",
                "Try '¿Tomaste la guitarra de Carlos?'",
                "Confront him about the missing instrument"
              ]
            },
            {
              id: "build_trust_with_javier",
              type: "conversation_skill",
              target: "trust_building",
              description: "Calm Javier and show you just want to help",
              keywords: ["calm", "tranquilo", "ayudar", "competencia", "perdón"],
              required: true,
              hints: [
                "Acknowledge the rivalry but stay friendly",
                "Try reassuring him you're not accusing him",
                "Use polite phrases like 'Entiendo' or 'Gracias por hablar conmigo'"
              ]
            },
            {
              id: "obtain_security_tip",
              type: "extract_info",
              target: "storage_room_clue",
              description: "Learn who had access to the storage room",
              keywords: ["storage", "almacén", "security", "seguridad", "personal", "empleado"],
              required: true,
              hints: [
                "Ask if he saw anything suspicious",
                "Find out who was near the storage room",
                "Try '¿Quién tenía las llaves del almacén?'"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "B2": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" },
            "C1": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" },
            "C2": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 5,
            objectivesRequired: 3,
            timeLimit: null
          },

          reward: {
            clue: "Javier swears he's innocent and mentions Lucía from hotel security took the storage keys.",
            xp: 90,
            achievements: ["rival_diplomat"],
            unlockedContent: ["security_office_location"],
            items: []
          },

          nextStages: [
            {
              id: "4",
              condition: "default",
              label: "Talk to Hotel Security"
            }
          ]
        },

        "4": {
          id: "4",
          characterName: "Lucía, Head of Security",
          characterGender: "female",
          characterAvatar: "🛡️",
          location: "Hotel Security Office",

          vignette: {
            en: "You arrive at the hotel's security office where Lucía reviews camera feeds and key logs. She looks serious but determined to help.",
            es: "Llegas a la oficina de seguridad del hotel donde Lucía revisa las cámaras y los registros de llaves. Parece seria pero dispuesta a ayudar."
          },

          systemPrompt: "You are Lucía, the hotel's head of security. You're organized, mission-focused, and speak in clear, direct Spanish. You know the storage room protocol and want to ensure nothing else goes missing. Guide the player through safety procedures before allowing them into storage. If they cooperate respectfully, share what you observed on the cameras.",

          initialMessage: "Hola. Soy Lucía, la jefa de seguridad. ¿Por qué necesitas acceder al almacén?",

          objectives: [
            {
              id: "request_storage_access",
              type: "conversation_skill",
              target: "polite_request",
              description: "Politely explain why you need access to the storage room",
              keywords: ["necesito", "por favor", "guitarra", "permiso", "acceso"],
              required: true,
              hints: [
                "State who sent you and why",
                "Use polite forms like '¿Podría...?'",
                "Mention that the guitar is for tonight's show"
              ]
            },
            {
              id: "confirm_security_protocol",
              type: "task_sequence",
              target: "protocol_steps",
              description: "Acknowledge and repeat the security steps Lucía explains",
              keywords: ["pasos", "protocol", "firmar", "identificación", "acompañarte"],
              required: true,
              hints: [
                "Listen for instructions about signing and ID",
                "Repeat the steps back to show understanding",
                "Ask clarifying questions if needed"
              ]
            },
            {
              id: "identify_storage_findings",
              type: "extract_info",
              target: "storage_discovery",
              description: "Learn what Lucía saw in the storage footage",
              keywords: ["cámaras", "grabación", "empleado", "equipaje", "seguridad"],
              required: true,
              hints: [
                "Ask who moved the guitar",
                "Find out if the guitar is still there",
                "Ask when you can retrieve it"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "B2": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" },
            "C1": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" },
            "C2": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 3,
            timeLimit: null
          },

          reward: {
            clue: "Lucía escorts you to storage: the guitar is safe but needs Carlos's signature for release.",
            xp: 110,
            achievements: ["security_clearance"],
            unlockedContent: ["green_room_location"],
            items: ["storage_keycard"]
          },

          nextStages: [
            {
              id: "5",
              condition: "default",
              label: "Return the Guitar to Carlos"
            }
          ]
        },

        "5": {
          id: "5",
          characterName: "Carlos, the Musician",
          characterGender: "male",
          characterAvatar: "🎤",
          location: "Backstage Green Room",

          vignette: {
            en: "Backstage is buzzing. Carlos paces nervously, waiting to hear if his guitar has been found. It's time to deliver the good news.",
            es: "El backstage está lleno de energía. Carlos camina nervioso, esperando saber si encontraron su guitarra. Es hora de darle las buenas noticias."
          },

          systemPrompt: "You are Carlos, a virtuosic guitarist minutes away from his show. You're anxious about the missing guitar but profoundly grateful to whoever recovers it. Speak warmly, express relief, and invite the player to practice language related to gratitude and future plans.",

          initialMessage: "¡Por favor dime que tienes noticias! No puedo tocar sin mi guitarra.",

          objectives: [
            {
              id: "deliver_good_news",
              type: "story_completion",
              target: "guitar_returned",
              description: "Tell Carlos the guitar is safe and will be signed out",
              keywords: ["encontré", "almacén", "seguridad", "firma", "tranquilo"],
              required: true,
              hints: [
                "Explain Lucía's instructions",
                "Reassure him the guitar is ready",
                "Use calming language like 'Tranquilo'"
              ]
            },
            {
              id: "express_gratitude",
              type: "conversation_skill",
              target: "gratitude_exchange",
              description: "Engage in a gratitude dialogue with Carlos",
              keywords: ["gracias", "agradecido", "aprecio", "ayuda", "favor"],
              required: true,
              hints: [
                "Respond to his thanks appropriately",
                "Share how his music inspires you",
                "Practice phrases like 'Fue un placer ayudarte'"
              ]
            },
            {
              id: "plan_future_support",
              type: "grammar_practice",
              target: "future_tense",
              description: "Discuss future plans for the show or future lessons",
              keywords: ["futuro", "próxima", "voy a", "haré", "ensayo"],
              required: true,
              hints: [
                "Talk about attending the concert",
                "Offer to help again in the future",
                "Use structures with 'ir a' or future tense endings"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "B2": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" },
            "C1": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" },
            "C2": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 3,
            timeLimit: null
          },

          reward: {
            clue: "Mission complete! Carlos signs for the guitar and dedicates tonight's encore to you.",
            xp: 150,
            achievements: ["hero_of_the_stage", "quest_complete_missing_guitar"],
            unlockedContent: ["vip_concert_invite"],
            items: ["backstage_pass"]
          },

          nextStages: []
        }
      }
    },

    "market-day": {
      id: "market-day",
      title: "Market Day",
      objective: "Coordinate the Mercado Central festival launch by organizing inventory, negotiating supplies, and inviting the community.",

      // Map Location
      mapLocation: {
        id: "el-mercado",
        name: "El Mercado",
        icon: "🛒"
      },

      difficulty: "beginner",
      requiredLevel: "A1",
      estimatedDuration: 25,
      category: "daily-life",
      tags: ["food", "market", "shopping", "culture", "mexico", "coastal"],

      thumbnailImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
      mapImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1887&auto=format&fit=crop",

      focusGrammar: ["numbers", "colors", "adjectives", "imperatives", "future tense"],
      focusVocabulary: ["fruits", "vegetables", "colors", "prices", "negotiations", "community events"],

      prerequisites: [],

      stages: {
        "1": {
          id: "1",
          characterName: "María, the Vendor",
          characterGender: "female",
          characterAvatar: "👩‍🌾",
          location: "El Mercado, Puerto Esperanza",

          vignette: {
            en: "You meet María at the vibrant seaside market. She needs help organizing her fruit stand. Your goal: Learn the names of fruits and help her count inventory.",
            es: "Conoces a María en el vibrante mercado junto al mar. Necesita ayuda organizando su puesto de frutas. Tu objetivo: Aprende los nombres de las frutas y ayúdala a contar el inventario."
          },

          // Image to display at start of stage
          stageImage: null, // Will be initialized after QUEST_IMAGES loads
          stageImageGenerator: "marketDay_stage1_fruitStand",

          systemPrompt: "You are María, a kind fruit vendor at the market in Puerto Esperanza. You need help counting and organizing fruits for the big market day tomorrow. You teach the player fruit names and numbers in Spanish naturally through conversation. Be patient and encouraging. At your stand you have: 8 red apples (manzanas rojas), 12 oranges (naranjas), 6 bananas (plátanos), 15 strawberries (fresas), and 3 watermelons (sandías). When they need to count specific fruits, refer to the image showing your fruit stand above with the exact inventory.",

          initialMessage: "¡Buenos días! Necesito ayuda preparando para el gran mercado de mañana. ¿Puedes ayudarme? Mira mi puesto de frutas arriba - ¡necesito contar todo!",

          objectives: [
            {
              id: "learn_fruit_names",
              type: "vocabulary_practice",
              target: "fruit_vocabulary",
              description: "Learn at least 3 fruit names",
              keywords: ["manzana", "naranja", "plátano", "fresa", "uva", "sandía"],
              required: true,
              hints: [
                "Ask about different fruits",
                "Try '¿Qué frutas tienes?'",
                "Say 'What is this called in Spanish?'"
              ]
            },
            {
              id: "count_fruits",
              type: "grammar_practice",
              target: "numbers",
              description: "Practice counting in Spanish",
              keywords: ["uno", "dos", "tres", "cuatro", "cinco", "diez", "veinte"],
              required: true,
              hints: [
                "Help count the fruits",
                "Try counting in Spanish: uno, dos, tres...",
                "Ask '¿Cuántos hay?'"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "short" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Inventory counted! María can now plan the color showcase for the festival announcement.",
            xp: 60,
            achievements: ["market_helper"],
            unlockedContent: ["color_lesson"],
            items: ["fruit_basket"]
          },

          nextStages: [
            {
              id: "2",
              condition: "default",
              label: "Organize by Colors"
            }
          ]
        },

        "2": {
          id: "2",
          characterName: "María, the Vendor",
          characterGender: "female",
          characterAvatar: "👩‍🌾",
          location: "El Mercado, Puerto Esperanza",

          vignette: {
            en: "Now María needs help organizing fruits by color for a beautiful display. Your goal: Learn color names and describe the fruits.",
            es: "Ahora María necesita ayuda organizando las frutas por color para una exhibición hermosa. Tu objetivo: Aprende los nombres de los colores y describe las frutas."
          },

          // Image to display at start of stage
          stageImage: null, // Will be initialized after QUEST_IMAGES loads
          stageImageGenerator: "marketDay_stage2_colorfulFruits",

          systemPrompt: "You are María. Now you're teaching the player about colors while organizing a colorful fruit display. Be enthusiastic about making the stand look beautiful. Use colors and adjectives naturally. Point out specific fruits in the colorful display above: red section (rojo) has apples and strawberries, yellow section (amarillo) has bananas and lemons, orange section (naranja) has oranges, green section (verde) has watermelon, purple section (morado) has grapes, and pink section (rosa) has peaches.",

          initialMessage: "¡Perfecto! Ahora vamos a hacer el puesto hermoso con colores. ¡Mira la exhibición colorida arriba! ¿Cuáles frutas son rojas?",

          objectives: [
            {
              id: "learn_colors",
              type: "vocabulary_practice",
              target: "colors",
              description: "Learn at least 4 colors",
              keywords: ["rojo", "amarillo", "verde", "naranja", "morado", "rosa"],
              required: true,
              hints: [
                "Name the colors you see",
                "Try 'Esta manzana es roja'",
                "Ask '¿De qué color es?'"
              ]
            },
            {
              id: "describe_fruits",
              type: "grammar_practice",
              target: "adjectives",
              description: "Describe fruits using colors and adjectives",
              keywords: ["rojo", "grande", "pequeño", "bonito", "fresco"],
              required: true,
              hints: [
                "Describe a fruit with color and size",
                "Try 'La sandía es verde y grande'",
                "Use adjectives like 'fresco' or 'bonito'"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Color display ready! But María is missing herbs and decorations from supplier Don Ernesto.",
            xp: 80,
            achievements: ["color_master"],
            unlockedContent: ["supplier_contact"],
            items: ["colorful_banner"]
          },

          nextStages: [
            {
              id: "3",
              condition: "default",
              label: "Call the Produce Supplier"
            }
          ]
        },

        "3": {
          id: "3",
          characterName: "Don Ernesto, the Supplier",
          characterGender: "male",
          characterAvatar: "🚚",
          location: "Produce Warehouse, Outside Mexico City",

          vignette: {
            en: "María connects you with Don Ernesto, the supplier who handles specialty herbs and decorations. He's surrounded by crates and juggling delivery routes.",
            es: "María te conecta con Don Ernesto, el proveedor que maneja hierbas especiales y decoraciones. Está rodeado de cajas y ajustando rutas de entrega."
          },

          systemPrompt: "You are Don Ernesto, a seasoned produce supplier. Speak in friendly but rapid Spanish. You appreciate organized customers and expect clear quantities, deadlines, and polite negotiation. You can rush an order if the player convinces you it's for a community festival.",

          initialMessage: "¡Buenas! Hablas con Don Ernesto. ¿Qué necesitas del almacén?",

          objectives: [
            {
              id: "confirm_missing_items",
              type: "extract_info",
              target: "order_details",
              description: "List the herbs and decorations that are missing",
              keywords: ["hierbas", "ramilletes", "decoraciones", "falta", "orden"],
              required: true,
              hints: [
                "Ask what items are pending",
                "Take notes on the quantities",
                "Try '¿Qué falta en la orden de María?'"
              ]
            },
            {
              id: "negotiate_delivery_time",
              type: "conversation_skill",
              target: "delivery_schedule",
              description: "Arrange a same-day delivery for the festival",
              keywords: ["entrega", "hoy", "urgente", "festival", "camioneta"],
              required: true,
              hints: [
                "Explain why the delivery is urgent",
                "Offer to help unload or pay quickly",
                "Use phrases like '¿Podrías enviarlo antes de las cuatro?'"
              ]
            },
            {
              id: "practice_numbers_discounts",
              type: "grammar_practice",
              target: "numbers_and_percent",
              description: "Confirm prices, quantities, or a possible discount",
              keywords: ["kilos", "cajas", "por ciento", "precio", "descuento"],
              required: true,
              hints: [
                "Review quantities using numbers",
                "Ask for a small festival discount",
                "Try '¿Cuánto cuesta si llevamos tres cajas?'"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "B2": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 5,
            objectivesRequired: 3,
            timeLimit: null
          },

          reward: {
            clue: "Delivery scheduled! Don Ernesto will arrive by 4 PM if the city permit is ready.",
            xp: 90,
            achievements: ["supply_chain"],
            unlockedContent: ["permit_office_location"],
            items: ["supplier_receipt"]
          },

          nextStages: [
            {
              id: "4",
              condition: "default",
              label: "Secure the Festival Permit"
            }
          ]
        },

        "4": {
          id: "4",
          characterName: "Carolina, the Festival Planner",
          characterGender: "female",
          characterAvatar: "🎉",
          location: "Municipal Cultural Office",

          vignette: {
            en: "The cultural office is filled with posters and clipboards. Carolina, the planner in charge, needs convincing to expedite the festival permit.",
            es: "La oficina cultural está llena de carteles y carpetas. Carolina, la planificadora, necesita que la convenzas para acelerar el permiso del festival."
          },

          systemPrompt: "You are Carolina, the municipal festival planner. You speak clear, formal Spanish and expect a structured proposal. If the player provides details about safety, community impact, and schedule, you can approve the permit and suggest promotional ideas.",

          initialMessage: "Buenos días. Para el permiso necesito información completa del evento. ¿Qué me traes?",

          objectives: [
            {
              id: "present_event_plan",
              type: "story_completion",
              target: "event_overview",
              description: "Present the festival plan: purpose, schedule, and participants",
              keywords: ["festival", "objetivo", "horario", "participantes", "seguridad"],
              required: true,
              hints: [
                "Explain why the festival matters",
                "Mention the delivery arriving at 4 PM",
                "Outline crowd control or safety steps"
              ]
            },
            {
              id: "complete_permit_requirements",
              type: "task_sequence",
              target: "permit_form",
              description: "Respond to Carolina's questions to fill the permit form",
              keywords: ["formulario", "firma", "responsable", "fecha", "contacto"],
              required: true,
              hints: [
                "Provide your name and role",
                "Confirm the time the market opens",
                "Ask if anything else is required"
              ]
            },
            {
              id: "coordinate_volunteers",
              type: "conversation_skill",
              target: "volunteer_plan",
              description: "Discuss volunteer roles for cleanup and welcoming visitors",
              keywords: ["voluntarios", "limpieza", "bienvenida", "turnos", "vecinos"],
              required: true,
              hints: [
                "Mention community members who can help",
                "Ask Carolina for suggestions",
                "Use expressions like 'Nos encargamos de...'"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "B2": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" },
            "C1": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 5,
            objectivesRequired: 3,
            timeLimit: null
          },

          reward: {
            clue: "Permit approved! Carolina recommends announcing the event on community radio with Señor Rivera.",
            xp: 110,
            achievements: ["community_connector"],
            unlockedContent: ["radio_station_location"],
            items: ["signed_permit"]
          },

          nextStages: [
            {
              id: "5",
              condition: "default",
              label: "Promote the Festival on the Radio"
            }
          ]
        },

        "5": {
          id: "5",
          characterName: "Señor Rivera, Radio Host",
          characterGender: "male",
          characterAvatar: "📻",
          location: "Radio Alegría Studio",

          vignette: {
            en: "The local radio studio smells like coffee and vinyl records. Señor Rivera is ready to put you live on air for a short announcement.",
            es: "El estudio de radio local huele a café y discos. El Señor Rivera está listo para ponerte al aire para un anuncio corto."
          },

          systemPrompt: "You are Señor Rivera, a charismatic community radio host. You keep the conversation lively and coach the player through delivering a persuasive announcement in Spanish. Encourage them to highlight activities, invite families, and mention the delivery from Don Ernesto.",

          initialMessage: "¡Bienvenido a Radio Alegría! Tienes un minuto al aire. ¿Listo para invitar a todo el barrio?",

          objectives: [
            {
              id: "craft_radio_pitch",
              type: "story_completion",
              target: "radio_script",
              description: "Deliver a compelling festival invitation on air",
              keywords: ["invitamos", "familias", "música", "degustaciones", "mañana"],
              required: true,
              hints: [
                "Mention time and place",
                "Highlight at least two attractions",
                "End with an enthusiastic call to action"
              ]
            },
            {
              id: "show_gratitude_radio",
              type: "conversation_skill",
              target: "gratitude_on_air",
              description: "Thank Señor Rivera and interact naturally on live radio",
              keywords: ["gracias", "agradecer", "programa", "audiencia", "apoyo"],
              required: true,
              hints: [
                "Compliment the show",
                "Thank the listeners",
                "Use phrases like 'Gracias por el espacio'"
              ]
            },
            {
              id: "confirm_event_success",
              type: "story_completion",
              target: "festival_ready",
              description: "Summarize the preparations and confirm everything is ready",
              keywords: ["permiso", "entrega", "decoraciones", "todo listo", "nos vemos"],
              required: true,
              hints: [
                "Mention the permit approval",
                "Remind listeners about Don Ernesto's delivery",
                "Close with '¡Nos vemos en el mercado!'"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" },
            "B2": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" },
            "C1": { aiPatience: "low", vocabularyLevel: "advanced", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 3,
            timeLimit: null
          },

          reward: {
            clue: "Festival mission complete! Radio listeners are excited and vendors are preparing extra samples.",
            xp: 140,
            achievements: ["market_headliner", "quest_complete_market_day"],
            unlockedContent: ["festival_photo_gallery"],
            items: ["radio_microphone_pin"]
          },

          nextStages: []
        }
      }
    },

    "cafe-order": {
      id: "cafe-order",
      title: "La Café Order",
      objective: "Navigate the menu, order your perfect coffee, and make small talk with locals at the seaside café.",

      // Map Location
      mapLocation: {
        id: "la-cafe",
        name: "La Café del Puerto",
        icon: "☕"
      },

      difficulty: "beginner",
      requiredLevel: "A1",
      estimatedDuration: 15,
      category: "daily-life",
      tags: ["food", "drink", "cafe", "conversation", "coastal"],

      thumbnailImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
      mapImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1887&auto=format&fit=crop",

      focusGrammar: ["present tense", "me gusta", "quisiera", "polite requests"],
      focusVocabulary: ["drinks", "food items", "sizes", "preferences", "money"],

      prerequisites: ["market-day"],

      stages: {
        "1": {
          id: "1",
          characterName: "Sofia, the Barista",
          characterGender: "female",
          characterAvatar: "👩‍🍳",
          location: "La Café del Puerto, Puerto Esperanza",

          vignette: {
            en: "You enter the cozy seaside café. The aroma of fresh coffee fills the air. Sofia, the friendly barista, greets you. Your goal: Study the menu and order your drink.",
            es: "Entras al acogedor café junto al mar. El aroma del café fresco llena el aire. Sofia, la barista amigable, te saluda. Tu objetivo: Estudia el menú y ordena tu bebida."
          },

          systemPrompt: "You are Sofia, an enthusiastic barista at La Café del Puerto in Puerto Esperanza. You love your job and help customers understand the menu. You offer coffee (café), latte (café con leche), cappuccino, juice (jugo), and tea (té) in small (pequeño), medium (mediano), and large (grande) sizes. Prices range from 25 to 60 pesos. Be patient and encouraging with Spanish learners.",

          initialMessage: "¡Bienvenido a La Café del Puerto! ¿Qué te puedo ofrecer hoy?",

          objectives: [
            {
              id: "study_menu",
              type: "extract_info",
              target: "menu_understanding",
              description: "Learn what drinks are available",
              keywords: ["café", "latte", "té", "jugo", "cappuccino", "menu"],
              required: true,
              hints: [
                "Ask '¿Qué tienen?' or 'What do you have?'",
                "Try 'Can I see the menu?'",
                "Ask about specific drinks"
              ]
            },
            {
              id: "place_order",
              type: "conversation_skill",
              target: "order_placement",
              description: "Place your drink order with size preference",
              keywords: ["quisiera", "quiero", "pequeño", "mediano", "grande", "por favor"],
              required: true,
              hints: [
                "Use 'Quisiera...' (I would like...)",
                "Specify size: pequeño, mediano, or grande",
                "Don't forget 'por favor'!"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "short" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 3,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Order placed! Now you need to pay and find a seat.",
            xp: 40,
            achievements: ["first_cafe_order"],
            unlockedContent: [],
            items: []
          },

          nextStages: [
            {
              id: "2",
              condition: "default",
              label: "Handle Payment"
            }
          ]
        },

        "2": {
          id: "2",
          characterName: "Sofia, the Barista",
          characterGender: "female",
          characterAvatar: "👩‍🍳",
          location: "La Café del Puerto, Puerto Esperanza",

          vignette: {
            en: "Sofia prepares your drink. Now it's time to pay. Your goal: Understand the price and handle the transaction in Spanish.",
            es: "Sofia prepara tu bebida. Ahora es momento de pagar. Tu objetivo: Entender el precio y manejar la transacción en español."
          },

          systemPrompt: "You are Sofia. The customer has ordered and now needs to pay. State the price clearly (between 25-60 pesos depending on their order). Help them with numbers if needed. Accept payment and give change if necessary. Be encouraging about their Spanish.",

          initialMessage: "¡Perfecto! Tu orden está lista. Son 45 pesos, por favor.",

          objectives: [
            {
              id: "understand_price",
              type: "grammar_practice",
              target: "numbers",
              description: "Understand and confirm the price",
              keywords: ["pesos", "cuánto", "precio", "cuesta", "cuarenta", "cincuenta"],
              required: true,
              hints: [
                "Ask '¿Cuánto cuesta?' (How much is it?)",
                "Practice numbers: cuarenta y cinco",
                "Repeat the price to confirm"
              ]
            },
            {
              id: "complete_payment",
              type: "conversation_skill",
              target: "payment_interaction",
              description: "Hand over money and receive change",
              keywords: ["aquí está", "gracias", "cambio", "tengo"],
              required: true,
              hints: [
                "Say 'Aquí está' (Here it is)",
                "Ask about change: '¿Cuánto de cambio?'",
                "Thank her: 'Gracias'"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "short" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 3,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Payment complete! Time to enjoy your drink and maybe chat with someone.",
            xp: 40,
            achievements: ["money_handler"],
            unlockedContent: [],
            items: []
          },

          nextStages: [
            {
              id: "3",
              condition: "default",
              label: "Chat with a Local"
            }
          ]
        },

        "3": {
          id: "3",
          characterName: "Miguel, a Regular",
          characterGender: "male",
          characterAvatar: "👨‍💼",
          location: "La Café del Puerto, Puerto Esperanza",

          vignette: {
            en: "You sit down with your coffee. A friendly local named Miguel strikes up a conversation. Your goal: Practice casual small talk in Spanish.",
            es: "Te sientas con tu café. Un local amigable llamado Miguel inicia una conversación. Tu objetivo: Practica conversación casual en español."
          },

          systemPrompt: "You are Miguel, a friendly regular at La Café del Puerto. You work nearby and come here every day. You're curious about newcomers and love to make small talk about Puerto Esperanza. Ask about where they're from, why they're here, and recommend places to visit. Keep it casual and friendly.",

          initialMessage: "¡Hola! No te he visto aquí antes. ¿Eres nuevo en Puerto Esperanza?",

          objectives: [
            {
              id: "introduce_yourself",
              type: "conversation_skill",
              target: "introduction",
              description: "Introduce yourself and where you're from",
              keywords: ["soy", "me llamo", "de", "vengo", "estoy"],
              required: true,
              hints: [
                "Say 'Me llamo...' (My name is...)",
                "Use 'Soy de...' (I'm from...)",
                "Explain why you're in Puerto Esperanza"
              ]
            },
            {
              id: "make_small_talk",
              type: "conversation_skill",
              target: "casual_conversation",
              description: "Ask Miguel questions and respond naturally",
              keywords: ["qué", "cómo", "dónde", "te gusta", "recomiendas"],
              required: true,
              hints: [
                "Ask what he likes about the town",
                "Ask for recommendations: '¿Qué recomiendas?'",
                "Share your thoughts about the café"
              ]
            }
          ],

          difficultyModifiers: {
            "A1": { aiPatience: "very_high", vocabularyLevel: "basic", responseLength: "short" },
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Great conversation! Miguel suggested visiting the beach for surf lessons.",
            xp: 50,
            achievements: ["social_butterfly_cafe", "quest_complete_cafe_order"],
            unlockedContent: ["la-playa"],
            items: ["miguel_phone_number"]
          },

          nextStages: []
        }
      }
    },

    "surf-lesson": {
      id: "surf-lesson",
      title: "Surf Lesson",
      objective: "Learn surfing vocabulary, follow safety instructions, and describe your beach experience in Spanish.",

      // Map Location
      mapLocation: {
        id: "la-playa",
        name: "La Playa",
        icon: "🏖️"
      },

      difficulty: "intermediate",
      requiredLevel: "A2",
      estimatedDuration: 20,
      category: "adventure",
      tags: ["beach", "sports", "commands", "safety", "nature"],

      thumbnailImage: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=400&h=300&fit=crop",
      mapImage: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=1887&auto=format&fit=crop",

      focusGrammar: ["imperatives", "commands", "past tense", "present continuous"],
      focusVocabulary: ["surf equipment", "body parts", "directions", "beach vocabulary", "safety"],

      prerequisites: ["cafe-order"],

      stages: {
        "1": {
          id: "1",
          characterName: "Andrés, Surf Instructor",
          characterGender: "male",
          characterAvatar: "🏄",
          location: "La Playa, Puerto Esperanza",

          vignette: {
            en: "The sun is shining and waves are rolling in. Andrés, a bronzed surf instructor, greets you on the beach. Your goal: Meet Andrés and learn the names of surfing equipment.",
            es: "El sol brilla y las olas llegan. Andrés, un instructor de surf bronceado, te saluda en la playa. Tu objetivo: Conoce a Andrés y aprende los nombres del equipo de surf."
          },

          systemPrompt: "You are Andrés, an experienced and enthusiastic surf instructor at La Playa in Puerto Esperanza. You've been surfing for 15 years and love teaching beginners. Introduce yourself and show the equipment: surfboard (tabla de surf), wetsuit (traje de neopreno), wax (cera), leash (correa). Be encouraging and safety-focused.",

          initialMessage: "¡Hola amigo! Bienvenido a tu primera lección de surf. ¿Listo para atrapar algunas olas?",

          objectives: [
            {
              id: "meet_instructor",
              type: "conversation_skill",
              target: "greeting_introduction",
              description: "Greet Andrés and express excitement",
              keywords: ["hola", "mucho gusto", "emocionado", "listo", "sí"],
              required: true,
              hints: [
                "Greet him: '¡Hola Andrés!'",
                "Say you're excited: 'Estoy emocionado/a'",
                "Express readiness: 'Estoy listo/a'"
              ]
            },
            {
              id: "learn_equipment",
              type: "vocabulary_practice",
              target: "surf_vocabulary",
              description: "Learn the names of at least 4 pieces of equipment",
              keywords: ["tabla", "traje", "cera", "correa", "neopreno", "surfboard"],
              required: true,
              hints: [
                "Ask '¿Qué es esto?' (What is this?)",
                "Point to equipment and name it",
                "Repeat after Andrés to practice"
              ]
            }
          ],

          difficultyModifiers: {
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Equipment learned! Time for the safety briefing.",
            xp: 60,
            achievements: ["surf_student"],
            unlockedContent: [],
            items: []
          },

          nextStages: [
            {
              id: "2",
              condition: "default",
              label: "Safety Instructions"
            }
          ]
        },

        "2": {
          id: "2",
          characterName: "Andrés, Surf Instructor",
          characterGender: "male",
          characterAvatar: "🏄",
          location: "La Playa, Puerto Esperanza",

          vignette: {
            en: "Andrés becomes serious as he explains safety rules. Your goal: Understand and confirm you know the safety instructions using imperatives.",
            es: "Andrés se pone serio mientras explica las reglas de seguridad. Tu objetivo: Entender y confirmar que conoces las instrucciones de seguridad usando imperativos."
          },

          systemPrompt: "You are Andrés giving a safety briefing. Use clear imperatives (commands): watch out for rocks (cuidado con las rocas), stay close to shore (quédate cerca de la orilla), raise your hand if you need help (levanta la mano si necesitas ayuda), don't surf alone (no surfees solo). Make sure the student understands and can repeat key safety rules.",

          initialMessage: "Bueno, antes de entrar al agua, vamos a hablar de la seguridad. Es muy importante. ¡Escucha con atención!",

          objectives: [
            {
              id: "understand_commands",
              type: "grammar_practice",
              target: "imperatives",
              description: "Understand and repeat safety commands",
              keywords: ["cuidado", "quédate", "levanta", "mira", "no", "mantén"],
              required: true,
              hints: [
                "Listen for command forms (-a, -e endings)",
                "Repeat after Andrés to show understanding",
                "Ask '¿Qué debo hacer?' (What should I do?)"
              ]
            },
            {
              id: "confirm_safety",
              type: "conversation_skill",
              target: "safety_confirmation",
              description: "Confirm you understand all safety rules",
              keywords: ["entiendo", "comprendo", "claro", "sí", "seguro"],
              required: true,
              hints: [
                "Say 'Entiendo' (I understand)",
                "Confirm: 'Sí, está claro'",
                "Ask questions if anything is unclear"
              ]
            }
          ],

          difficultyModifiers: {
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Safety briefing complete! Time to practice on the board.",
            xp: 70,
            achievements: ["safety_first"],
            unlockedContent: [],
            items: []
          },

          nextStages: [
            {
              id: "3",
              condition: "default",
              label: "Practice Session"
            }
          ]
        },

        "3": {
          id: "3",
          characterName: "Andrés, Surf Instructor",
          characterGender: "male",
          characterAvatar: "🏄",
          location: "La Playa, Puerto Esperanza",

          vignette: {
            en: "You're on the board! Andrés coaches you through movements. Your goal: Follow commands and practice surf positions using body part vocabulary.",
            es: "¡Estás en la tabla! Andrés te guía a través de los movimientos. Tu objetivo: Sigue comandos y practica posiciones de surf usando vocabulario de partes del cuerpo."
          },

          systemPrompt: "You are Andrés coaching during practice. Give clear commands: bend your knees (dobla las rodillas), keep your arms out (mantén los brazos extendidos), look forward (mira adelante), lie on your belly (acuéstate boca abajo), jump up (salta). Encourage the student and correct their form positively.",

          initialMessage: "¡Perfecto! Ahora vamos a practicar en la arena primero. Súbete a la tabla y acuéstate.",

          objectives: [
            {
              id: "follow_commands",
              type: "task_sequence",
              target: "movement_commands",
              description: "Follow Andrés's movement instructions",
              keywords: ["dobla", "rodillas", "brazos", "mira", "salta", "levanta"],
              required: true,
              hints: [
                "Listen carefully to each command",
                "Respond that you're doing it: 'Lo hago'",
                "Ask for clarification if needed"
              ]
            },
            {
              id: "body_parts_practice",
              type: "vocabulary_practice",
              target: "body_vocabulary",
              description: "Learn and use body part vocabulary",
              keywords: ["rodillas", "brazos", "piernas", "pies", "espalda", "manos"],
              required: true,
              hints: [
                "Name body parts when Andrés mentions them",
                "Use in sentences: 'Mis rodillas...'",
                "Ask '¿Cómo se dice...?' for new words"
              ]
            }
          ],

          difficultyModifiers: {
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 5,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Great practice! Now describe your experience.",
            xp: 80,
            achievements: ["surf_moves_learned"],
            unlockedContent: [],
            items: []
          },

          nextStages: [
            {
              id: "4",
              condition: "default",
              label: "Reflect on Experience"
            }
          ]
        },

        "4": {
          id: "4",
          characterName: "Andrés, Surf Instructor",
          characterGender: "male",
          characterAvatar: "🏄",
          location: "La Playa, Puerto Esperanza",

          vignette: {
            en: "Lesson complete! You're back on the beach. Your goal: Describe your experience using past tense and express how you felt.",
            es: "¡Lección completa! Estás de vuelta en la playa. Tu objetivo: Describe tu experiencia usando tiempo pasado y expresa cómo te sentiste."
          },

          systemPrompt: "You are Andrés wrapping up the lesson. Ask the student how they felt, what they learned, and if they want to come back. Encourage them to use past tense (fue divertido, aprendí, me gustó). Be proud of their progress and invite them to future sessions.",

          initialMessage: "¡Excelente trabajo! ¿Cómo estuvo tu primera lección de surf? ¡Cuéntame!",

          objectives: [
            {
              id: "describe_experience",
              type: "grammar_practice",
              target: "past_tense",
              description: "Describe the lesson using past tense",
              keywords: ["fue", "aprendí", "practiqué", "me gustó", "hice"],
              required: true,
              hints: [
                "Use past tense: 'Fue...' (It was...)",
                "Say what you learned: 'Aprendí...'",
                "Describe actions: 'Practiqué...'"
              ]
            },
            {
              id: "express_feelings",
              type: "conversation_skill",
              target: "emotions",
              description: "Express how the experience made you feel",
              keywords: ["divertido", "emocionante", "difícil", "feliz", "nervioso", "genial"],
              required: true,
              hints: [
                "Say how you felt: 'Me sentí...'",
                "Use adjectives: divertido, emocionante",
                "Thank Andrés for the lesson"
              ]
            }
          ],

          difficultyModifiers: {
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Surf lesson complete! Andrés mentioned his friend Don Pedro at the dock gives fishing lessons.",
            xp: 90,
            achievements: ["surfer_dude", "quest_complete_surf_lesson"],
            unlockedContent: ["el-muelle"],
            items: ["surf_lesson_certificate"]
          },

          nextStages: []
        }
      }
    },

    "fishing-don-pedro": {
      id: "fishing-don-pedro",
      title: "Fishing with Don Pedro",
      objective: "Learn maritime vocabulary, practice time expressions, and experience traditional fishing at the Puerto Esperanza dock.",

      // Map Location
      mapLocation: {
        id: "el-muelle",
        name: "El Muelle",
        icon: "⚓"
      },

      difficulty: "intermediate",
      requiredLevel: "A2",
      estimatedDuration: 20,
      category: "adventure",
      tags: ["fishing", "maritime", "nature", "culture", "patience"],

      thumbnailImage: "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=400&h=300&fit=crop",
      mapImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1887&auto=format&fit=crop",

      focusGrammar: ["time expressions", "weather vocabulary", "present perfect", "reflexive verbs"],
      focusVocabulary: ["fish types", "fishing equipment", "weather", "time of day", "patience expressions"],

      prerequisites: ["surf-lesson"],

      stages: {
        "1": {
          id: "1",
          characterName: "Don Pedro",
          characterGender: "male",
          characterAvatar: "👴",
          location: "El Muelle, Puerto Esperanza",

          vignette: {
            en: "It's early morning at the dock. Don Pedro, a weathered fisherman, is preparing his boat. Your goal: Greet him and discuss the best time for fishing.",
            es: "Es temprano en la mañana en el muelle. Don Pedro, un pescador curtido, está preparando su bote. Tu objetivo: Salúdalo y discute el mejor momento para pescar."
          },

          systemPrompt: "You are Don Pedro, a wise 65-year-old fisherman who has worked these waters for 40 years. You wake up at 5 AM every day. Talk about how sunrise (el amanecer) is the best time for fishing. Teach time expressions naturally: por la mañana, al amanecer, temprano. You're patient and philosophical about fishing requiring patience.",

          initialMessage: "¡Buenos días, joven! You're up early. ¿Quieres pescar conmigo?",

          objectives: [
            {
              id: "morning_greeting",
              type: "conversation_skill",
              target: "time_greeting",
              description: "Greet Don Pedro appropriately for morning time",
              keywords: ["buenos días", "temprano", "mañana", "amanecer"],
              required: true,
              hints: [
                "Use morning greeting: 'Buenos días'",
                "Mention the early time: 'Es muy temprano'",
                "Show enthusiasm for fishing"
              ]
            },
            {
              id: "time_discussion",
              type: "grammar_practice",
              target: "time_expressions",
              description: "Discuss and understand time of day expressions",
              keywords: ["hora", "amanecer", "mañana", "tarde", "temprano", "mejor"],
              required: true,
              hints: [
                "Ask what time it is: '¿Qué hora es?'",
                "Ask when is best to fish",
                "Use time expressions Don Pedro teaches"
              ]
            }
          ],

          difficultyModifiers: {
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Good morning conversation! Don Pedro invites you on his boat.",
            xp: 60,
            achievements: ["early_bird"],
            unlockedContent: [],
            items: []
          },

          nextStages: [
            {
              id: "2",
              condition: "default",
              label: "Learn Equipment and Weather"
            }
          ]
        },

        "2": {
          id: "2",
          characterName: "Don Pedro",
          characterGender: "male",
          characterAvatar: "👴",
          location: "El Muelle, Puerto Esperanza",

          vignette: {
            en: "On Don Pedro's boat, he shows you fishing gear and checks the weather. Your goal: Learn fishing equipment vocabulary and discuss weather conditions.",
            es: "En el bote de Don Pedro, te muestra el equipo de pesca y revisa el clima. Tu objetivo: Aprende vocabulario de equipo de pesca y discute las condiciones climáticas."
          },

          systemPrompt: "You are Don Pedro showing fishing equipment: fishing rod (caña de pescar), hook (anzuelo), bait (carnada), net (red), bucket (cubeta). Then discuss weather: it's sunny (hace sol), the sea is calm (el mar está tranquilo), perfect conditions (condiciones perfectas). Teach weather expressions naturally.",

          initialMessage: "Mira, aquí está el equipo que vamos a usar. Primero, la caña de pescar.",

          objectives: [
            {
              id: "fishing_equipment",
              type: "vocabulary_practice",
              target: "fishing_vocab",
              description: "Learn at least 4 pieces of fishing equipment",
              keywords: ["caña", "anzuelo", "carnada", "red", "cubeta", "pescar"],
              required: true,
              hints: [
                "Point and ask: '¿Qué es esto?'",
                "Repeat equipment names",
                "Ask what each item is used for"
              ]
            },
            {
              id: "weather_discussion",
              type: "vocabulary_practice",
              target: "weather_vocab",
              description: "Discuss weather conditions for fishing",
              keywords: ["sol", "nublado", "viento", "mar", "tranquilo", "clima"],
              required: true,
              hints: [
                "Ask about the weather: '¿Cómo está el clima?'",
                "Describe what you see: 'Hace sol'",
                "Ask if conditions are good"
              ]
            }
          ],

          difficultyModifiers: {
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "medium" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Equipment learned! Time to cast your line and wait.",
            xp: 70,
            achievements: ["fisherman_apprentice"],
            unlockedContent: [],
            items: []
          },

          nextStages: [
            {
              id: "3",
              condition: "default",
              label: "The Waiting Game"
            }
          ]
        },

        "3": {
          id: "3",
          characterName: "Don Pedro",
          characterGender: "male",
          characterAvatar: "👴",
          location: "El Muelle, Puerto Esperanza",

          vignette: {
            en: "Lines cast, you wait for a bite. Don Pedro shares fishing wisdom. Your goal: Practice patience vocabulary and learn about waiting expressions in Spanish.",
            es: "Líneas lanzadas, esperas una picada. Don Pedro comparte sabiduría pesquera. Tu objetivo: Practica vocabulario de paciencia y aprende sobre expresiones de espera en español."
          },

          systemPrompt: "You are Don Pedro being philosophical about patience. Talk about how fishing teaches patience (paciencia). Use expressions: tener paciencia (to have patience), esperar (to wait), hay que esperar (one must wait), tranquilo (calm), poco a poco (little by little). Share stories about the sea and fishing. Be a wise mentor.",

          initialMessage: "Now we wait. Fishing is about paciencia, my friend. Tell me, ¿tienes paciencia?",

          objectives: [
            {
              id: "patience_vocabulary",
              type: "vocabulary_practice",
              target: "patience_expressions",
              description: "Learn and use patience-related vocabulary",
              keywords: ["paciencia", "esperar", "tranquilo", "poco a poco", "tiempo"],
              required: true,
              hints: [
                "Say you have patience: 'Tengo paciencia'",
                "Ask how long to wait",
                "Use 'tranquilo' to show calmness"
              ]
            },
            {
              id: "philosophical_chat",
              type: "conversation_skill",
              target: "deep_conversation",
              description: "Engage in Don Pedro's stories and wisdom",
              keywords: ["vida", "mar", "pesca", "aprender", "importante"],
              required: true,
              hints: [
                "Ask about his fishing stories",
                "Share what fishing teaches you",
                "Respond to his philosophical points"
              ]
            }
          ],

          difficultyModifiers: {
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 5,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Suddenly - a bite! Time to catch the fish!",
            xp: 80,
            achievements: ["patient_angler"],
            unlockedContent: [],
            items: []
          },

          nextStages: [
            {
              id: "4",
              condition: "default",
              label: "The Catch!"
            }
          ]
        },

        "4": {
          id: "4",
          characterName: "Don Pedro",
          characterGender: "male",
          characterAvatar: "👴",
          location: "El Muelle, Puerto Esperanza",

          vignette: {
            en: "You've caught a fish! Don Pedro helps identify it. Your goal: Learn fish names and celebrate your success using present perfect tense.",
            es: "¡Has pescado un pez! Don Pedro ayuda a identificarlo. Tu objetivo: Aprende nombres de peces y celebra tu éxito usando tiempo presente perfecto."
          },

          systemPrompt: "You are Don Pedro excited about the catch! Identify the fish - it's a sea bass (robalo). Teach fish names: tuna (atún), snapper (pargo), sardine (sardina). Congratulate using present perfect: 'Has pescado' (you have caught), '¡Lo has logrado!' (you've done it!). Celebrate the success and invite them to cook it.",

          initialMessage: "¡Mira! ¡Has pescado un robalo! A beautiful sea bass! ¡Qué emoción!",

          objectives: [
            {
              id: "fish_vocabulary",
              type: "vocabulary_practice",
              target: "fish_types",
              description: "Learn names of at least 3 fish types",
              keywords: ["robalo", "atún", "pargo", "sardina", "pez", "pescado"],
              required: true,
              hints: [
                "Ask about different fish: '¿Qué pescado es?'",
                "Repeat fish names",
                "Ask which fish are common here"
              ]
            },
            {
              id: "celebrate_success",
              type: "grammar_practice",
              target: "present_perfect",
              description: "Use present perfect to talk about the catch",
              keywords: ["he pescado", "has", "hemos", "logrado", "conseguido"],
              required: true,
              hints: [
                "Say 'He pescado' (I have caught)",
                "Celebrate: '¡Lo he logrado!'",
                "Express excitement about the catch"
              ]
            }
          ],

          difficultyModifiers: {
            "A2": { aiPatience: "high", vocabularyLevel: "basic", responseLength: "medium" },
            "B1": { aiPatience: "medium", vocabularyLevel: "intermediate", responseLength: "long" }
          },

          stageType: "conversation",

          completionCriteria: {
            minMessages: 4,
            objectivesRequired: 2,
            timeLimit: null
          },

          reward: {
            clue: "Fishing complete! Don Pedro suggests cooking your catch or visiting the music school.",
            xp: 90,
            achievements: ["master_angler", "quest_complete_fishing"],
            unlockedContent: ["escuela-musica"],
            items: ["fresh_robalo", "fishing_wisdom"]
          },

          nextStages: []
        }
      }
    }
  }
};

// Quest categories for filtering
const QUEST_CATEGORIES = {
  mystery: { name: "Mystery", icon: "🔍", color: "purple" },
  adventure: { name: "Adventure", icon: "🗺️", color: "blue" },
  culture: { name: "Culture", icon: "🎭", color: "pink" },
  "daily-life": { name: "Daily Life", icon: "🏠", color: "green" }
};

// Difficulty levels
const DIFFICULTY_LEVELS = {
  beginner: { name: "Beginner", icon: "⭐", requiredLevel: ["A1", "A2"] },
  intermediate: { name: "Intermediate", icon: "⭐⭐", requiredLevel: ["B1", "B2"] },
  advanced: { name: "Advanced", icon: "⭐⭐⭐", requiredLevel: ["C1", "C2"] }
};

const MAX_IMAGE_RETRIES = 20;

// Initialize quest images when QUEST_IMAGES is loaded
function initializeQuestImages(retryCount = 0) {
  if (window.QUEST_IMAGES) {
    const quests = QUEST_DATABASE.quests || {};
    Object.values(quests).forEach(quest => {
      Object.values(quest.stages || {}).forEach(stage => {
        const generatorName = stage.stageImageGenerator;
        if (
          generatorName &&
          typeof window.QUEST_IMAGES[generatorName] === 'function' &&
          !stage.stageImage
        ) {
          stage.stageImage = window.QUEST_IMAGES[generatorName]();
        }
      });
    });

    window.questImagesReady = true;
    if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('quest-images-ready'));
    }
    console.log('✅ Quest images initialized');
  } else if (retryCount < MAX_IMAGE_RETRIES) {
    if (retryCount === 0) {
      console.warn('⚠️ QUEST_IMAGES not loaded yet - retrying in 100ms');
    }
    setTimeout(() => initializeQuestImages(retryCount + 1), 100);
  } else {
    console.error('❌ QUEST_IMAGES failed to load after retries');
  }
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.QUEST_DATABASE = QUEST_DATABASE;
  window.QUEST_CATEGORIES = QUEST_CATEGORIES;
  window.DIFFICULTY_LEVELS = DIFFICULTY_LEVELS;
  window.questImagesReady = false;
  window.initializeQuestImages = initializeQuestImages;

  // Initialize images when this script loads
  // Will retry if QUEST_IMAGES isn't loaded yet
  initializeQuestImages();
}
