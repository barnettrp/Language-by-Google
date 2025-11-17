// dev-server.js - Simple development server that handles both static files and API
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

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

// Handle text-to-speech requests
async function handleTTSRequest(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { text, characterName, characterGender, speedMultiplier = 1.0, pitchAdjustment = 0 } = JSON.parse(body);

      const ttsApiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY || process.env.GEMINI_API_KEY;
      if (!ttsApiKey) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: 'Google Cloud TTS API key not configured'
        }));
        return;
      }

      // Select voice based on character
      let voiceConfig = selectVoiceForCharacter(characterName, characterGender);

      // Apply user customizations to the base voice settings
      const finalRate = (voiceConfig.rate || 0.95) * speedMultiplier;
      const finalPitch = (voiceConfig.pitch || 0.0) + pitchAdjustment;

      console.log(`[TTS] Generating speech for "${characterName}" using voice: ${voiceConfig.name} (pitch: ${finalPitch.toFixed(1)}, rate: ${finalRate.toFixed(2)})`);

      // Use Google Cloud Text-to-Speech API
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${ttsApiKey}`;

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
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          audioContent: data.audioContent,
          voiceName: voiceConfig.name
        }));
      } else {
        console.error('[TTS] API Error:', data);
        res.writeHead(ttsResponse.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: data.error || 'TTS generation failed'
        }));
      }

    } catch (error) {
      console.error('[TTS] Error handling request:', error);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error: Failed to generate speech'
      }));
    }
  });
}

// Handle OpenAI TTS requests
async function handleOpenAITTSRequest(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { text, characterName, characterGender, speedMultiplier = 1.0, preferredVoice = 'auto' } = JSON.parse(body);

      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: 'OpenAI API key not configured',
          provider: 'openai'
        }));
        return;
      }

      let selectedVoice;
      let baseSpeed = 1.0;

      // If user has selected a specific voice, use that
      if (preferredVoice && preferredVoice !== 'auto') {
        selectedVoice = preferredVoice;
        baseSpeed = 1.0; // Use default speed for user-selected voices
      } else {
        // Auto-select voice based on character (original logic)
        const OPENAI_VOICES = {
          'male_young': { voice: 'echo', speed: 1.0 },
          'male_mature': { voice: 'onyx', speed: 0.95 },
          'male_elder': { voice: 'onyx', speed: 0.85 },
          'male_energetic': { voice: 'fable', speed: 1.05 },
          'female_young': { voice: 'nova', speed: 1.0 },
          'female_mature': { voice: 'shimmer', speed: 0.95 },
          'female_elder': { voice: 'shimmer', speed: 0.85 },
          'female_energetic': { voice: 'alloy', speed: 1.05 },
        };

        // Select voice based on character
        const name = characterName?.toLowerCase() || '';
        let voiceConfig;

        if (name.includes('don pedro') || name.includes('don ernesto') || name.includes('señor rivera')) {
          voiceConfig = OPENAI_VOICES.male_elder;
        } else if (name.includes('andrés')) {
          voiceConfig = OPENAI_VOICES.male_energetic;
        } else if (name.includes('javier') || (name.includes('carlos') && name.includes('musician'))) {
          voiceConfig = OPENAI_VOICES.male_young;
        } else if (name.includes('mateo') || name.includes('roberto') || name.includes('miguel')) {
          voiceConfig = OPENAI_VOICES.male_mature;
        } else if (name.includes('carolina') && name.includes('festival')) {
          voiceConfig = OPENAI_VOICES.female_energetic;
        } else if (name.includes('sofia') || name.includes('elena')) {
          voiceConfig = OPENAI_VOICES.female_young;
        } else if (name.includes('maría') || name.includes('lucía')) {
          voiceConfig = OPENAI_VOICES.female_mature;
        } else if (characterGender === 'male') {
          voiceConfig = OPENAI_VOICES.male_mature;
        } else if (characterGender === 'female') {
          voiceConfig = OPENAI_VOICES.female_mature;
        } else {
          voiceConfig = OPENAI_VOICES.male_mature;
        }

        selectedVoice = voiceConfig.voice;
        baseSpeed = voiceConfig.speed || 1.0;
      }

      const finalSpeed = baseSpeed * speedMultiplier;

      console.log(`[OpenAI TTS] Generating speech for "${characterName}" using voice: ${selectedVoice} (speed: ${finalSpeed.toFixed(2)}, preferred: ${preferredVoice})`);

      // Use OpenAI Text-to-Speech API
      const url = 'https://api.openai.com/v1/audio/speech';

      const ttsResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1-hd',
          voice: selectedVoice,
          input: text,
          speed: Math.max(0.25, Math.min(4.0, finalSpeed)),
          response_format: 'mp3'
        }),
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.json().catch(() => ({}));
        console.error('[OpenAI TTS] API Error:', errorData);
        res.writeHead(ttsResponse.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: errorData.error?.message || 'OpenAI TTS generation failed',
          provider: 'openai'
        }));
        return;
      }

      // OpenAI returns raw MP3 audio data (not JSON)
      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        audioContent: audioBase64,
        voiceName: selectedVoice,
        provider: 'openai'
      }));

    } catch (error) {
      console.error('[OpenAI TTS] Error handling request:', error);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error: Failed to generate speech',
        provider: 'openai'
      }));
    }
  });
}

// Handle Cartesia TTS requests
async function handleCartesiaTTSRequest(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { text, characterName, characterGender, speedMultiplier = 1.0, preferredVoice = 'auto', emotions = [] } = JSON.parse(body);

      const cartesiaApiKey = process.env.CARTESIA_API_KEY;
      if (!cartesiaApiKey) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: 'Cartesia API key not configured',
          provider: 'cartesia'
        }));
        return;
      }

      let selectedVoice;
      let baseSpeed = 1.0;

      // Cartesia voice IDs - Real Spanish voices from Cartesia API
      const CARTESIA_VOICES = {
        // Male voices - different ages and styles
        'spanish_narrator': '34dbb662-8e98-413c-a1ef-1a3407675fe7', // Deep and resonant, perfect for narratives
        'male_default': '34dbb662-8e98-413c-a1ef-1a3407675fe7', // Spanish Narrator Man
        'male_young': '34dbb662-8e98-413c-a1ef-1a3407675fe7', // Young male (adjust speed higher)
        'male_mature': '34dbb662-8e98-413c-a1ef-1a3407675fe7', // Mature male
        'male_elder': '34dbb662-8e98-413c-a1ef-1a3407675fe7', // Elder male (adjust speed lower)

        // Female voices - different ages and styles
        'marta': '5c29d7e3-a133-4c7e-804a-1d9c6dea83f6', // Smooth, casual South American
        'teresa': '0afd8614-31cb-438c-8a46-80650e19c29c', // Casual, great for conversations
        'peninsular_narrator': 'a956b555-5c82-404f-9580-243b5178978d', // Calm, Peninsular dialect
        'female_default': '5c29d7e3-a133-4c7e-804a-1d9c6dea83f6', // Marta (casual and natural)
        'female_young': '0afd8614-31cb-438c-8a46-80650e19c29c', // Teresa (young, energetic)
        'female_mature': '5c29d7e3-a133-4c7e-804a-1d9c6dea83f6', // Marta (mature)
        'female_elder': 'a956b555-5c82-404f-9580-243b5178978d', // Peninsular (calm, elder)
      };

      // Character voice mapping - select voice based on character
      function selectVoiceForCharacter(characterName, characterGender) {
        const name = characterName?.toLowerCase() || '';

        // Elderly/Respected characters (deeper, slower voices)
        if (name.includes('don pedro') || name.includes('don ernesto')) {
          return { voice: CARTESIA_VOICES.male_elder, speed: 0.75 };
        }
        if (name.includes('señor rivera')) {
          return { voice: CARTESIA_VOICES.male_elder, speed: 0.8 };
        }
        if (name.includes('santiago')) {
          return { voice: CARTESIA_VOICES.male_mature, speed: 0.85 };
        }

        // Young energetic male characters
        if (name.includes('andrés')) {
          return { voice: CARTESIA_VOICES.male_young, speed: 0.95 };
        }
        if (name.includes('javier')) {
          return { voice: CARTESIA_VOICES.male_young, speed: 0.9 };
        }
        if (name.includes('carlos') && name.includes('musician')) {
          return { voice: CARTESIA_VOICES.male_young, speed: 0.9 };
        }

        // Mature professional male characters
        if (name.includes('mateo') && name.includes('concierge')) {
          return { voice: CARTESIA_VOICES.male_mature, speed: 0.85 };
        }
        if (name.includes('roberto') && name.includes('chef')) {
          return { voice: CARTESIA_VOICES.male_mature, speed: 0.85 };
        }
        if (name.includes('miguel')) {
          return { voice: CARTESIA_VOICES.male_mature, speed: 0.85 };
        }

        // Young energetic female characters
        if (name.includes('carolina') && name.includes('festival')) {
          return { voice: CARTESIA_VOICES.female_young, speed: 0.95 };
        }
        if (name.includes('sofia') && name.includes('barista')) {
          return { voice: CARTESIA_VOICES.female_young, speed: 0.9 };
        }
        if (name.includes('elena') && name.includes('vendor')) {
          return { voice: CARTESIA_VOICES.female_young, speed: 0.9 };
        }

        // Mature professional female characters
        if (name.includes('maría') && name.includes('vendor')) {
          return { voice: CARTESIA_VOICES.female_mature, speed: 0.85 };
        }
        if (name.includes('lucía') && name.includes('security')) {
          return { voice: CARTESIA_VOICES.female_mature, speed: 0.85 };
        }

        // Default based on gender
        if (characterGender === 'female') {
          return { voice: CARTESIA_VOICES.female_default, speed: 0.85 };
        } else {
          return { voice: CARTESIA_VOICES.male_default, speed: 0.85 };
        }
      }

      // If user has selected a specific voice, use that
      if (preferredVoice && preferredVoice !== 'auto') {
        selectedVoice = CARTESIA_VOICES[preferredVoice] || CARTESIA_VOICES.male_default;
        baseSpeed = 0.85;  // Slightly slower for more natural speech
      } else {
        // Auto-select voice based on character name and gender
        const voiceConfig = selectVoiceForCharacter(characterName, characterGender);
        selectedVoice = voiceConfig.voice;
        baseSpeed = voiceConfig.speed;
      }

      const finalSpeed = baseSpeed * speedMultiplier;

      // Detect primary language by counting structural/grammatical words
      // This helps with code-switching (Spanglish) by identifying the base language
      // Count English grammatical words (articles, pronouns, auxiliary verbs, prepositions)
      const englishIndicators = (text.match(/\b(the|a|an|is|are|was|were|am|be|been|have|has|had|do|does|did|can|could|will|would|should|shall|may|might|must|i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|its|our|their|this|that|these|those|in|on|at|to|for|of|with|from|by|about|as|into|through|during|before|after|above|below|between|under|over)\b/gi) || []).length;

      // Count Spanish grammatical words (articles, pronouns, auxiliary verbs, prepositions)
      const spanishIndicators = (text.match(/\b(el|la|los|las|un|una|unos|unas|de|del|al|es|son|está|están|fue|fueron|era|eran|ser|estar|he|has|ha|hemos|han|hacer|hago|hace|hacen|yo|tú|él|ella|usted|nosotros|vosotros|ellos|ellas|ustedes|me|te|le|nos|os|les|mi|mis|tu|tus|su|sus|nuestro|vuestra|este|esta|estos|estas|ese|esa|esos|esas|en|con|por|para|sin|sobre|bajo|entre|desde|hasta|durante|contra)\b/gi) || []).length;

      // Use English if there are more English grammatical indicators
      // Spanish voice will use English pronunciation for text, with slight accent
      // Spanish words in English text will be pronounced with English phonetics (understandable for learners)
      const language = englishIndicators > spanishIndicators ? 'en' : 'es';

      console.log(`[Cartesia TTS] Text analysis: ${englishIndicators} English indicators vs ${spanishIndicators} Spanish indicators → Language: ${language}`);
      console.log(`[Cartesia TTS] Generating speech for "${characterName}" using voice: ${preferredVoice || 'auto'} (speed: ${finalSpeed.toFixed(2)}) with emotions: [${emotions.join(', ')}]`);

      // Use Cartesia Sonic 3 API
      const url = 'https://api.cartesia.ai/tts/bytes';

      // Build voice object with emotion controls if provided
      const voiceConfig = {
        mode: 'id',
        id: selectedVoice
      };

      // Add experimental emotion controls if emotions are provided
      if (emotions && emotions.length > 0) {
        voiceConfig.__experimental_controls = {
          emotion: emotions
        };
      }

      const ttsResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'X-API-Key': cartesiaApiKey,
          'Cartesia-Version': '2024-06-10',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_id: 'sonic-3',
          transcript: text,
          voice: voiceConfig,
          language: language,
          output_format: {
            container: 'mp3',
            encoding: 'mp3',
            sample_rate: 44100
          },
          duration: null,
          speed: finalSpeed
        }),
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.json().catch(() => ({}));
        console.error('[Cartesia TTS] API Error:', errorData);
        res.writeHead(ttsResponse.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: errorData.error?.message || 'Cartesia TTS generation failed',
          provider: 'cartesia'
        }));
        return;
      }

      // Cartesia returns raw audio data
      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');

      console.log(`[Cartesia TTS] ✓ Successfully generated ${audioBase64.length} bytes of audio`);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        audioContent: audioBase64,
        voiceName: preferredVoice || 'auto',
        provider: 'cartesia'
      }));

    } catch (error) {
      console.error('[Cartesia TTS] Error handling request:', error);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error: Failed to generate speech',
        provider: 'cartesia'
      }));
    }
  });
}

// Handle ElevenLabs TTS requests
async function handleElevenLabsTTSRequest(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { text, characterName, characterGender, speedMultiplier = 1.0 } = JSON.parse(body);

      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsApiKey) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: 'ElevenLabs API key not configured',
          provider: 'elevenlabs'
        }));
        return;
      }

      // Character voice mapping for ElevenLabs
      const CHARACTER_VOICES = {
        'male_young': 'Xb7hH8MSUJpSbSDYk0k2',
        'male_mature': 'VR6AewLTigWG4xSOukaG',
        'male_elder': 'pNInz6obpgDQGcFmaJgB',
        'male_energetic': 'TxGEqnHWrfWFTfGW9XjX',
        'female_young': 'jsCqWAovK2LkecY7zXl4',
        'female_mature': 'MF3mGyEYCl7XYWbV9V6O',
        'female_elder': 'XB0fDUnXU5powFXDhCwa',
        'female_energetic': 'jBpfuIE2acCO8z3wKNLl'
      };

      // Simple voice selection based on gender
      const voiceId = characterGender === 'female'
        ? CHARACTER_VOICES.female_mature
        : CHARACTER_VOICES.male_mature;

      console.log(`[ElevenLabs TTS] Generating speech for "${characterName}" using voice: ${voiceId}`);

      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      const ttsResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.json();
        console.error('[ElevenLabs TTS] API Error:', errorData);
        res.writeHead(ttsResponse.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: errorData.detail || 'TTS generation failed',
          provider: 'elevenlabs'
        }));
        return;
      }

      const audioBuffer = await ttsResponse.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        audioContent: base64Audio,
        voiceId: voiceId,
        provider: 'elevenlabs'
      }));

    } catch (error) {
      console.error('[ElevenLabs TTS] Error handling request:', error);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error: Failed to generate speech',
        provider: 'elevenlabs'
      }));
    }
  });
}

// Handle ElevenLabs Music requests
async function handleElevenLabsMusicRequest(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { questId, difficulty, customPrompt } = JSON.parse(body);

      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsApiKey) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: 'ElevenLabs API key not configured',
          provider: 'elevenlabs'
        }));
        return;
      }

      // Music themes
      const MUSIC_THEMES = {
        'find-the-cat': 'light playful spanish guitar melody, friendly cheerful atmosphere, gentle acoustic background music',
        'order-coffee': 'cozy cafe ambience, soft acoustic guitar, warm and inviting atmosphere',
        'market-shopping': 'vibrant mexican market atmosphere, light mariachi style, energetic but friendly',
        'beginner': 'gentle spanish acoustic guitar, warm friendly atmosphere, light and encouraging',
        'intermediate': 'rhythmic spanish music, engaging dynamic atmosphere, moderately energetic',
        'advanced': 'sophisticated spanish instrumental, professional confident atmosphere, dramatic undertones',
        'default': 'ambient spanish background music, neutral pleasant atmosphere, gentle instrumental'
      };

      const musicPrompt = customPrompt || MUSIC_THEMES[questId] || MUSIC_THEMES[difficulty] || MUSIC_THEMES.default;

      console.log(`[ElevenLabs Music] Generating music for quest "${questId}" with prompt: "${musicPrompt}"`);

      const url = 'https://api.elevenlabs.io/v1/sound-generation';
      const musicResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsApiKey
        },
        body: JSON.stringify({
          text: musicPrompt,
          duration_seconds: 30,
          prompt_influence: 0.5
        })
      });

      if (!musicResponse.ok) {
        const errorData = await musicResponse.json();
        console.error('[ElevenLabs Music] API Error:', errorData);
        res.writeHead(musicResponse.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: errorData.detail || 'Music generation failed',
          provider: 'elevenlabs'
        }));
        return;
      }

      const audioBuffer = await musicResponse.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        audioContent: base64Audio,
        prompt: musicPrompt,
        provider: 'elevenlabs'
      }));

    } catch (error) {
      console.error('[ElevenLabs Music] Error handling request:', error);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error: Failed to generate music',
        provider: 'elevenlabs'
      }));
    }
  });
}

// Handle translation requests
async function handleTranslateRequest(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { text, sourceLang, targetLang } = JSON.parse(body);

      const translateApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
      if (!translateApiKey) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: 'Google Translate API key not configured. Please set GOOGLE_TRANSLATE_API_KEY in .env'
        }));
        return;
      }

      // Use Google Cloud Translation API
      const url = `https://translation.googleapis.com/language/translate/v2?key=${translateApiKey}`;

      const translateResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
          format: 'text'
        }),
      });

      const data = await translateResponse.json();

      if (translateResponse.ok && data.data && data.data.translations && data.data.translations[0]) {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          translatedText: data.data.translations[0].translatedText
        }));
      } else {
        res.writeHead(translateResponse.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: data.error || 'Translation failed'
        }));
      }

    } catch (error) {
      console.error('Error handling translation request:', error);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error: Failed to translate text'
      }));
    }
  });
}

// Handle Claude API requests
async function handleClaudeRequest(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { systemInstruction, contents } = JSON.parse(body);

      const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicApiKey) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: 'Anthropic API key not configured. Please set ANTHROPIC_API_KEY in .env'
        }));
        return;
      }

      // Convert Gemini-style contents to Claude messages format
      const messages = contents.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : msg.role,
        content: msg.parts[0].text
      }));

      // Use Claude Sonnet 4.5 (latest model)
      const modelToUse = 'claude-sonnet-4-5-20250929';
      console.log('[Claude API] Sending request with', messages.length, 'messages');

      // Call Claude API
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelToUse,
          max_tokens: 1024,
          system: systemInstruction,
          messages: messages
        })
      });

      const data = await claudeResponse.json();

      if (!claudeResponse.ok) {
        console.error('[Claude API] Error:', data);
        res.writeHead(claudeResponse.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: data.error?.message || 'Claude API request failed'
        }));
        return;
      }

      // Convert Claude response to Gemini-style format for compatibility
      const formattedResponse = {
        candidates: [{
          content: {
            parts: [{
              text: data.content[0].text
            }],
            role: 'model'
          }
        }]
      };

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(formattedResponse));

    } catch (error) {
      console.error('[Claude API] Error handling request:', error);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error: Failed to communicate with Claude API'
      }));
    }
  });
}

// Handle API requests
async function handleApiRequest(req, res) {
  // Handle translation API
  if (req.url === '/api/translate' && req.method === 'POST') {
    return handleTranslateRequest(req, res);
  }

  // Handle TTS API
  if (req.url === '/api/tts' && req.method === 'POST') {
    return handleTTSRequest(req, res);
  }

  // Handle OpenAI TTS API
  if (req.url === '/api/openai-tts' && req.method === 'POST') {
    return handleOpenAITTSRequest(req, res);
  }

  // Handle Cartesia TTS API
  if (req.url === '/api/cartesia-tts' && req.method === 'POST') {
    return handleCartesiaTTSRequest(req, res);
  }

  // Handle ElevenLabs TTS API
  if (req.url === '/api/elevenlabs-tts' && req.method === 'POST') {
    return handleElevenLabsTTSRequest(req, res);
  }

  // Handle ElevenLabs Music API
  if (req.url === '/api/elevenlabs-music' && req.method === 'POST') {
    return handleElevenLabsMusicRequest(req, res);
  }

  // Handle Claude API
  if (req.url === '/api/claude' && req.method === 'POST') {
    return handleClaudeRequest(req, res);
  }

  // Handle Gemini API
  if (req.url !== '/api/gemini' || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
    return;
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { systemInstruction, contents } = JSON.parse(body);

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
          error: 'Gemini API key not configured. Please set GEMINI_API_KEY in .env'
        }));
        return;
      }

      // Use gemini-2.0-flash with v1beta API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

      // Prepend system instruction as the first user message with model acknowledgment
      let finalContents = contents;
      if (systemInstruction) {
        finalContents = [
          { role: 'user', parts: [{ text: systemInstruction }] },
          { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] },
          ...contents
        ];
      }

      const requestBody = { contents: finalContents };

      const geminiResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await geminiResponse.json();

      res.writeHead(geminiResponse.ok ? 200 : geminiResponse.status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(data));

    } catch (error) {
      console.error('Error handling API request:', error);
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal Server Error: Failed to communicate with Gemini API'
      }));
    }
  });
}

// Handle static file requests
function handleStaticFile(req, res) {
  let filePath = join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

  // Check if file exists
  if (!existsSync(filePath)) {
    // For SPA routing, serve index.html for non-file requests
    if (!extname(filePath)) {
      filePath = join(PUBLIC_DIR, 'index.html');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
  }

  // Check if it's a directory
  if (statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  const ext = extname(filePath);
  const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    let content = readFileSync(filePath);

    // Inject environment variables for JavaScript modules
    if (ext === '.js' || ext === '.html') {
      let contentStr = content.toString();

      // Replace import.meta.env.VITE_* with actual environment values
      if (ext === '.js') {
        // For .js files, replace import.meta.env references
        const envVars = {
          VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || '',
          VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
          VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || '',
          VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
          VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
          VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || '',
        };

        for (const [key, value] of Object.entries(envVars)) {
          const regex = new RegExp(`import\\.meta\\.env\\.${key}`, 'g');
          contentStr = contentStr.replace(regex, `"${value}"`);
        }
      }

      content = Buffer.from(contentStr);
    }

    // Add cache-busting headers for development
    const headers = {
      'Content-Type': mimeType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    res.writeHead(200, headers);
    res.end(content);
  } catch (error) {
    console.error('Error reading file:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
}

// Main server
const server = createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // Route to appropriate handler
  if (req.url.startsWith('/api/')) {
    handleApiRequest(req, res);
  } else {
    handleStaticFile(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`\n  ✨ Development server running at:`);
  console.log(`  \x1b[36m➜  Local:   http://localhost:${PORT}/\x1b[0m\n`);
  console.log(`  📦 Serving static files from: ${PUBLIC_DIR}`);
  console.log(`  🤖 Gemini API endpoint: http://localhost:${PORT}/api/gemini`);
  console.log(`  🤖 Claude API endpoint: http://localhost:${PORT}/api/claude`);
  console.log(`  🌐 Translation endpoint: http://localhost:${PORT}/api/translate`);
  console.log(`  🔊 Text-to-Speech endpoint: http://localhost:${PORT}/api/tts`);
  console.log(`  🔊 OpenAI TTS endpoint: http://localhost:${PORT}/api/openai-tts`);
  console.log(`  🔊 Cartesia TTS endpoint: http://localhost:${PORT}/api/cartesia-tts`);
  console.log(`  🔊 ElevenLabs TTS endpoint: http://localhost:${PORT}/api/elevenlabs-tts`);
  console.log(`  🎵 ElevenLabs Music endpoint: http://localhost:${PORT}/api/elevenlabs-music`);
  console.log(`  🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔑 Claude API Key: ${process.env.ANTHROPIC_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔑 Cartesia API Key: ${process.env.CARTESIA_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔑 ElevenLabs API Key: ${process.env.ELEVENLABS_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔑 Google Translate API Key: ${process.env.GOOGLE_TRANSLATE_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔥 Firebase API Key: ${process.env.VITE_FIREBASE_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔥 Firebase Project: ${process.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}\n`);
});
