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
      objective: "Piece together clues across Bogotá to recover Carlos's missing guitar before his headline performance.",

      // Metadata
      difficulty: "beginner",
      requiredLevel: "A1",
      estimatedDuration: 25, // minutes
      category: "mystery",
      tags: ["music", "investigation", "colombia", "urban"],

      // Media
      thumbnailImage: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=300&fit=crop",
      mapImage: "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?q=80&w=1887&auto=format&fit=crop",

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
          characterAvatar: "👨‍💼",
          location: "Hotel Lobby, Bogotá",

          vignette: {
            en: "You're in a hotel lobby. The concierge looks worried. Your goal: Find out who the musician is and where he was last seen.",
            es: "Estás en el vestíbulo de un hotel. El conserje parece preocupado. Tu objetivo: Descubrir quién es el músico y dónde fue visto por última vez."
          },

          systemPrompt: "You are Mateo, a professional but worried hotel concierge in Bogotá. A famous musician named Carlos has lost his guitar and he's staying at your hotel. You're very concerned about the hotel's reputation. Speak naturally and show your worry. Answer questions about Carlos and mention that he was last seen at the plaza.",

          initialMessage: "Good morning. How can I help you today?",

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
          characterAvatar: "👩‍🦱",
          location: "Plaza de Bolívar, Bogotá",

          vignette: {
            en: "You arrive at the bustling plaza filled with vendors and street performers. A friendly vendor catches your eye. Your goal: Ask her if she saw Carlos and learn about the rival musician.",
            es: "Llegas a la plaza bulliciosa llena de vendedores y artistas callejeros. Una vendedora amigable llama tu atención. Tu objetivo: Pregúntale si vio a Carlos y aprende sobre el músico rival."
          },

          systemPrompt: "You are Elena, a chatty and knowledgeable street vendor in Plaza de Bolívar. You sell handmade crafts and know everyone in the area. You saw Carlos yesterday with another musician named Javier - they seemed to be arguing. You're friendly and love to talk, but customers need to ask you specific questions. Speak naturally with some local expressions.",

          initialMessage: "¡Hola! ¿Buscas algo bonito? I have beautiful handmade crafts!",

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
          characterAvatar: "👨‍🍳",
          location: "Hotel Restaurant",

          vignette: {
            en: "You head to the hotel restaurant. The chef is preparing for lunch service. Your goal: Find out if Carlos ate here recently and what he talked about.",
            es: "Te diriges al restaurante del hotel. El chef está preparando el servicio de almuerzo. Tu objetivo: Averiguar si Carlos comió aquí recientemente y de qué habló."
          },

          systemPrompt: "You are Roberto, a passionate chef at the hotel restaurant. You remember Carlos came for breakfast yesterday morning and seemed nervous. He mentioned having a big performance tonight and something about a rival musician. You're busy but willing to help if asked nicely. Speak with pride about your food.",

          initialMessage: "Bienvenido! Welcome to our restaurant. Are you here for lunch?",

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

      difficulty: "beginner",
      requiredLevel: "A1",
      estimatedDuration: 25,
      category: "daily-life",
      tags: ["food", "market", "shopping", "culture", "mexico"],

      thumbnailImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
      mapImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1887&auto=format&fit=crop",

      focusGrammar: ["numbers", "colors", "adjectives", "imperatives", "future tense"],
      focusVocabulary: ["fruits", "vegetables", "colors", "prices", "negotiations", "community events"],

      prerequisites: [],

      stages: {
        "1": {
          id: "1",
          characterName: "María, the Vendor",
          characterAvatar: "👩‍🌾",
          location: "Mercado Central, Mexico City",

          vignette: {
            en: "You meet María at the central market. She needs help organizing her fruit stand. Your goal: Learn the names of fruits and help her count inventory.",
            es: "Conoces a María en el mercado central. Necesita ayuda organizando su puesto de frutas. Tu objetivo: Aprende los nombres de las frutas y ayúdala a contar el inventario."
          },

          // Image to display at start of stage
          stageImage: null, // Will be initialized after QUEST_IMAGES loads
          stageImageGenerator: "marketDay_stage1_fruitStand",

          systemPrompt: "You are María, a kind fruit vendor at the market in Mexico City. You need help counting and organizing fruits for the big market day tomorrow. You teach the player fruit names and numbers in Spanish naturally through conversation. Be patient and encouraging. At your stand you have: 8 red apples (manzanas rojas), 12 oranges (naranjas), 6 bananas (plátanos), 15 strawberries (fresas), and 3 watermelons (sandías). When they need to count specific fruits, refer to the image showing your fruit stand above with the exact inventory.",

          initialMessage: "¡Buenos días! I need help preparing for tomorrow's big market. Can you help me? Look at my fruit stand above - I need to count everything!",

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
          characterAvatar: "👩‍🌾",
          location: "Mercado Central, Mexico City",

          vignette: {
            en: "Now María needs help organizing fruits by color for a beautiful display. Your goal: Learn color names and describe the fruits.",
            es: "Ahora María necesita ayuda organizando las frutas por color para una exhibición hermosa. Tu objetivo: Aprende los nombres de los colores y describe las frutas."
          },

          // Image to display at start of stage
          stageImage: null, // Will be initialized after QUEST_IMAGES loads
          stageImageGenerator: "marketDay_stage2_colorfulFruits",

          systemPrompt: "You are María. Now you're teaching the player about colors while organizing a colorful fruit display. Be enthusiastic about making the stand look beautiful. Use colors and adjectives naturally. Point out specific fruits in the colorful display above: red section (rojo) has apples and strawberries, yellow section (amarillo) has bananas and lemons, orange section (naranja) has oranges, green section (verde) has watermelon, purple section (morado) has grapes, and pink section (rosa) has peaches.",

          initialMessage: "Perfect! Now let's make the stand beautiful with colors. Look at the colorful display above! Which fruits are red?",

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
