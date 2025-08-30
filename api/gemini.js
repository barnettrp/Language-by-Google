// Vercel Serverless Function at /api/gemini.js

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return response.status(500).json({ error: 'API key not configured.' });
    }

    const { type, ...body } = request.body;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    
    let systemPrompt = "";
    let userPrompt = "";
    let history = [];

    switch (type) {
        case 'chat':
            const { scenario } = body;
            systemPrompt = `${scenario.systemPrompt} The dialect should be ${scenario.dialect}. The formality should be ${scenario.formality}. Keep responses to 1-2 sentences.`;
            
            // --- FIX: Sanitize the roles before sending to the Gemini API ---
            history = body.history.map(message => ({
                role: message.role === 'ai' ? 'model' : 'user', // Convert 'ai' to 'model'
                parts: message.parts
            }));
            break;
            
        case 'correction':
            systemPrompt = "You are a helpful language assistant. The user has provided a sentence in Spanish. Correct any grammatical errors and provide a brief, one-sentence explanation of the correction in English. Respond in the format: 'Corrected: [Corrected Spanish sentence]\\nExplanation: [English explanation]'";
            userPrompt = body.text;
            break;

        case 'analysis':
            systemPrompt = `Analyze the following Spanish conversation transcript. The user is the language learner. Provide the following in a strict JSON format with keys "newVocabulary", "grammarFeedback", and "proficiencyScore":
1. newVocabulary: An array of 3-5 key Spanish words or phrases the user learned or should learn.
2. grammarFeedback: A brief, encouraging paragraph (2-3 sentences) with one key grammar suggestion.
3. proficiencyScore: An estimated proficiency score from 0 to 100.`;
            userPrompt = body.transcript;
            break;
            
        case 'translation':
            systemPrompt = `You are a helpful translation assistant. Provide a contextual translation for a Spanish word. Respond in the format: '[English Translation]\\nExample: [Spanish example sentence]'`;
            userPrompt = `Translate the word "${body.word}" given the context of the sentence: "${body.context}"`;
            break;

        default:
            return response.status(400).json({ error: 'Invalid request type' });
    }
    
    const contents = history.length > 0 ? history : [{ role: 'user', parts: [{ text: userPrompt }] }];
    
    const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contents
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
        
        if (type === 'analysis') {
            try {
                const analysisData = JSON.parse(result.candidates[0].content.parts[0].text);
                return response.status(200).json({ data: analysisData });
            } catch (e) {
                 console.error("Failed to parse analysis JSON:", e);
                 return response.status(500).json({ error: 'Could not parse the AI analysis.' });
            }
        }

        const text = result.candidates[0]?.content?.parts[0]?.text;
        if (!text) {
             return response.status(500).json({ error: 'Received an empty response from AI.' });
        }
        
        response.status(200).json({ text });

    } catch (error) {
        console.error("Server Error:", error);
        response.status(500).json({ error: 'An internal server error occurred.' });
    }
}

