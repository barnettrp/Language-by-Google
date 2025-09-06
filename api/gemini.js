// File: pages/api/gemini.js
// Next.js (Pages Router) API route for ConvoQuest
// Requires: npm i @google/generative-ai
// ENV: GOOGLE_AI_API_KEY=your_key

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-pro"; // or "gemini-1.5-flash" if you want cheaper/faster

function getModel() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_AI_API_KEY");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

/** Convert your UI's history shape into Gemini chat history */
function toGeminiHistory(history = []) {
  // Expecting: [{ role: 'user'|'model', parts: [{text} ...] }, ...]
  // Gemini accepts the same structure.
  const safe = history
    .filter(m => m && (m.role === "user" || m.role === "model") && Array.isArray(m.parts))
    .map(m => ({
      role: m.role,
      parts: m.parts.map(p => ({ text: String(p.text ?? "") }))
    }));
  return safe;
}

/** Small helper to extract plain text from a generateContent result */
function getText(result) {
  try {
    return result?.response?.text?.() ?? result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch {
    return "";
  }
}

/** Guard to keep responses short when needed */
function withGenConfig(overrides = {}) {
  return {
    // Sensible defaults; adjust as you like
    maxOutputTokens: overrides.maxOutputTokens ?? 512,
    temperature: overrides.temperature ?? 0.7,
    topP: overrides.topP ?? 0.95,
    topK: overrides.topK ?? 40,
  };
}

/** System preamble for roleplay/chat */
function makeChatPreamble(stage, settings) {
  const sys = [
    "You are the Spanish conversation partner inside 'ConvoQuest'.",
    "Stay in character and be helpful, friendly, and concise.",
    "Encourage the learner with natural Spanish matching their level.",
    "When relevant, prefer the user's dialect and formality setting.",
    "",
    `Character/System Prompt: ${stage?.systemPrompt ?? "Spanish tutor."}`,
    `Character Name: ${stage?.characterName ?? "Tutor"}`,
    `Formality: ${settings?.formality ?? "Casual"}`,
    `Dialect preference: ${settings?.dialect ?? "Mexico"}`,
  ].join("\n");
  return sys;
}

/** Force YES/NO only */
function makeValidationPrompt(transcript, validationPrompt) {
  return [
    "You are a strict validator.",
    "User transcript is below. Determine if the objective was accomplished.",
    "Answer with ONLY 'YES' or 'NO'. Do not add anything else.",
    "",
    "Objective:",
    validationPrompt ?? "",
    "",
    "Transcript:",
    transcript ?? "",
    "",
    "Answer strictly 'YES' or 'NO':"
  ].join("\n");
}

/** Correction prompt: first line must start with 'Corrected: ...' */
function makeCorrectionPrompt(text) {
  return [
    "You are a Spanish writing corrector for a language learner.",
    "Correct the user's single sentence to natural, grammatical Spanish.",
    "On the FIRST LINE, output: 'Corrected: <one best correction>'",
    "Then on the next short line, optionally add a brief reason starting with 'Why:'.",
    "",
    `User sentence:\n${text ?? ""}`
  ].join("\n");
}

/** Grammar explanation prompt (brief, actionable) */
function makeGrammarPrompt(original, corrected) {
  return [
    "Explain the key grammar difference between the original and corrected Spanish.",
    "Keep it concise and actionable for an A1–B1 learner (2–5 sentences).",
    "",
    `Original: ${original ?? ""}`,
    `Corrected: ${corrected ?? ""}`
  ].join("\n");
}

/** Hint prompt (produce a next helpful learner utterance) */
function makeHintPrompt(history, stage) {
  const lastTurns = (history || []).map(m => `${m.role.toUpperCase()}: ${(m.parts?.[0]?.text ?? "").trim()}`).join("\n");
  return [
    "You are generating a short hint line for the learner to say next in Spanish.",
    "It should move the conversation toward the stage objective and be simple/natural.",
    "Return ONLY the Spanish sentence (no quotes, no English).",
    "",
    `Stage Objective Context: ${stage?.vignette_en ?? stage?.systemPrompt ?? ""}`,
    "",
    "Recent conversation:",
    lastTurns
  ].join("\n");
}

/** Placement prompts */
function makePlacementPrompt(history) {
  const convo = (history || []).map(m => `${m.role.toUpperCase()}: ${(m.parts?.[0]?.text ?? "").trim()}`).join("\n");
  return [
    "You are a Spanish placement interviewer.",
    "Respond in simple, supportive Spanish. Ask short, clear questions.",
    "Base your next message on the conversation so far.",
    "",
    "Conversación:",
    convo
  ].join("\n");
}

function makePlacementAnalysisPrompt(transcript) {
  return [
    "You are analyzing a Spanish placement interview transcript.",
    "Assign a CEFR level among: A1, A2, B1, B2, C1, C2.",
    "Return ONLY the level token (e.g., A1) with no extra words.",
    "",
    "Transcript:",
    transcript ?? ""
  ].join("\n");
}

/** Analysis prompt (returns a small JSON summary) */
function makeAnalysisPrompt(transcript) {
  return [
    "Analyze the Spanish conversation transcript and return a compact JSON object:",
    "{ \"strengths\": [\"...\"], \"targets\": [\"...\"], \"phrasesToPractice\": [\"...\"], \"estimatedLevel\": \"A1|A2|B1|B2|C1|C2\" }",
    "No explanation outside JSON.",
    "",
    "Transcript:",
    transcript ?? ""
  ].join("\n");
}

/** Translation prompt (word-with-context). Keep short. */
function makeTranslationPrompt(word, context) {
  return [
    "Give a concise English gloss for the given Spanish word as used in the provided sentence/context.",
    "If multiple senses exist, list the top 1–2 most likely meanings based on context.",
    "Return 1–3 short lines; avoid long explanations.",
    "",
    `Word: ${word ?? ""}`,
    `Context: ${context ?? ""}`
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const model = getModel();
    const { type } = req.body || {};

    // Basic guard
    if (!type) return res.status(400).json({ error: "Missing 'type' in request body." });

    switch (type) {
      case "chat": {
        const { history = [], stage = {}, settings = {} } = req.body || {};
        const preamble = makeChatPreamble(stage, settings);

        // Use chat with history
        const chat = model.startChat({
          history: [
            // Seed the system role as a 'model' message that sets behavior (Gemini doesn't have system role)
            { role: "model", parts: [{ text: preamble }] },
            ...toGeminiHistory(history),
          ],
          generationConfig: withGenConfig({ maxOutputTokens: 512, temperature: 0.8 }),
        });

        const result = await chat.sendMessage("Continuar la conversación.");
        return res.status(200).json({ text: getText(result).trim() });
      }

      case "validation": {
        const { transcript, validationPrompt } = req.body || {};
        const prompt = makeValidationPrompt(transcript, validationPrompt);
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: withGenConfig({ temperature: 0.0, maxOutputTokens: 8 }),
        });
        let text = getText(result).trim().toUpperCase();
        text = text.includes("YES") ? "YES" : text.includes("NO") ? "NO" : "NO";
        return res.status(200).json({ text });
      }

      case "correction": {
        const { text } = req.body || {};
        const prompt = makeCorrectionPrompt(text);
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: withGenConfig({ temperature: 0.4, maxOutputTokens: 256 }),
        });
        return res.status(200).json({ text: getText(result).trim() });
      }

      case "grammar": {
        const { original, corrected } = req.body || {};
        const prompt = makeGrammarPrompt(original, corrected);
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: withGenConfig({ temperature: 0.5, maxOutputTokens: 200 }),
        });
        return res.status(200).json({ text: getText(result).trim() });
      }

      case "hint": {
        const { history = [], stage = {} } = req.body || {};
        const prompt = makeHintPrompt(history, stage);
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: withGenConfig({ temperature: 0.7, maxOutputTokens: 80 }),
        });
        return res.status(200).json({ text: getText(result).trim() });
      }

      case "translation": {
        const { word, context } = req.body || {};
        const prompt = makeTranslationPrompt(word, context);
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: withGenConfig({ temperature: 0.3, maxOutputTokens: 120 }),
        });
        return res.status(200).json({ text: getText(result).trim() });
      }

      case "placement": {
        const { history = [] } = req.body || {};
        const prompt = makePlacementPrompt(history);
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: withGenConfig({ temperature: 0.7, maxOutputTokens: 180 }),
        });
        return res.status(200).json({ text: getText(result).trim() });
      }

      case "placement-analysis": {
        const { transcript } = req.body || {};
        const prompt = makePlacementAnalysisPrompt(transcript);
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: withGenConfig({ temperature: 0.0, maxOutputTokens: 10 }),
        });
        return res.status(200).json({ text: getText(result).trim().toUpperCase() || "A1" });
      }

      case "analysis": {
        const { transcript } = req.body || {};
        const prompt = makeAnalysisPrompt(transcript);
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: withGenConfig({ temperature: 0.3, maxOutputTokens: 256 }),
        });
        let raw = getText(result).trim();
        // Best-effort JSON parse; if it fails, wrap it
        try {
          const data = JSON.parse(raw);
          return res.status(200).json({ data });
        } catch {
          return res.status(200).json({
            data: {
              strengths: [],
              targets: [],
              phrasesToPractice: [],
              estimatedLevel: "A1",
              _raw: raw,
            },
          });
        }
      }

      default:
        return res.status(400).json({ error: `Unsupported type: ${type}` });
    }
  } catch (err) {
    console.error("Gemini API error:", err);
    const message = err?.message || "Internal error";
    // Common missing-key error hint
    if (String(message).includes("GOOGLE_AI_API_KEY")) {
      return res.status(500).json({ error: "Server is missing GOOGLE_AI_API_KEY env var." });
    }
    return res.status(500).json({ error: message });
  }
}
