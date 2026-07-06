const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const { decrypt } = require("../utils/crypto");
const { getAuthClient } = require("../utils/supabaseClient");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Apply auth middleware to all routes
router.use(authenticateUser);

// Deprecated model name → replacement
const DEPRECATED_MODELS = {
  "gemini-pro":        "gemini-1.5-flash",
  "gemini-pro-vision": "gemini-1.5-flash",
  "gemini-ultra":      "gemini-1.5-pro",
};

// Ordered list of models to try (primary + fallbacks)
const MODEL_CHAIN = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-1.0-pro"];

/**
 * Classify a raw Gemini SDK error into a clean HTTP response.
 */
function classifyGeminiError(err, res) {
  const raw = (err?.message || err?.toString() || "").toLowerCase();
  console.error("[AI] Raw error:", err?.message || err);

  if (raw.includes("api key not valid") || raw.includes("api_key_invalid") || raw.includes("invalid api key") || raw.includes("api key expired")) {
    return res.status(401).json({ error: "Your API key is invalid or expired. Please update it in Settings." });
  }
  if (raw.includes("quota") || raw.includes("resource_exhausted") || raw.includes("429") || raw.includes("rate limit")) {
    return res.status(429).json({ error: "AI quota limit reached. Please wait a few minutes and try again." });
  }
  if (raw.includes("service_disabled") || raw.includes("not been used in project") || raw.includes("api has not been used") || raw.includes("403")) {
    return res.status(403).json({ error: "The Gemini API is not enabled for your API key. Please enable it at console.developers.google.com or use an API key from aistudio.google.com." });
  }
  if (raw.includes("503") || raw.includes("overloaded") || raw.includes("unavailable")) {
    return res.status(503).json({ error: "AI service is overloaded. Please try again in a moment." });
  }
  if (raw.includes("404") || raw.includes("is not found") || raw.includes("not supported") || raw.includes("deprecated")) {
    return res.status(503).json({ error: "AI model unavailable. Please try again." });
  }
  if (raw.includes("network") || raw.includes("fetch") || raw.includes("econnrefused") || raw.includes("etimedout")) {
    return res.status(503).json({ error: "Network error reaching AI service. Please try again." });
  }

  // Generic safe fallback
  return res.status(500).json({ error: "Something went wrong with the AI request. Please try again." });
}

/**
 * Helper to fetch and decrypt the user's API key.
 */
async function getDecryptedApiKey(userId, authHeader, provider = "gemini") {
  const supabase = getAuthClient(authHeader);
  const { data, error } = await supabase
    .from("user_api_keys")
    .select("encrypted_key, iv, auth_tag")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();

  if (error || !data) {
    throw new Error("API_KEY_NOT_FOUND");
  }

  try {
    return decrypt(data.encrypted_key, data.iv, data.auth_tag);
  } catch (err) {
    console.error("Decryption Error:", err);
    throw new Error("DECRYPTION_FAILED");
  }
}

/**
 * Try generating content with a given API key across the model chain.
 * Returns { text } on success, throws the last error on full failure.
 */
async function tryGenerateWithKey(apiKey, prompt) {
  const requested = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const primary = DEPRECATED_MODELS[requested] || requested;

  // Build model chain: primary first, then remaining fallbacks (skip duplicates)
  const chain = [primary, ...MODEL_CHAIN.filter(m => m !== primary)];

  let lastErr = null;
  for (const modelName of chain) {
    try {
      console.log(`[AI] Trying model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      console.log(`[AI] Success with model: ${modelName}`);
      return text;
    } catch (err) {
      console.error(`[AI] Model ${modelName} failed:`, err.message);
      lastErr = err;

      // If it's a key/auth/quota/API-disabled error, stop immediately — no point trying other models
      const msg = (err?.message || "").toLowerCase();
      const isKeyError =
        msg.includes("api key not valid") ||
        msg.includes("api_key_invalid") ||
        msg.includes("invalid api key") ||
        msg.includes("quota") ||
        msg.includes("resource_exhausted") ||
        msg.includes("403") ||
        msg.includes("service_disabled") ||
        msg.includes("not been used in project") ||
        msg.includes("401");

      if (isKeyError) {
        console.log(`[AI] Key/auth error detected, stopping fallback chain.`);
        throw err; // Surface immediately to classifyGeminiError
      }
      // Otherwise (503, 404, network) — continue to next model
    }
  }

  throw lastErr;
}

/**
 * POST /api/ai/generate
 * Proxies the AI generation request securely.
 */
router.post("/generate", async (req, res) => {
  let apiKey = null;
  try {
    const { prompt, provider = "gemini" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    if (provider !== "gemini") {
      return res.status(400).json({ error: "Only Gemini is supported currently." });
    }

    // 1. Fetch & Decrypt user's API key
    try {
      apiKey = await getDecryptedApiKey(req.user.id, req.headers.authorization, provider);
    } catch (err) {
      if (err.message === "API_KEY_NOT_FOUND") {
        return res.status(404).json({ error: "No API key configured. Please go to Settings and add your Gemini API key." });
      }
      return res.status(500).json({ error: "Failed to decrypt API key." });
    }

    // 2. Generate with full model chain fallback
    const text = await tryGenerateWithKey(apiKey, prompt);
    res.json({ text });

  } catch (err) {
    return classifyGeminiError(err, res);
  } finally {
    apiKey = null;
  }
});

module.exports = router;
