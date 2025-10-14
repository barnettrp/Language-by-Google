// api/translate.js
// Vercel Serverless Function for Google Translate API

export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get API key from environment variables
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'Google Translate API key not configured on the server.' });
  }

  const { text, sourceLang = 'es', targetLang = 'en' } = request.body;

  if (!text) {
    return response.status(400).json({ error: 'Missing "text" in request body.' });
  }

  // Google Translate API endpoint
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  try {
    const translateResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      }),
    });

    if (!translateResponse.ok) {
      const errorBody = await translateResponse.json();
      console.error('Google Translate API Error:', errorBody);
      return response.status(translateResponse.status).json({
        error: `Translation API error: ${errorBody.error?.message || 'Unknown error'}`
      });
    }

    const data = await translateResponse.json();

    // Extract the translated text
    const translatedText = data.data?.translations?.[0]?.translatedText || text;

    return response.status(200).json({
      originalText: text,
      translatedText: translatedText,
      sourceLang: sourceLang,
      targetLang: targetLang
    });

  } catch (error) {
    console.error('Error calling Google Translate:', error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
}
