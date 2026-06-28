const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const { encrypt } = require("../utils/crypto");
const { getAuthClient } = require("../utils/supabaseClient");

// Apply auth middleware to all routes
router.use(authenticateUser);

/**
 * POST /api/keys
 * Add or update an API key for the user.
 */
router.post("/", async (req, res) => {
  try {
    const { provider, apiKey } = req.body;
    
    if (!provider || !apiKey) {
      return res.status(400).json({ error: "Provider and apiKey are required." });
    }

    // Generate masked key for display (e.g. AIza****************X7R)
    let maskedKey = "";
    if (apiKey.length > 10) {
      maskedKey = apiKey.substring(0, 4) + "*".repeat(apiKey.length - 7) + apiKey.substring(apiKey.length - 3);
    } else {
      maskedKey = "*".repeat(apiKey.length);
    }

    // Encrypt the API key
    const { encryptedData, iv, authTag } = encrypt(apiKey);

    const supabase = getAuthClient(req.headers.authorization);

    // Upsert the encrypted key to Supabase
    // Using user_id and provider as conflict target based on UNIQUE constraint
    const { error } = await supabase
      .from("user_api_keys")
      .upsert({
        user_id: req.user.id,
        provider: provider,
        encrypted_key: encryptedData,
        iv: iv,
        auth_tag: authTag,
        masked_key: maskedKey,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, provider' });

    if (error) {
      console.error("Supabase upsert error:", error);
      return res.status(500).json({ error: "Failed to store API key securely." });
    }

    res.json({ message: "API key stored securely." });
  } catch (err) {
    console.error("API Key Save Error:", err);
    res.status(500).json({ error: "Internal server error while saving key." });
  }
});

/**
 * GET /api/keys/status
 * Check if the user has an API key stored. Does NOT return the key.
 */
router.get("/status", async (req, res) => {
  try {
    const provider = req.query.provider || "gemini";
    const supabase = getAuthClient(req.headers.authorization);
    
    const { data, error } = await supabase
      .from("user_api_keys")
      .select("created_at, updated_at, masked_key")
      .eq("user_id", req.user.id)
      .eq("provider", provider)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: "Failed to fetch key status." });
    }

    if (data) {
      return res.json({ 
        exists: true, 
        masked_key: data.masked_key,
        created_at: data.created_at,
        updated_at: data.updated_at 
      });
    }

    res.json({ exists: false });
  } catch (err) {
    console.error("API Key Status Error:", err);
    res.status(500).json({ error: "Internal server error fetching key status." });
  }
});

/**
 * DELETE /api/keys
 * Remove an API key securely.
 */
router.delete("/", async (req, res) => {
  try {
    const provider = req.query.provider || "gemini";
    const supabase = getAuthClient(req.headers.authorization);
    
    const { error } = await supabase
      .from("user_api_keys")
      .delete()
      .eq("user_id", req.user.id)
      .eq("provider", provider);

    if (error) {
      return res.status(500).json({ error: "Failed to delete API key." });
    }

    res.json({ message: "API key removed successfully." });
  } catch (err) {
    console.error("API Key Delete Error:", err);
    res.status(500).json({ error: "Internal server error deleting key." });
  }
});

module.exports = router;
