// /api/translate.js
export default async function handler(req, res) {
  try {
    const { q = "", target = "es", source = "" } = req.body || {};
    const key = process.env.GOOGLE_TRANSLATE_KEY;
    if (!key) return res.status(500).json({ error: "Missing GOOGLE_TRANSLATE_KEY" });
    if (!q)   return res.status(400).json({ error: "Missing q (text)" });

    const url = `https://translation.googleapis.com/language/translate/v2?key=${key}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q, target, source: source || undefined, format: "text"
      }),
    });

    if (!resp.ok) return res.status(resp.status).json({ error: await resp.text() });
    const data = await resp.json();

    const translated = data?.data?.translations?.[0]?.translatedText ?? "";
    res.json({ translated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Translate failed" });
  }
}
