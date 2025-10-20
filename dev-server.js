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
  'male_young': { name: 'es-US-Neural2-B', gender: 'MALE' }, // Young male
  'male_mature': { name: 'es-US-Neural2-C', gender: 'MALE' }, // Mature male
  'male_elder': { name: 'es-US-Standard-B', gender: 'MALE' }, // Older male (deeper voice)

  // Female voices - different ages and styles
  'female_young': { name: 'es-US-Neural2-A', gender: 'FEMALE' }, // Young female
  'female_mature': { name: 'es-US-Standard-A', gender: 'FEMALE' }, // Mature female
  'female_elder': { name: 'es-US-Wavenet-A', gender: 'FEMALE' }, // Older female
};

// Select appropriate voice based on character
function selectVoiceForCharacter(characterName, characterGender) {
  const name = characterName?.toLowerCase() || '';

  // Elderly characters
  if (name.includes('don pedro') || name.includes('don ernesto') || name.includes('señor rivera')) {
    return CHARACTER_VOICES.male_elder;
  }

  // Young characters
  if (name.includes('andrés') || name.includes('javier') || (name.includes('carlos') && name.includes('musician'))) {
    return CHARACTER_VOICES.male_young;
  }

  if (name.includes('sofia') || name.includes('elena') || name.includes('carolina')) {
    return CHARACTER_VOICES.female_young;
  }

  // Mature characters
  if (name.includes('mateo') || name.includes('roberto') || name.includes('miguel')) {
    return CHARACTER_VOICES.male_mature;
  }

  if (name.includes('maría') || name.includes('lucía')) {
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

// Handle text-to-speech requests
async function handleTTSRequest(req, res) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { text, characterName, characterGender } = JSON.parse(body);

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

      console.log(`[TTS] Generating speech for "${characterName}" using voice: ${voiceConfig.name}`);

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
            speakingRate: 0.95,
            pitch: 0.0
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
  console.log(`  🤖 API endpoint available at: http://localhost:${PORT}/api/gemini`);
  console.log(`  🌐 Translation endpoint available at: http://localhost:${PORT}/api/translate`);
  console.log(`  🔊 Text-to-Speech endpoint available at: http://localhost:${PORT}/api/tts`);
  console.log(`  🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔑 Google Translate API Key: ${process.env.GOOGLE_TRANSLATE_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔥 Firebase API Key: ${process.env.VITE_FIREBASE_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔥 Firebase Project: ${process.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}\n`);
});
