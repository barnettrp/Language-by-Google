// Vercel Serverless Function at /api/gemini.js

export default async function handler(request, response) {
    // Ensure the request is a POST request
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Securely get the API key from environment variables
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return response.status(500).json({ error: 'API key not configured.' });
    }

    // Destructure the request body to get the type and other data
    const { type, mission, ...body } = request.body;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    
    let systemPrompt = "";
    let userPrompt = "";
    let history = [];

    // Use a switch statement to handle different request types
    switch (type) {
        case 'chat':
            let finalSystemPrompt = mission.systemPrompt;
            if (mission.isChallengeMode && mission.challengePrompt) {
                finalSystemPrompt += ` ${mission.challengePrompt}`;
            }
            systemPrompt = `${finalSystemPrompt} The dialect should be ${mission.dialect}. The formality should be ${mission.formality}. Keep responses to 1-2 sentences.`;
            
            // Map the history to the format Gemini expects ('ai' role becomes 'model')
            history = body.history.map(m => ({
                role: m.role === 'ai' ? 'model' : m.role,
                parts: m.parts
            }));
            break;
            
        case 'correction':
            systemPrompt = "You are a helpful language assistant. Correct the user's Spanish sentence and provide a brief, one-sentence explanation in English. Format: 'Corrected: [Corrected sentence]\\nExplanation: [English explanation]'";
            userPrompt = body.text;
            break;

        case 'analysis':
            systemPrompt = `Analyze this Spanish conversation. The user is the learner. Provide a JSON object with keys "newVocabulary" (array of 3-5 Spanish words/phrases), "grammarFeedback" (a brief, encouraging paragraph), and "proficiencyScore" (a number 0-100).`;
            userPrompt = body.transcript;
            break;
            
        case 'translation':
            systemPrompt = `Provide a contextual translation for a Spanish word. Format: '[English Translation]\\nExample: [Spanish example sentence]'`;
            userPrompt = `Translate "${body.word}" in the context of the sentence: "${body.context}"`;
            break;

        default:
            return response.status(400).json({ error: 'Invalid request type' });
    }
    
    // Construct the payload for the Gemini API
    const contents = history.length > 0 ? history : [{ role: 'user', parts: [{ text: userPrompt }] }];
    
    const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contents,
        generationConfig: {
             // For analysis, force JSON output
            responseMimeType: type === 'analysis' ? 'application/json' : 'text/plain',
        }
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
        
        // For analysis, the response is already JSON data
        if (type === 'analysis') {
            try {
                const analysisData = JSON.parse(text);
                return response.status(200).json({ data: analysisData });
            } catch (e) {
                 console.error("Failed to parse analysis JSON:", text);
                 return response.status(500).json({ error: 'Could not parse the AI analysis.' });
            }
        }
        
        response.status(200).json({ text });

    } catch (error) {
        console.error("Server Error:", error);
        response.status(500).json({ error: 'An internal server error occurred.' });
    }
}

