// api/elevenlabs-tts.js
// ElevenLabs Text-to-Speech API for character voices

// Character voice mapping for ElevenLabs
// Using multilingual voices that support Spanish
const CHARACTER_VOICES = {
  // Male voices
  'male_young': 'Xb7hH8MSUJpSbSDYk0k2', // Adam - young male
  'male_mature': 'VR6AewLTigWG4xSOukaG', // Arnold - mature male
  'male_elder': 'pNInz6obpgDQGcFmaJgB', // Adam - can be adjusted for elder
  'male_energetic': 'TxGEqnHWrfWFTfGW9XjX', // Josh - energetic

  // Female voices
  'female_young': 'jsCqWAovK2LkecY7zXl4', // Freya - young female
  'female_mature': 'MF3mGyEYCl7XYWbV9V6O', // Elli - mature female
  'female_elder': 'XB0fDUnXU5powFXDhCwa', // Charlotte - can be adjusted for elder
  'female_energetic': 'jBpfuIE2acCO8z3wKNLl', // Gigi - energetic
};

// Select appropriate voice based on character
function selectVoiceForCharacter(characterName, characterGender) {
  const name = characterName?.toLowerCase() || '';

  // Elderly/Respected characters
  if (name.includes('don pedro') || name.includes('don ernesto')) {
    return CHARACTER_VOICES.male_elder;
  }
  if (name.includes('señor rivera')) {
    return CHARACTER_VOICES.male_elder;
  }

  // Young energetic male characters
  if (name.includes('andrés')) {
    return CHARACTER_VOICES.male_energetic;
  }
  if (name.includes('javier')) {
    return CHARACTER_VOICES.male_young;
  }
  if (name.includes('carlos') && name.includes('musician')) {
    return CHARACTER_VOICES.male_young;
  }

  // Mature professional male characters
  if (name.includes('mateo') && name.includes('concierge')) {
    return CHARACTER_VOICES.male_mature;
  }
  if (name.includes('roberto') && name.includes('chef')) {
    return CHARACTER_VOICES.male_mature;
  }
  if (name.includes('miguel')) {
    return CHARACTER_VOICES.male_mature;
  }

  // Young energetic female characters
  if (name.includes('carolina') && name.includes('festival')) {
    return CHARACTER_VOICES.female_energetic;
  }
  if (name.includes('sofia') && name.includes('barista')) {
    return CHARACTER_VOICES.female_young;
  }
  if (name.includes('elena') && name.includes('vendor')) {
    return CHARACTER_VOICES.female_young;
  }

  // Mature professional female characters
  if (name.includes('maría') && name.includes('vendor')) {
    return CHARACTER_VOICES.female_mature;
  }
  if (name.includes('lucía') && name.includes('security')) {
    return CHARACTER_VOICES.female_mature;
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

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('ELEVENLABS_API_KEY environment variable is not set');
    return response.status(500).json({
      error: 'ElevenLabs API key not configured'
    });
  }

  const { text, characterName, characterGender, speedMultiplier = 1.0 } = request.body;

  if (!text) {
    return response.status(400).json({
      error: 'Missing required field: text'
    });
  }

  // Select voice based on character
  const voiceId = selectVoiceForCharacter(characterName, characterGender);

  console.log(`[ElevenLabs TTS] Generating speech for "${characterName}" using voice: ${voiceId} (speed: ${speedMultiplier}x)`);

  // Use ElevenLabs Text-to-Speech API
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  try {
    const ttsResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2', // Supports Spanish
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true
        }
      }),
    });

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.json();
      console.error('[ElevenLabs TTS] API Error:', errorData);
      return response.status(ttsResponse.status).json({
        error: errorData.detail || 'TTS generation failed'
      });
    }

    // Get audio as array buffer
    const audioBuffer = await ttsResponse.arrayBuffer();

    // Convert to base64
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    return response.status(200).json({
      audioContent: base64Audio,
      voiceId: voiceId,
      provider: 'elevenlabs'
    });

  } catch (error) {
    console.error('[ElevenLabs TTS] Error handling request:', error);
    return response.status(500).json({
      error: 'Internal Server Error: Failed to generate speech'
    });
  }
}
