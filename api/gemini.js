// api/gemini.js

// This is a Vercel Serverless Function that acts as a secure backend proxy.
export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    return response.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }

  const { systemInstruction, contents } = request.body;

  if (!contents) {
    return response.status(400).json({ error: 'Missing "contents" in request body.' });
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

    const geminiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey
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
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
