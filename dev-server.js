// Simple development server that proxies API calls and serves static files
import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i++;
    } else {
      args[key] = true;
    }
  }
  return args;
}

const cliArgs = parseArgs(process.argv.slice(2));
const HOST = cliArgs.host || process.env.HOST || '127.0.0.1';
const PORT = Number(cliArgs.port || process.env.PORT || 5173);
const HMR_PORT = Number(cliArgs['hmr-port'] || process.env.VITE_HMR_PORT || 24679);

const app = express();
app.use(express.json());

// API proxy endpoint
app.post('/api/gemini', async (req, res) => {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }

  const { systemInstruction, contents } = req.body;

  if (!contents) {
    return res.status(400).json({ error: 'Missing "contents" in request body.' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`;

  try {
    // Build request body following official Gemini API format
    const requestBody = { contents };

    if (systemInstruction) {
      requestBody.system_instruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Gemini API Error:', errorBody);
      return res.status(response.status).json({
        error: `Gemini API error: ${errorBody.error?.message || 'Unknown error'}`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error proxying to Gemini:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create Vite server in middleware mode
const vite = await createViteServer({
  server: {
    middlewareMode: true,
    host: HOST,
    hmr: {
      host: HOST,
      port: HMR_PORT
    }
  },
  appType: 'spa'
});

// Use vite's connect instance as middleware
app.use(vite.middlewares);

app.listen(PORT, HOST, () => {
  console.log(`\n  Dev server with API proxy running at http://${HOST}:${PORT}/ (HMR port ${HMR_PORT})\n`);
});
