// /api/chat.js
export default async function handler(req, res) {
  try {
    const { messages = [] } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const system =
      "You are ConvoQuest, a concise, friendly assistant. " +
      "Give clear, helpful answers. Prefer step-by-step when user is stuck.";

    // Convert your simple {role, content} array into Gemini 'contents'
    const parts = [
      { role: "user", parts: [{ text: system }] },
      ...messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }))
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: parts }),
    });

    if (!resp.ok) return res.status(resp.status).json({ error: await resp.text() });
    const data = await resp.json();

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I’m here!";
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Chat fetch failed" });
  }
}
