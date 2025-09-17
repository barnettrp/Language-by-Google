// /api/hint.js
export default async function handler(req, res) {
  try {
    const { recentMessages, stage, settings } = req.body || {};

    // Use your secret OpenAI key from Vercel env vars
    const apiKey = process.env.OPENAI_API_KEY;

    // Example: simple call to OpenAI (pseudo, add your fetch)
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",   // pick your model
        input: "Give me a hint based on this: " + JSON.stringify(recentMessages)
      }),
    });

    const data = await response.json();
    res.status(200).json({ hint: data.output_text || "No hint available." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch hint" });
  }
}
