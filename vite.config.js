import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load env file from parent directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: './public',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    },
    server: {
      port: 5173,
      // Configure Vite dev server to handle API requests
      proxy: {
        '/api': {
          target: 'http://localhost:5173',
          changeOrigin: true,
          configure: (proxy, options) => {
            // Handle API requests with a custom middleware
            proxy.on('proxyReq', async (proxyReq, req, res) => {
              // Cancel the proxy request
              proxyReq.destroy();

              // Only handle POST requests to /api/gemini
              if (req.url === '/api/gemini' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });

                req.on('end', async () => {
                  try {
                    const { systemInstruction, contents } = JSON.parse(body);

                    const geminiApiKey = env.GEMINI_API_KEY;
                    if (!geminiApiKey) {
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({
                        error: 'Gemini API key not configured. Please set GEMINI_API_KEY in .env'
                      }));
                      return;
                    }

                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;

                    const geminiResponse = await fetch(url, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ contents, systemInstruction }),
                    });

                    const data = await geminiResponse.json();

                    res.writeHead(geminiResponse.ok ? 200 : geminiResponse.status, {
                      'Content-Type': 'application/json',
                      'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify(data));

                  } catch (error) {
                    console.error('Error handling API request:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                      error: 'Internal Server Error: Failed to communicate with Gemini API'
                    }));
                  }
                });
              } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not Found' }));
              }
            });
          }
        }
      }
    },
    envDir: '../'
  };
});
