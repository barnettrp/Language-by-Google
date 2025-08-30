// Vercel Serverless Function
// This file will live at the path /api/gemini.js

export default async function handler(request, response) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Securely get the API key from Vercel's environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return response.status(500).json({ error: 'API key not configured.' });
    }

    const { type, history, scenario, textToCorrect, transcript } = request.body;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    
    let systemPrompt = "";
    let userPrompt = "";

    // Determine prompts based on request type
    switch (type) {
        case 'chat':
            systemPrompt = `${scenario.systemPrompt} The dialect should be ${scenario.dialect}. The formality should be ${scenario.formality}.`;
            // The user's latest message is the last one in the history
            userPrompt = history[history.length - 1].parts[0].text; 
            break;
        // Cases for 'correction', 'analysis', 'translation' would go here
        default:
            return response.status(400).json({ error: 'Invalid request type' });
    }
    
    // Construct the payload for the Gemini API
    const payload = {
        // We add the system instruction and the recent chat history for context
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: history 
    };

    try {
        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error("Gemini API Error:", errorText);
            return response.status(geminiResponse.status).json({ error: 'Failed to get response from AI.' });
        }

        const result = await geminiResponse.json();
        const text = result.candidates[0]?.content?.parts[0]?.text;

        if (!text) {
             return response.status(500).json({ error: 'Received an empty response from AI.' });
        }

        // Send the AI's response back to the front-end app
        response.status(200).json({ text });

    } catch (error) {
        console.error("Server Error:", error);
        response.status(500).json({ error: 'An internal server error occurred.' });
    }
}
