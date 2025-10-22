// api/tts.js

// This is a Vercel Serverless Function for Google Cloud Text-to-Speech API

// Character voice mapping for Google Cloud TTS
// Available voices: https://cloud.google.com/text-to-speech/docs/voices
const CHARACTER_VOICES = {
  // Male voices - different ages and styles
  'male_young': { name: 'es-US-Neural2-B', gender: 'MALE', pitch: 2.0, rate: 1.0 }, // Young male - higher pitch
  'male_mature': { name: 'es-US-Neural2-C', gender: 'MALE', pitch: 0.0, rate: 0.95 }, // Mature male - neutral
  'male_elder': { name: 'es-US-Standard-B', gender: 'MALE', pitch: -2.0, rate: 0.9 }, // Older male - deeper, slower
  'male_energetic': { name: 'es-US-Wavenet-B', gender: 'MALE', pitch: 1.0, rate: 1.05 }, // Energetic male

  // Female voices - different ages and styles
  'female_young': { name: 'es-US-Neural2-A', gender: 'FEMALE', pitch: 2.0, rate: 1.0 }, // Young female - higher pitch
  'female_mature': { name: 'es-US-Standard-A', gender: 'FEMALE', pitch: 0.0, rate: 0.95 }, // Mature female - neutral
  'female_elder': { name: 'es-US-Wavenet-A', gender: 'FEMALE', pitch: -1.0, rate: 0.9 }, // Older female - lower, slower
  'female_energetic': { name: 'es-US-Wavenet-C', gender: 'FEMALE', pitch: 1.5, rate: 1.05 }, // Energetic female
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

  const ttsApiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY || process.env.GEMINI_API_KEY;
  if (!ttsApiKey) {
    console.error('GOOGLE_CLOUD_TTS_API_KEY or GEMINI_API_KEY environment variable is not set');
    return response.status(500).json({
      error: 'Google Cloud TTS API key not configured'
    });
  }

  const { text, characterName, characterGender, speedMultiplier = 1.0, pitchAdjustment = 0 } = request.body;

  if (!text) {
    return response.status(400).json({
      error: 'Missing required field: text'
    });
  }

  // Select voice based on character
  let voiceConfig = selectVoiceForCharacter(characterName, characterGender);

  // Apply user customizations to the base voice settings
  const finalRate = (voiceConfig.rate || 0.95) * speedMultiplier;
  const finalPitch = (voiceConfig.pitch || 0.0) + pitchAdjustment;

  console.log(`[TTS] Generating speech for "${characterName}" using voice: ${voiceConfig.name} (pitch: ${finalPitch.toFixed(1)}, rate: ${finalRate.toFixed(2)})`);

  // Use Google Cloud Text-to-Speech API
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsApiKey}`;

  try {
    const ttsResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: text },
        voice: {
          languageCode: 'es-US',
          name: voiceConfig.name,
          ssmlGender: voiceConfig.gender
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: Math.max(0.25, Math.min(4.0, finalRate)), // Clamp between 0.25x and 4.0x
          pitch: Math.max(-20.0, Math.min(20.0, finalPitch)) // Clamp between -20 and +20
        }
      }),
    });

    const data = await ttsResponse.json();

    if (ttsResponse.ok && data.audioContent) {
      return response.status(200).json({
        audioContent: data.audioContent,
        voiceName: voiceConfig.name
      });
    } else {
      console.error('[TTS] API Error:', data);
      return response.status(ttsResponse.status).json({
        error: data.error || 'TTS generation failed'
      });
    }

  } catch (error) {
    console.error('[TTS] Error handling request:', error);
    return response.status(500).json({
      error: 'Internal Server Error: Failed to generate speech'
    });
  }
}
