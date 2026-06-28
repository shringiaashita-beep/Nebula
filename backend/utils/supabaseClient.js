require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("FATAL ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in backend/.env");
  process.exit(1);
}

// Global anonymous client (for auth verification, etc.)
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to create a user-scoped client for RLS
const getAuthClient = (authHeader) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    }
  });
};

module.exports = { supabase, getAuthClient };
