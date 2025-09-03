// Vercel Serverless Function at /api/gemini.js

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type, ...body } = request.body;

    // --- UPDATED: Now uses two different keys for two different services ---
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

    // --- NEW: Logic for Google Translate API ---
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
                body: JSON.stringify({
                    q: word,
                    source: 'es',
                    target: 'en',
                    format: 'text'
                })
            });
            if (!translateResponse.ok) {
                console.error("Google Translate API Error:", await translateResponse.text());
                return response.status(500).json({ text: "Translation Error" });
            }
            const result = await translateResponse.json();
            const translatedText = result.data.translations[0].translatedText;
            // We will just return the simple translation for speed. The example sentence can be a future enhancement.
            return response.status(200).json({ text: translatedText });

        } catch (error) {
            console.error("Server Error during translation:", error);
            return response.status(500).json({ error: 'An internal server error occurred.' });
        }
    }

    // --- All other requests will use the Gemini API ---
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
            systemPrompt = `You are a strict game master... Answer ONLY with "YES" or "NO".`;
            userPrompt = `TRANSCRIPT:\n${body.transcript}\n\nOBJECTIVE: ${body.validationPrompt}`;
            break;

        case 'analysis':
            systemPrompt = `Analyze this Spanish conversation... Provide a JSON object...`;
            userPrompt = body.transcript;
            generationConfig.responseMimeType = 'application/json';
            break;
            
        case 'correction':
            systemPrompt = "Correct the user's Spanish sentence and provide a brief, one-sentence explanation in English...";
            userPrompt = body.text;
            break;
            
        case 'hint':
            systemPrompt = `You are a helpful language tutor... provide a short, simple phrase...`;
            userPrompt = `OBJECTIVE: ${body.stage.vignette_en.split('Your goal: ')[1]}\n\nHISTORY:\n${body.history.map(m => `${m.role}: ${m.parts[0].text}`).join('\n')}`;
            break;

        default:
            return response.status(400).json({ error: 'Invalid request type' });
    }
    
    const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: history.length > 0 ? history : [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: generationConfig
    };

    try {
        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!geminiResponse.ok) { /* ... error handling ... */ }
        const result = await geminiResponse.json();
        const text = result.candidates[0]?.content?.parts[0]?.text;
        if (!text) { /* ... error handling ... */ }
        
        if (type === 'analysis') {
            try {
                const analysisData = JSON.parse(text);
                return response.status(200).json({ data: analysisData });
            } catch (e) { /* ... error handling ... */ }
        }
        
        response.status(200).json({ text });

    } catch (error) {
        console.error("Server Error with Gemini:", error);
        response.status(500).json({ error: 'An internal server error occurred.' });
    }
}

