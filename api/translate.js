// api/translate.js

// This is a Vercel Serverless Function that translates text using Gemini AI
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

  const { text, sourceLang = 'es', targetLang = 'en' } = request.body;

  if (!text) {
    return response.status(400).json({ error: 'Missing "text" in request body.' });
  }

  // Use gemini-pro for translation
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;

  // Create a simple translation prompt
  const translationPrompt = `Translate the following ${sourceLang === 'es' ? 'Spanish' : 'text'} to ${targetLang === 'en' ? 'English' : 'text'}. Provide ONLY the translation, with no additional explanation, formatting, or quotation marks.

Text to translate: ${text}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: translationPrompt }]
      }
    ]
  };

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

    // Extract the translated text from Gemini's response
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedText) {
      console.error('No translation in Gemini response:', data);
      return response.status(500).json({
        error: 'Failed to extract translation from Gemini response'
      });
    }

    // Return in the format expected by the frontend
    return response.status(200).json({ translatedText });

  } catch (error) {
    console.error('Error translating with Gemini:', error);
    return response.status(500).json({
      error: 'Internal Server Error: Failed to translate text'
    });
  }
}
