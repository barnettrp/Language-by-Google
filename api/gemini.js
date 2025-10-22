// api/gemini.js

// This is a Vercel Serverless Function that acts as a secure backend proxy.
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

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY environment variable is not set');
    return response.status(500).json({ 
      error: 'Gemini API key not configured on the server. Please set the GEMINI_API_KEY environment variable.' 
    });
  }

  const { systemInstruction, contents } = request.body;

  if (!contents) {
    return response.status(400).json({ error: 'Missing "contents" in request body.' });
  }

  // Use gemini-2.0-flash with v1beta API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  // Prepend system instruction as the first user message
  let finalContents = contents;
  if (systemInstruction) {
    finalContents = [
      { role: 'user', parts: [{ text: systemInstruction }] },
      { role: 'model', parts: [{ text: 'Understood. I will follow these instructions.' }] },
      ...contents
    ];
  }

  const requestBody = { contents: finalContents };

  try {
    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.json();
      console.error('Gemini API Error:', errorBody);
      return response.status(geminiResponse.status).json({ 
        error: `Gemini API error: ${errorBody.error?.message || 'Unknown error'}` 
      });
    }

    const data = await geminiResponse.json();
    
    // Forward the successful response from Gemini back to the client
    return response.status(200).json(data);

  } catch (error) {
    console.error('Error proxying to Gemini:', error);
    return response.status(500).json({ 
      error: 'Internal Server Error: Failed to communicate with Gemini API' 
    });
  }
}
