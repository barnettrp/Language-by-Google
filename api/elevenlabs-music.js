// api/elevenlabs-music.js
// ElevenLabs Sound Generation API for background music

// Quest background music themes
const MUSIC_THEMES = {
  // Beginner quests - light and friendly
  'find-the-cat': 'light playful spanish guitar melody, friendly cheerful atmosphere, gentle acoustic background music',
  'order-coffee': 'cozy cafe ambience, soft acoustic guitar, warm and inviting atmosphere',
  'market-shopping': 'vibrant mexican market atmosphere, light mariachi style, energetic but friendly',

  // Intermediate quests - more dynamic
  'hotel-mystery': 'mysterious spanish suspense music, subtle tension, investigative atmosphere',
  'beach-adventure': 'tropical beach atmosphere, rhythmic latin music, adventurous and energetic',
  'festival-planning': 'festive spanish celebration music, lively and colorful, party atmosphere',

  // Advanced quests - dramatic and immersive
  'business-negotiation': 'professional sophisticated spanish music, confident and smooth atmosphere',
  'museum-heist': 'dramatic suspenseful spanish music, tense mysterious atmosphere, adventure theme',

  // Default themes by difficulty
  'beginner': 'gentle spanish acoustic guitar, warm friendly atmosphere, light and encouraging',
  'intermediate': 'rhythmic spanish music, engaging dynamic atmosphere, moderately energetic',
  'advanced': 'sophisticated spanish instrumental, professional confident atmosphere, dramatic undertones',

  // Default fallback
  'default': 'ambient spanish background music, neutral pleasant atmosphere, gentle instrumental'
};

// Select appropriate music prompt based on quest
function selectMusicPrompt(questId, difficulty) {
  // First try exact quest match
  if (MUSIC_THEMES[questId]) {
    return MUSIC_THEMES[questId];
  }

  // Fall back to difficulty-based theme
  if (difficulty && MUSIC_THEMES[difficulty]) {
    return MUSIC_THEMES[difficulty];
  }

  // Ultimate fallback
  return MUSIC_THEMES.default;
}

export default async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY environment variable is not set');
    return response.status(500).json({
      error: 'ElevenLabs API key not configured'
    });
  }

  const { questId, difficulty, customPrompt } = request.body;

  if (!questId && !customPrompt) {
    return response.status(400).json({
      error: 'Missing required field: questId or customPrompt'
    });
  }

  // Select music prompt
  const musicPrompt = customPrompt || selectMusicPrompt(questId, difficulty);

  console.log(`[ElevenLabs Music] Generating music for quest "${questId}" with prompt: "${musicPrompt}"`);

  // Use ElevenLabs Sound Generation API
  const url = 'https://api.elevenlabs.io/v1/sound-generation';

  try {
    const musicResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: musicPrompt,
        duration_seconds: 30, // Generate 30 seconds of music (will be looped)
        prompt_influence: 0.5 // Balance between prompt and model creativity
      }),
    });

    if (!musicResponse.ok) {
      const errorData = await musicResponse.json();
      console.error('[ElevenLabs Music] API Error:', errorData);
      return response.status(musicResponse.status).json({
        error: errorData.detail || 'Music generation failed'
      });
    }

    // Get audio as array buffer
    const audioBuffer = await musicResponse.arrayBuffer();

    // Convert to base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return response.status(200).json({
      audioContent: base64Audio,
      prompt: musicPrompt,
      provider: 'elevenlabs'
    });

  } catch (error) {
    console.error('[ElevenLabs Music] Error handling request:', error);
    return response.status(500).json({
      error: 'Internal Server Error: Failed to generate music'
    });
  }
}
