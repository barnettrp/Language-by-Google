// api/translate.js

// This is a Vercel Serverless Function for Google Cloud Translation API
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

  const translateApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!translateApiKey) {
    console.error('GOOGLE_TRANSLATE_API_KEY environment variable is not set');
    return response.status(500).json({
      error: 'Google Translate API key not configured. Please set GOOGLE_TRANSLATE_API_KEY in .env'
    });
  }

  const { text, sourceLang, targetLang } = request.body;

  if (!text || !sourceLang || !targetLang) {
    return response.status(400).json({
      error: 'Missing required fields: text, sourceLang, targetLang'
    });
  }

  // Use Google Cloud Translation API
  const url = `https://translation.googleapis.com/language/translate/v2?key=${translateApiKey}`;

  try {
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
      return response.status(200).json({
        translatedText: data.data.translations[0].translatedText
      });
    } else {
      console.error('Translation API Error:', data);
      return response.status(translateResponse.status).json({
        error: data.error || 'Translation failed'
      });
    }

  } catch (error) {
    console.error('Error handling translation request:', error);
    return response.status(500).json({
      error: 'Internal Server Error: Failed to translate text'
    });
  }
}
