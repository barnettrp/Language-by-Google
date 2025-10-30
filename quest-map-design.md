# Puerto Esperanza - Quest Map Design

## Overview
Puerto Esperanza is a vibrant Mexican seaside village that serves as the central hub for all language learning quests. Users progress through the village by completing quests at different locations, with a visual map showing their journey.

## Implementation Status (as of 2025-10-29 by Gemini)

**Status:** Phase 1 (Foundation) and parts of the progression system are now implemented.

- **✅ Quest Locking:** The prerequisite system described below is functional. Quests are locked/unlocked based on `user.completedQuests`.
- **✅ UI Feedback:** The map and quest list visually distinguish between locked, available, and completed quests.
- **✅ Onboarding Flow:** A new "Quest Zero" has been implemented to onboard users before they access the main map.
- **❌ Visuals:** The map is functional but uses the existing UI. The full visual design with illustrated maps, breadcrumb trails, and custom icons is not yet implemented.


## Village Map Layout

```
                    [El Faro]
                        |
    [La Galería]---[La Plaza]---[El Parque]
         |            |              |
    [Escuela]---[El Mercado]---[La Café]
       Música        |
         |        [Hotel]---[El Muelle]
         |           |           |
    [La Playa]------+------[La Playa]
```

## Location Details

### 1. La Plaza Central (Town Square)
- **Type:** Central hub, community gathering
- **CEFR Level:** A1-B1
- **Quest Ideas:**
  - Festival preparation (existing Market Day starts here)
  - Community announcements
  - Meeting locals
- **Learning Focus:** Greetings, introductions, directions

### 2. El Mercado (The Market)
- **Type:** Shopping, food, negotiations
- **CEFR Level:** A1-B1
- **Current Quest:** "Market Day" (already implemented)
- **Additional Quest Ideas:**
  - Grocery shopping challenge
  - Recipe ingredients hunt
  - Price negotiation practice
- **Learning Focus:** Numbers, food vocabulary, colors, bargaining

### 3. El Hotel Colonial
- **Type:** Accommodation, hospitality
- **CEFR Level:** A1-B2
- **Current Quest:** "The Missing Guitar" (relocated from Bogotá)
- **Additional Quest Ideas:**
  - Check-in/check-out procedures
  - Room service requests
  - Lost and found
- **Learning Focus:** Polite requests, descriptions, past tense

### 4. La Playa (The Beach)
- **Type:** Recreation, water activities
- **CEFR Level:** A1-C1
- **New Quest Ideas:**
  - "Surf Lesson Adventure" - Learn equipment vocabulary, safety instructions
  - "Beach Volleyball Tournament" - Sports vocabulary, team coordination
  - "Sandcastle Competition" - Descriptive language, giving instructions
- **Learning Focus:** Commands, directions, sports vocabulary, weather

### 5. La Café del Puerto (Seaside Café)
- **Type:** Food service, casual conversation
- **CEFR Level:** A1-B2
- **New Quest Ideas:**
  - "Perfect Coffee Order" - Navigate menu, dietary preferences
  - "Chef's Special" - Understand recommendations, express preferences
  - "Meet the Locals" - Casual conversation with regulars
- **Learning Focus:** Food vocabulary, preferences, opinions, small talk

### 6. El Muelle (The Dock)
- **Type:** Fishing, maritime activities
- **CEFR Level:** A2-B2
- **New Quest Ideas:**
  - "Fishing with Don Pedro" - Learn fishing vocabulary, telling time
  - "Boat Tour Guide" - Directions, landmarks, storytelling
  - "Fresh Catch Market" - Seafood vocabulary, negotiations
- **Learning Focus:** Nature vocabulary, maritime terms, time expressions

### 7. La Escuela de Música (Music School)
- **Type:** Arts, education
- **CEFR Level:** B1-C1
- **New Quest Ideas:**
  - "Guitar Lessons" - Follow-up to Missing Guitar quest
  - "Concert Preparation" - Coordination, schedules
  - "Teach a Song" - Explanations, instructions
- **Learning Focus:** Music vocabulary, expressions of emotion, teaching language

### 8. El Parque (The Park)
- **Type:** Nature, recreation
- **CEFR Level:** A1-B1
- **New Quest Ideas:**
  - "Dog Park Conversations" - Pet vocabulary, casual chat
  - "Picnic Planning" - Making plans, invitations
  - "Bird Watching" - Nature vocabulary, descriptions
- **Learning Focus:** Present continuous, nature vocabulary, casual conversation

### 9. La Galería de Arte (Art Gallery)
- **Type:** Culture, arts
- **CEFR Level:** B1-C2
- **New Quest Ideas:**
  - "Curator for a Day" - Art descriptions, opinions
  - "Exhibition Opening" - Formal conversation, cultural discussion
  - "Artist Interview" - Question formation, comprehension
- **Learning Focus:** Descriptive language, opinions, formal register, culture

### 10. El Faro (The Lighthouse)
- **Type:** Challenge location, history
- **CEFR Level:** B2-C2
- **New Quest Ideas:**
  - "Lighthouse Keeper's Tale" - Complex narrative, past tenses
  - "Storm Warning" - Technical vocabulary, warnings
  - "Historical Archive" - Reading comprehension, storytelling
- **Learning Focus:** Complex grammar, technical vocabulary, narrative past

## Map Navigation System

### Visual Design
- **Illustrated Map:** Watercolor-style map of Puerto Esperanza
- **Location Icons:** Distinctive icons for each location
- **Breadcrumb Trails:** Dotted lines showing paths between locations
- **Progress Indicators:**
  - 🔒 Locked (prerequisites not met)
  - ⭐ Available (ready to start)
  - ⏳ In Progress (currently active)
  - ✅ Completed (finished)
  - 🏆 Mastered (100% completion with all objectives)

### Unlock Progression
```
Start → La Plaza Central (unlocked by default)
  ↓
La Plaza → El Mercado OR El Hotel (player choice)
  ↓
El Mercado → La Café del Puerto
  ↓
El Hotel → La Escuela de Música
  ↓
Beach unlocks after completing 2 quests
  ↓
El Muelle unlocks after Beach
  ↓
El Parque unlocks after 3 quests
  ↓
La Galería unlocks after 4 quests
  ↓
El Faro unlocks after 6 quests + B2 level
```

## Technical Implementation

### Data Structure Updates

Each quest needs:
```javascript
{
  mapLocation: {
    id: "el-mercado",
    name: "El Mercado",
    coordinates: { x: 50, y: 40 }, // % position on map
    icon: "🛒",
    description: "The bustling central market"
  },
  prerequisites: {
    quests: ["plaza-introduction"], // Required quest IDs
    level: "A1", // Minimum CEFR level
    locations: ["la-plaza"] // Required location unlocks
  },
  connections: ["la-cafe", "hotel-colonial"] // Adjacent locations
}
```

### UI Components Needed

1. **QuestMapView**
   - Full-screen map display
   - Clickable location pins
   - Breadcrumb trail animation
   - Location info popovers

2. **LocationCard**
   - Location name and icon
   - Available quests count
   - Lock/unlock status
   - Preview image

3. **BreadcrumbTrail**
   - SVG path between locations
   - Animated progression
   - Color-coded by completion status

### Map Assets
- Base map illustration (can use AI generation or find free asset)
- Location pin graphics (can use emoji or custom SVG)
- Trail animation sprites

## Quest Adaptation Plan

### Relocating "The Missing Guitar"
- **From:** Bogotá, Colombia
- **To:** El Hotel Colonial, Puerto Esperanza
- **Changes Needed:**
  - Update location references in stage vignettes
  - Change "Plaza de Bolívar" to "Plaza Central"
  - Update character descriptions to fit coastal setting
  - Keep storyline intact (works perfectly as-is)

### Enhancing "Market Day"
- **Current Location:** El Mercado (already fits!)
- **Changes Needed:**
  - Update to reference Puerto Esperanza instead of Mexico City
  - Add map image showing location in village
  - Link to adjacent locations (La Café, La Plaza)

## Immediate Priority: 3 New Quests

### Quest 1: "La Café Order" (A1 Beginner)
**Location:** La Café del Puerto
**Duration:** 15 minutes
**Stages:**
1. Study the menu with the barista
2. Place your order with special requests
3. Handle payment and small change
4. Pick up order and find seating
5. Make small talk with friendly customer

**Learning Focus:** Food/drink vocabulary, numbers, preferences (me gusta, quisiera)

### Quest 2: "Surf Lesson" (A2-B1)
**Location:** La Playa
**Duration:** 20 minutes
**Stages:**
1. Meet surf instructor Andrés
2. Learn equipment vocabulary (tabla, traje, cera)
3. Understand safety instructions (imperatives)
4. Practice commands during lesson
5. Describe the experience using past tense

**Learning Focus:** Commands, sports vocabulary, body parts, safety expressions

### Quest 3: "Fishing with Don Pedro" (A2-B1)
**Location:** El Muelle
**Duration:** 20 minutes
**Stages:**
1. Early morning meet-up with Don Pedro
2. Learn about fishing equipment
3. Discuss weather and conditions
4. Practice patience while fishing (time expressions)
5. Celebrate the catch and learn fish names

**Learning Focus:** Nature vocabulary, time expressions, weather, patience/waiting expressions

## Implementation Phases

### Phase 1: Map Foundation (Week 1)
- Create map data structure
- Design/acquire map visual asset
- Build QuestMapView component
- Implement location unlock logic

### Phase 2: Quest Relocation (Week 1)
- Update "Missing Guitar" location references
- Update "Market Day" location references
- Add map coordinates to existing quests
- Test quest flow with new locations

### Phase 3: New Quest Development (Week 2)
- Implement "La Café Order" quest
- Implement "Surf Lesson" quest
- Implement "Fishing with Don Pedro" quest
- Create stage images for new quests

### Phase 4: Polish & Testing (Week 2)
- Add breadcrumb trail animations
- Implement location unlock celebrations
- Test full progression path
- Balance difficulty and progression

## Success Metrics
- Users complete at least 3 different locations
- Average session time increases by 30%
- User feedback indicates enjoyment of map navigation
- Clear sense of progression and exploration
