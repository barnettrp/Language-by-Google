const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Gemini API function
exports.callGeminiAPI = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { systemPrompt, userPrompt } = data;
  
  // Get API key from environment config
  const apiKey = functions.config().gemini.key;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
        })
      }
    );
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error.message);
    }
    
    const result = await response.json();
    return { text: result.candidates[0].content.parts[0].text };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to call Gemini API');
  }
});

// Translation API function
exports.translateText = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { text } = data;
  const apiKey = functions.config().translate.key;
  
  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: 'en', source: 'es' })
      }
    );
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const result = await response.json();
    return { translation: result.data.translations[0].translatedText };
  } catch (error) {
    console.error('Translation API error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to translate text');
  }
});
