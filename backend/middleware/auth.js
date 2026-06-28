const { supabase } = require("../utils/supabaseClient");

/**
 * Middleware to authenticate user using Supabase JWT.
 * Validates the Authorization Bearer token.
 */
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data || !data.user) {
      return res.status(401).json({ error: "Unauthorized or token expired" });
    }

    // Attach user to request
    req.user = data.user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: "Internal authentication error" });
  }
}

module.exports = authenticateUser;
