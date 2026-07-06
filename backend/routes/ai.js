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
   const {
  prompt,
  provider = "gemini",
} = req.body;

const modelName = (() => {
  const requested = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  // Auto-upgrade deprecated / removed model names
  const DEPRECATED = {
    "gemini-pro":        "gemini-1.5-flash",
    "gemini-pro-vision": "gemini-1.5-flash",
    "gemini-ultra":      "gemini-1.5-pro",
  };
  return DEPRECATED[requested] ?? requested;
})();

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
    // Fallback chain: primary model → gemini-1.5-pro → gemini-1.0-pro
    const FALLBACK_MODELS = ["gemini-1.5-pro", "gemini-1.0-pro"];
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (modelErr) {
      const errMsg = modelErr.message || "";
      const isModelUnavailable =
        errMsg.includes("503") ||
        errMsg.includes("404") ||
        errMsg.includes("is not found") ||
        errMsg.includes("not supported") ||
        errMsg.includes("deprecated");

      if (isModelUnavailable) {
        let fallbackSuccess = false;
        for (const fallbackModel of FALLBACK_MODELS) {
          try {
            console.log(`Model ${modelName} failed. Trying fallback: ${fallbackModel}...`);
            model = genAI.getGenerativeModel({ model: fallbackModel });
            result = await model.generateContent(prompt);
            fallbackSuccess = true;
            break;
          } catch (fallbackErr) {
            console.error(`Fallback ${fallbackModel} also failed:`, fallbackErr.message);
          }
        }
        if (!fallbackSuccess) {
          throw new Error("All AI models are currently unavailable. Please try again later.");
        }
      } else {
        throw modelErr;
      }
    }
    
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error("AI Proxy Error:", err);
    const msg = err.message || "";

    if (msg.toLowerCase().includes("quota") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
      return res.status(429).json({ error: "AI quota exceeded. Please wait a few minutes and try again." });
    }

    if (msg.toLowerCase().includes("all ai models are currently unavailable")) {
      return res.status(503).json({ error: "All AI models are currently unavailable. Please try again in a few minutes." });
    }

    if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID") || msg.includes("401")) {
      return res.status(401).json({ error: "Invalid API key. Please check your API key in Settings." });
    }

    if (msg.includes("503") || msg.includes("overloaded")) {
      return res.status(503).json({ error: "The AI provider is experiencing high demand. Please try again later." });
    }

    if (msg.includes("403") || msg.includes("SERVICE_DISABLED") || msg.includes("not been used in project")) {
      return res.status(403).json({ error: "The AI service is not enabled for this API key. Please check your Google Cloud project settings." });
    }

    if (msg.includes("404") || msg.includes("is not found") || msg.includes("not supported")) {
      return res.status(503).json({ error: "AI model unavailable. Please try again later." });
    }

    // Generic fallback — never leak raw error messages to the client
    res.status(500).json({ error: "Something went wrong with the AI request. Please try again." });
  } finally {
    // 4. Zero out key from memory
    // While V8 handles GC for primitive strings, overwriting the local reference helps.
    apiKey = null;
  }
});

module.exports = router;
