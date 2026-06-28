const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const { decrypt } = require("../utils/crypto");
const { getAuthClient } = require("../utils/supabaseClient");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Apply auth middleware to all routes
router.use(authenticateUser);

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
 * POST /api/ai/generate
 * Proxies the AI generation request securely.
 */
router.post("/generate", async (req, res) => {
  let apiKey = null;
  try {
    const { prompt, modelName = "gemini-2.5-flash", provider = "gemini" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    if (provider !== "gemini") {
      return res.status(400).json({ error: "Only Gemini is supported currently." });
    }

    // 1. Fetch & Decrypt Key
    try {
      apiKey = await getDecryptedApiKey(req.user.id, req.headers.authorization, provider);
    } catch (err) {
      if (err.message === "API_KEY_NOT_FOUND") {
        return res.status(404).json({ error: "No API key configured. Please add one in Settings." });
      }
      return res.status(500).json({ error: "Failed to decrypt API key." });
    }

    // 2. Initialize Gemini Client
    const genAI = new GoogleGenerativeAI(apiKey);
    let model = genAI.getGenerativeModel({ model: modelName });

    // 3. Generate Content with Fallback
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (modelErr) {
      if (modelErr.message && modelErr.message.includes("503") && modelName === "gemini-2.5-flash") {
        console.log("503 Service Unavailable: Falling back to gemini-1.5-flash...");
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        result = await model.generateContent(prompt);
      } else {
        throw modelErr;
      }
    }
    
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error("AI Proxy Error:", err);
    
    // Attempt to safely parse Gemini errors to avoid leaking full error stack
    if (err.message && err.message.toLowerCase().includes("quota")) {
      return res.status(429).json({ error: "AI quota exceeded. Please wait or check your plan." });
    }
    
    if (err.message && err.message.includes("API key not valid")) {
      return res.status(401).json({ error: "Invalid API key provided." });
    }

    if (err.message && err.message.includes("503")) {
      return res.status(503).json({ error: "The AI provider is experiencing high demand. Please try again later." });
    }

    res.status(500).json({ error: "An error occurred while communicating with the AI provider." });
  } finally {
    // 4. Zero out key from memory
    // While V8 handles GC for primitive strings, overwriting the local reference helps.
    apiKey = null;
  }
});

module.exports = router;
