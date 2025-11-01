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
  console.log('[Claude API] API key present:', !!anthropicApiKey);
  console.log('[Claude API] API key starts with:', anthropicApiKey?.substring(0, 10));

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

    // Use Claude Sonnet 4.5 (latest model as of 2025)
    const modelToUse = 'claude-sonnet-4-5-20250929';
    console.log('[Claude API] Sending request with', messages.length, 'messages');
    console.log('[Claude API] Model:', modelToUse);

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
      console.error('[Claude API] Full error response:', JSON.stringify(data, null, 2));
      console.error('[Claude API] HTTP Status:', claudeResponse.status);
      console.error('[Claude API] Status Text:', claudeResponse.statusText);
      console.error('[Claude API] Error type:', data.error?.type);
      console.error('[Claude API] Error message:', data.error?.message);

      // Return detailed error to help debug
      return response.status(claudeResponse.status).json({
        error: data.error?.message || data.error?.type || 'Claude API request failed',
        details: {
          status: claudeResponse.status,
          type: data.error?.type,
          fullError: data
        }
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
