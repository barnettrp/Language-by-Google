// api/openai-tts.js

// This is a Vercel Serverless Function for OpenAI Text-to-Speech API
// OpenAI TTS offers very natural-sounding voices at an affordable price ($15 per 1M characters)

// Character voice mapping for OpenAI TTS
// Available voices: alloy, echo, fable, onyx, nova, shimmer
// All voices support Spanish with excellent pronunciation
const CHARACTER_VOICES = {
  // Male voices
  'male_young': { voice: 'echo', speed: 1.0 }, // Echo - bright, youthful male
  'male_mature': { voice: 'onyx', speed: 0.95 }, // Onyx - deep, authoritative male
  'male_elder': { voice: 'onyx', speed: 0.85 }, // Onyx - slower for elder characters
  'male_energetic': { voice: 'fable', speed: 1.05 }, // Fable - energetic British male

  // Female voices
  'female_young': { voice: 'nova', speed: 1.0 }, // Nova - bright, youthful female
  'female_mature': { voice: 'shimmer', speed: 0.95 }, // Shimmer - warm, mature female
  'female_elder': { voice: 'shimmer', speed: 0.85 }, // Shimmer - slower for elder characters
  'female_energetic': { voice: 'alloy', speed: 1.05 }, // Alloy - energetic, versatile
};

// Select appropriate voice based on character
function selectVoiceForCharacter(characterName, characterGender) {
  const name = characterName?.toLowerCase() || '';

  // Elderly/Respected characters (deeper, slower voices)
  if (name.includes('don pedro') || name.includes('don ernesto')) {
    return CHARACTER_VOICES.male_elder;
  }
  if (name.includes('señor rivera')) {
    return CHARACTER_VOICES.male_elder; // Radio host with authoritative voice
  }

  // Young energetic male characters
  if (name.includes('andrés')) {
    return CHARACTER_VOICES.male_energetic; // Surf instructor - energetic!
  }
  if (name.includes('javier')) {
    return CHARACTER_VOICES.male_young; // Rival musician - young competitor
  }
  if (name.includes('carlos') && name.includes('musician')) {
    return CHARACTER_VOICES.male_young; // Young musician
  }

  // Mature professional male characters
  if (name.includes('mateo') && name.includes('concierge')) {
    return CHARACTER_VOICES.male_mature; // Professional concierge
  }
  if (name.includes('roberto') && name.includes('chef')) {
    return CHARACTER_VOICES.male_mature; // Experienced chef
  }
  if (name.includes('miguel')) {
    return CHARACTER_VOICES.male_mature; // Regular customer
  }

  // Young energetic female characters
  if (name.includes('carolina') && name.includes('festival')) {
    return CHARACTER_VOICES.female_energetic; // Energetic festival planner
  }
  if (name.includes('sofia') && name.includes('barista')) {
    return CHARACTER_VOICES.female_young; // Young barista
  }
  if (name.includes('elena') && name.includes('vendor')) {
    return CHARACTER_VOICES.female_young; // Young market vendor
  }

  // Mature professional female characters
  if (name.includes('maría') && name.includes('vendor')) {
    return CHARACTER_VOICES.female_mature; // Experienced market vendor
  }
  if (name.includes('lucía') && name.includes('security')) {
    return CHARACTER_VOICES.female_mature; // Head of security - authoritative
  }

  // Default based on gender
  if (characterGender === 'male') {
    return CHARACTER_VOICES.male_mature;
  } else if (characterGender === 'female') {
    return CHARACTER_VOICES.female_mature;
  }

  // Fallback
  return CHARACTER_VOICES.male_mature;
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

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    console.error('OPENAI_API_KEY environment variable is not set');
    return response.status(500).json({
      error: 'OpenAI API key not configured',
      provider: 'openai'
    });
  }

  const { text, characterName, characterGender, speedMultiplier = 1.0 } = request.body;

  if (!text) {
    return response.status(400).json({
      error: 'Missing required field: text'
    });
  }

  // Select voice based on character
  let voiceConfig = selectVoiceForCharacter(characterName, characterGender);

  // Apply user customizations to the base voice settings
  const finalSpeed = (voiceConfig.speed || 1.0) * speedMultiplier;

  console.log(`[OpenAI TTS] Generating speech for "${characterName}" using voice: ${voiceConfig.voice} (speed: ${finalSpeed.toFixed(2)})`);

  // Use OpenAI Text-to-Speech API
  const url = 'https://api.openai.com/v1/audio/speech';

  try {
    const ttsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1-hd', // High-quality model for best naturalness
        voice: voiceConfig.voice,
        input: text,
        speed: Math.max(0.25, Math.min(4.0, finalSpeed)), // Clamp between 0.25x and 4.0x
        response_format: 'mp3'
      }),
    });

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json().catch(() => ({}));
      console.error('[OpenAI TTS] API Error:', errorData);
      return response.status(ttsResponse.status).json({
        error: errorData.error?.message || 'OpenAI TTS generation failed',
        provider: 'openai'
      });
    }

    // OpenAI returns raw MP3 audio data (not JSON)
    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return response.status(200).json({
      audioContent: audioBase64,
      voiceName: voiceConfig.voice,
      provider: 'openai'
    });

  } catch (error) {
    console.error('[OpenAI TTS] Error handling request:', error);
    return response.status(500).json({
      error: 'Internal Server Error: Failed to generate speech',
      provider: 'openai'
    });
  }
}
