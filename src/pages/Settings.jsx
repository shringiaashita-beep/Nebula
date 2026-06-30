import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaKey, FaLock, FaTrash, FaCheck, FaExclamationTriangle, FaEye, FaEyeSlash, FaLanguage, FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import supabase from "../lib/supabase";
import { LANGUAGES } from "../config/languages";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState({ exists: false, masked_key: null, updated_at: null });
  const [language, setLanguage] = useState("english");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [langMessage, setLangMessage] = useState({ type: "", text: "" });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  console.log("API_URL =", API_URL);

  const BACKEND_URL = `${API_URL}/api/keys`;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }

      // Fetch Key Status
      const response = await fetch(`${BACKEND_URL}/status?provider=gemini`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setKeyStatus(data);
      }

      // Fetch Language Preference
      const { data: profile } = await supabase
        .from("profiles")
        .select("language_preference")
        .eq("id", session.user.id)
        .single();
        
      if (profile && profile.language_preference) {
        // Convert old "English" to lowercase "english" if needed
        setLanguage(profile.language_preference.toLowerCase());
      }

    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKey = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          provider: "gemini",
          apiKey: apiKey.trim()
        })
      });

      if (response.ok) {
        setMessage({ type: "success", text: "API Key securely encrypted and saved." });
        setApiKey("");
        fetchSettings();
      } else {
        const errData = await response.json();
        setMessage({ type: "error", text: errData.error || "Failed to save key." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!window.confirm("Are you sure you want to delete your API key? You won't be able to use AI features until you add it back.")) return;
    
    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${BACKEND_URL}?provider=gemini`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        setMessage({ type: "success", text: "API Key deleted successfully." });
        setKeyStatus({ exists: false, masked_key: null, updated_at: null });
      } else {
        setMessage({ type: "error", text: "Failed to delete key." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveLanguage = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setLangMessage({ type: "", text: "" });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("profiles")
        .update({ language_preference: language })
        .eq("id", session.user.id);

      if (error) throw error;
      
      import("i18next").then((i18n) => {
        i18n.default.changeLanguage(language);
      });
      
      setLangMessage({ type: "success", text: "Language preference updated." });
    } catch (error) {
      setLangMessage({ type: "error", text: "Failed to update language." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <FaArrowLeft /> Back to {t("Navigation.Dashboard")}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FaLock className="text-blue-400" /> API Settings & Security
          </h1>
          <p className="text-gray-400 mb-8">
            Manage your AI provider keys securely. We use a Zero-Trust architecture with End-to-End Encryption.
          </p>

          {/* Privacy Notice */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6 mb-8 flex items-start gap-4">
            <FaExclamationTriangle className="text-blue-400 text-2xl mt-1 shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-300 mb-1">Privacy Notice</h3>
              <p className="text-sm text-blue-200/80 leading-relaxed">
                Your API key belongs to you. It is <strong>encrypted before storage</strong>, transmitted only over secure connections, never shared with other users, never logged, and used <strong>only to fulfill your AI requests</strong>. The key is decrypted only in secure server memory and immediately cleared after use.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Key Management Form */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaKey className="text-purple-400" /> Gemini API Key
              </h2>
              
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 mb-6">
                <h3 className="font-semibold text-gray-300 mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-purple-400" /> How to get your API Key
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                  <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1">Google AI Studio <FaExternalLinkAlt size={10} /></a></li>
                  <li>Sign in with your Google account.</li>
                  <li>Click on <strong className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md border border-purple-500/30 font-medium">"Create API key"</strong> button.</li>
                  <li>Copy the key and paste it securely below.</li>
                </ol>
              </div>
              
              <form onSubmit={handleSaveKey} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    {keyStatus.exists ? "Replace existing key" : "Add new key"}
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
                    >
                      {showKey ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting || !apiKey.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? "Saving..." : "Secure & Save Key"}
                  </motion.button>
                  
                  {keyStatus.exists && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleDeleteKey}
                      disabled={submitting}
                      className="px-4 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition-colors flex items-center justify-center"
                      title="Delete Key"
                    >
                      <FaTrash />
                    </motion.button>
                  )}
                </div>
              </form>

              {message.text && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-3 rounded-lg text-sm ${
                    message.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-500/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {message.text}
                </motion.div>
              )}
            </div>

            {/* Status Panel */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
              <h3 className="font-semibold mb-4 text-gray-300">Encryption Status</h3>
              
              {loading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                    <span className="text-gray-400">Connection</span>
                    {keyStatus.exists ? (
                      <span className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-sm">
                        <FaCheck /> Configured
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-gray-500 bg-gray-800 px-3 py-1 rounded-full text-sm">
                        Not Configured
                      </span>
                    )}
                  </div>
                  
                  {keyStatus.exists && keyStatus.masked_key && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pb-4 border-b border-gray-800">
                      <span className="text-gray-400">Active Key</span>
                      <span className="text-gray-200 font-mono text-xs tracking-wider break-all text-left sm:text-right" title={keyStatus.masked_key}>
                        {keyStatus.masked_key}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                    <span className="text-gray-400">Encryption Layer</span>
                    <span className="text-blue-400">AES-256-GCM</span>
                  </div>

                  {keyStatus.exists && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Last Updated</span>
                      <span className="text-gray-300 text-sm">
                        {new Date(keyStatus.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl"
        >
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <FaLanguage className="text-green-400" /> Preferences
          </h1>
          <p className="text-gray-400 mb-8">
            Customize how AI generates content for you.
          </p>

          <div className="max-w-md">
            <form onSubmit={handleSaveLanguage} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t("Settings.Language")}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none"
                  disabled={submitting}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 py-3 rounded-lg font-medium transition-colors"
              >
                {submitting ? t("Errors.Loading...") : t("Buttons.Save")}
              </motion.button>
            </form>

            {langMessage.text && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-lg text-sm ${
                  langMessage.type === 'success' ? 'bg-green-900/20 text-green-400 border border-green-500/30' : 'bg-red-900/20 text-red-400 border border-red-500/30'
                }`}
              >
                {langMessage.text}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
