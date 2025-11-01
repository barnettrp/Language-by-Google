// api/claude.js
// Vercel Serverless Function for Anthropic Claude API

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

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    console.error('ANTHROPIC_API_KEY environment variable is not set');
    return response.status(500).json({
      error: 'Anthropic API key not configured. Please set ANTHROPIC_API_KEY in environment variables'
    });
  }

  const { systemInstruction, contents } = request.body;

  if (!systemInstruction || !contents) {
    return response.status(400).json({
      error: 'Missing required fields: systemInstruction, contents'
    });
  }

  try {
    // Convert Gemini-style contents to Claude messages format
    const messages = contents.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.parts[0].text
    }));

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemInstruction,
        messages: messages
      })
    });

    const data = await claudeResponse.json();

    if (!claudeResponse.ok) {
      console.error('Claude API Error:', data);
      return response.status(claudeResponse.status).json({
        error: data.error?.message || 'Claude API request failed'
      });
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

    return response.status(200).json(formattedResponse);

  } catch (error) {
    console.error('Error handling Claude request:', error);
    return response.status(500).json({
      error: 'Internal Server Error: Failed to process Claude request',
      details: error.message
    });
  }
}
