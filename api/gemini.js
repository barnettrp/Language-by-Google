// Vercel Serverless Function at /api/gemini.js

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type, ...body } = request.body;
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (type === 'translation') {
        if (!GOOGLE_TRANSLATE_API_KEY) {
            return response.status(500).json({ error: 'Translate API key not configured.' });
        }
        const { word } = body;
        const translateUrl = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
        try {
            const translateResponse = await fetch(translateUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: word, source: 'es', target: 'en', format: 'text' })
            });

            // --- NEW: More Robust Error Handling & Logging ---
            if (!translateResponse.ok) {
                const errorText = await translateResponse.text(); // Get raw error text
                console.error("Google Translate API Raw Error:", errorText);
                try {
                    // Try to parse it as JSON, as Google often sends structured errors
                    const errorBody = JSON.parse(errorText);
                    const errorMessage = errorBody.error?.message || "Translation API request failed with an unknown error.";
                    return response.status(translateResponse.status).json({ error: errorMessage }); 
                } catch (e) {
                    // If it's not JSON, return the raw text
                    return response.status(translateResponse.status).json({ error: errorText });
                }
            }

            const result = await translateResponse.json();
            const translatedText = result.data.translations[0].translatedText;
            return response.status(200).json({ text: translatedText });

        } catch (error) {
            console.error("Server Error during translation:", error);
            return response.status(500).json({ error: 'An internal server error occurred.' });
        }
    }

    // --- All other requests use the Gemini API ---
    if (!GEMINI_API_KEY) {
        return response.status(500).json({ error: 'Gemini API key not configured.' });
    }
    
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    
    let systemPrompt = "";
    let userPrompt = "";
    let history = [];
    let generationConfig = { responseMimeType: 'text/plain' };

    switch (type) {
        case 'chat':
            const { stage, settings, history: requestHistory } = body;
            if (!stage || !settings) {
                return response.status(400).json({ error: 'Missing stage or settings data for chat.' });
            }
            let finalSystemPrompt = stage.systemPrompt || "You are a friendly Spanish tutor.";
            if (stage.isChallengeMode && stage.challengePrompt) {
                finalSystemPrompt += ` ${stage.challengePrompt}`;
            }
            systemPrompt = `${finalSystemPrompt} The dialect should be ${settings.dialect}. The formality should be ${settings.formality}. Keep responses to 1-2 sentences.`;
            history = requestHistory.map(m => ({ role: m.role === 'ai' ? 'model' : m.role, parts: m.parts }));
            break;
        
        case 'validation':
            systemPrompt = `You are a strict game master. Based on the conversation transcript, did the user achieve the objective described in the prompt? Answer ONLY with the single word "YES" or "NO". Do not provide any explanation.`;
            userPrompt = `TRANSCRIPT:\n${body.transcript}\n\nOBJECTIVE: ${body.validationPrompt}`;
            break;

        case 'analysis':
            systemPrompt = `Analyze this Spanish conversation. The user is the learner. Provide all feedback in English. Provide a JSON object with keys "newVocabulary" (an array of objects, each with "spanish" and "english" keys), "grammarFeedback" (a brief, encouraging paragraph in English), and "proficiencyScore" (a number 0-100).`;
            userPrompt = body.transcript;
            generationConfig.responseMimeType = 'application/json';
            break;
            
        case 'correction':
            systemPrompt = "You are a helpful language assistant. Correct the user's Spanish sentence and provide a brief, one-sentence explanation in English. Format: 'Corrected: [Corrected sentence]\\nExplanation: [English explanation]'";
            userPrompt = body.text;
            break;
            
        case 'hint':
            const { stage: hintStage, history: hintHistory } = body;
            systemPrompt = `You are a helpful language tutor...`;
            userPrompt = `OBJECTIVE: ${hintStage.vignette_en.split('Your goal: ')[1]}\n\nHISTORY:\n${hintHistory.map(m => `${m.role}: ${m.parts[0].text}`).join('\n')}`;
            break;

        default:
            return response.status(400).json({ error: 'Invalid request type' });
    }
    
    const contents = history.length > 0 ? history : [{ role: 'user', parts: [{ text: userPrompt }] }];
    
    const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contents,
        generationConfig: generationConfig
    };

    try {
        const geminiResponse = await fetch(geminiUrl, {
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
        console.error("Server Error with Gemini:", error);
        response.status(500).json({ error: 'An internal server error occurred.' });
    }
}

