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

const PORT = process.env.PORT || 5173;
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

// Handle API requests
async function handleApiRequest(req, res) {
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

      // Use Google Generative AI SDK with gemini-pro (older but accessible model)
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Prepend system instruction as the first user message if provided
      let chat;
      if (systemInstruction) {
        const history = [
          { role: 'user', parts: [{ text: systemInstruction }] },
          { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] }
        ];
        chat = model.startChat({ history });
      } else {
        chat = model.startChat({});
      }

      // Send the actual user message
      const userMessage = contents[contents.length - 1].parts[0].text;
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;

      // Format response to match expected structure
      const data = {
        candidates: [{
          content: {
            parts: [{ text: response.text() }],
            role: 'model'
          }
        }]
      };

      res.writeHead(200, {
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
  console.log(`  🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔥 Firebase API Key: ${process.env.VITE_FIREBASE_API_KEY ? '✓ Loaded' : '✗ Missing'}`);
  console.log(`  🔥 Firebase Project: ${process.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}\n`);
});
