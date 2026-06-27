import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function PrivacySettings() {
  const [profile, setProfile] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [shareStats, setShareStats] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Email & Password privacy states
  const [userEmail, setUserEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const [passFormOpen, setPassFormOpen] = useState(false);

  // Interface preferences
  const [showGalaxy, setShowGalaxy] = useState(() => {
    return localStorage.getItem("showGalaxyMap") !== "false";
  });

  useEffect(() => {
    fetchPrivacyPreferences();
    
    const handleToggle = () => {
      setShowGalaxy(localStorage.getItem("showGalaxyMap") !== "false");
    };
    window.addEventListener("galaxyMapToggle", handleToggle);
    return () => window.removeEventListener("galaxyMapToggle", handleToggle);
  }, []);

  const fetchPrivacyPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserEmail(user.email || "");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
      setIsPublic(data.privacy_public_profile ?? true);
      setShareStats(data.privacy_share_leaderboard ?? true);
    }
  };

  const savePreferences = async (updatedPublic, updatedShare) => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          privacy_public_profile: updatedPublic,
          privacy_share_leaderboard: updatedShare
        })
        .eq("id", user.id);

      if (error) throw error;
      setSuccessMsg("Privacy settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error saving privacy settings:", err);
      setErrorMsg("Failed to save privacy settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = () => {
    const newVal = !isPublic;
    setIsPublic(newVal);
    savePreferences(newVal, shareStats);
  };

  const handleToggleShare = () => {
    const newVal = !shareStats;
    setShareStats(newVal);
    savePreferences(isPublic, newVal);
  };

  const handleToggleGalaxy = () => {
    const newVal = !showGalaxy;
    setShowGalaxy(newVal);
    localStorage.setItem("showGalaxyMap", newVal ? "true" : "false");
    window.dispatchEvent(new Event("galaxyMapToggle"));
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setSuccessMsg("Verification link sent to new email!");
      setNewEmail("");
      setEmailFormOpen(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update email.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccessMsg("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setPassFormOpen(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearProgress = () => {
    if (window.confirm("Are you sure you want to clear your local practice attempts and scores? This action is permanent.")) {
      localStorage.removeItem("explorerAnswers");
      localStorage.removeItem("explorerCorrectCount");
      localStorage.removeItem("explorerAttemptedCount");
      setSuccessMsg("Practice progress cleared successfully!");
      setTimeout(() => {
        setSuccessMsg("");
        window.location.reload();
      }, 1500);
    }
  };

  const maskEmail = (emailStr) => {
    if (!emailStr) return "";
    const [name, domain] = emailStr.split("@");
    if (name.length <= 3) return `${name[0]}***@${domain}`;
    return `${name.substring(0, 3)}***@${domain}`;
  };

  return (
    <div
      className="arc-card p-6 flex flex-col gap-4"
      style={{ borderTop: "2px solid var(--arc-gold-500)" }}
    >
      <div>
        <p className="text-xs font-bold tracking-widest uppercase mb-1"
          style={{ color: "var(--arc-text-muted)" }}>
          SECURITY & TRUST
        </p>
        <h2 className="arc-font-display text-xl font-bold arc-text-gradient">
          🔒 Privacy Control
        </h2>
      </div>

      <div className="space-y-4">
        {/* Toggle Public Profile */}
        <div className="flex items-center justify-between text-xs py-1">
          <div>
            <p className="font-semibold text-white">Public Profile</p>
            <p style={{ color: "var(--arc-text-secondary)" }}>Allow other students to find you</p>
          </div>
          <button
            onClick={handleTogglePublic}
            disabled={loading}
            className={`w-10 h-5 rounded-full p-0.5 transition-all duration-200 ${
              isPublic ? "bg-amber-500" : "bg-slate-800"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-all duration-200 transform ${
                isPublic ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle Share Leaderboard Stats */}
        <div className="flex items-center justify-between text-xs py-1">
          <div>
            <p className="font-semibold text-white">Share Study Stats</p>
            <p style={{ color: "var(--arc-text-secondary)" }}>Participate in global leaderboards</p>
          </div>
          <button
            onClick={handleToggleShare}
            disabled={loading}
            className={`w-10 h-5 rounded-full p-0.5 transition-all duration-200 ${
              shareStats ? "bg-amber-500" : "bg-slate-800"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-all duration-200 transform ${
                shareStats ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Toggle Show Galaxy Map */}
        <div className="flex items-center justify-between text-xs py-1">
          <div>
            <p className="font-semibold text-white">Show Galaxy Map</p>
            <p style={{ color: "var(--arc-text-secondary)" }}>Display the learning universe map</p>
          </div>
          <button
            onClick={handleToggleGalaxy}
            className={`w-10 h-5 rounded-full p-0.5 transition-all duration-200 ${
              showGalaxy ? "bg-amber-500" : "bg-slate-800"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-all duration-200 transform ${
                showGalaxy ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <hr style={{ borderColor: "var(--arc-border-subtle)" }} />

        {/* Credentials Security Section */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--arc-text-muted)" }}>
            Credentials Security
          </p>
          
          {/* Masked Email */}
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-white block">Email Address</span>
                <span style={{ color: "var(--arc-text-secondary)" }}>{maskEmail(userEmail)}</span>
              </div>
              <button
                onClick={() => setEmailFormOpen(!emailFormOpen)}
                className="arc-btn-ghost px-2.5 py-1 text-[10px] rounded-lg"
              >
                {emailFormOpen ? "Cancel" : "Change"}
              </button>
            </div>
            {emailFormOpen && (
              <form onSubmit={handleUpdateEmail} className="flex flex-col gap-2 mt-1">
                <input
                  type="email"
                  placeholder="New Email Address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="arc-input text-xs"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                  required
                />
                <button type="submit" disabled={loading} className="arc-btn-gold text-[10px] py-1.5 rounded-lg w-full">
                  {loading ? "Updating..." : "Send Verification Link"}
                </button>
              </form>
            )}
          </div>

          {/* Account Password */}
          <div className="flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-white block">Account Password</span>
                <span style={{ color: "var(--arc-text-secondary)" }}>••••••••••••</span>
              </div>
              <button
                onClick={() => setPassFormOpen(!passFormOpen)}
                className="arc-btn-ghost px-2.5 py-1 text-[10px] rounded-lg"
              >
                {passFormOpen ? "Cancel" : "Modify"}
              </button>
            </div>
            {passFormOpen && (
              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-2 mt-1">
                <input
                  type="password"
                  placeholder="New Password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="arc-input text-xs"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                  minLength={6}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="arc-input text-xs"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                  required
                />
                <button type="submit" disabled={loading} className="arc-btn-gold text-[10px] py-1.5 rounded-lg w-full">
                  {loading ? "Updating..." : "Save New Password"}
                </button>
              </form>
            )}
          </div>
        </div>

        {successMsg && (
          <p className="text-[10px] text-green-400 font-semibold animate-pulse mt-1">
            ✓ {successMsg}
          </p>
        )}

        {errorMsg && (
          <p className="text-[10px] text-red-400 font-semibold mt-1">
            ⚠ {errorMsg}
          </p>
        )}

        <hr style={{ borderColor: "var(--arc-border-subtle)" }} />

        {/* Data Cleansing Options */}
        <div className="space-y-2">
          <button
            onClick={handleClearProgress}
            className="arc-btn-ghost w-full py-2 rounded-xl text-xs font-semibold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/35"
          >
            🗑 Clear Practice History
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacySettings;
