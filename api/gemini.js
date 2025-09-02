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
    let generationConfig = { responseMimeType: 'text/plain' };

    switch (type) {
        case 'chat':
            // --- UPDATED: Now receives and uses 'stage' and 'settings' correctly ---
            const { stage, settings, history: requestHistory } = body;
            if (!stage || !settings) {
                return response.status(400).json({ error: 'Missing stage or settings data.' });
            }
            
            let finalSystemPrompt = stage.systemPrompt || "You are a friendly Spanish tutor.";
            if (stage.isChallengeMode && stage.challengePrompt) {
                finalSystemPrompt += ` ${stage.challengePrompt}`;
            }
            systemPrompt = `${finalSystemPrompt} The dialect should be ${settings.dialect}. The formality should be ${settings.formality}. Keep responses to 1-2 sentences.`;
            history = requestHistory.map(m => ({ role: m.role === 'ai' ? 'model' : m.role, parts: m.parts }));
            break;
        
        // ... (Other cases like 'validation', 'analysis', etc. are unchanged)
        case 'validation':
            systemPrompt = `You are a strict game master. Based on the conversation transcript, did the user achieve the objective described in the prompt? Answer ONLY with the single word "YES" or "NO". Do not provide any explanation.`;
            userPrompt = `TRANSCRIPT:\n${body.transcript}\n\nOBJECTIVE: ${body.validationPrompt}`;
            break;

    }
    
    const contents = history.length > 0 ? history : [{ role: 'user', parts: [{ text: userPrompt }] }];
    
    const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: contents,
        generationConfig: generationConfig
    };

    try {
        const geminiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) { /* ... error handling ... */ }
        const result = await geminiResponse.json();
        const text = result.candidates[0]?.content?.parts[0]?.text;

        if (!text) { /* ... error handling ... */ }
        
        // ... (response handling for analysis, etc. is unchanged)
        
        response.status(200).json({ text });

    } catch (error) {
        console.error("Server Error:", error);
        response.status(500).json({ error: 'An internal server error occurred.' });
    }
}

