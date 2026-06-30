import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaTimes, FaExternalLinkAlt } from "react-icons/fa";

export default function SystemStatusBanner() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("supabase_status_dismissed");
    if (isDismissed) {
      setDismissed(true);
    }
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://status.supabase.com/api/v2/summary.json");
      if (!response.ok) throw new Error("Failed to fetch Supabase status");
      const data = await response.json();
      
      // Filter for active (unresolved) incidents
      const activeIncidents = (data.incidents || []).filter(
        (incident) => incident.status.toLowerCase() !== "resolved"
      );
      setIncidents(activeIncidents);
    } catch (error) {
      console.error("Failed to fetch Supabase status page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("supabase_status_dismissed", "true");
  };

  if (dismissed || loading || incidents.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
        animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        {incidents.map((incident) => {
          const latestUpdate = incident.incident_updates && incident.incident_updates[0];
          const updateTime = latestUpdate 
            ? new Date(latestUpdate.created_at).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short"
              })
            : "";

          return (
            <div
              key={incident.id}
              className="p-4 rounded-xl border flex items-start gap-4 backdrop-blur-md relative group transition-all duration-300"
              style={{
                background: "linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.08))",
                borderColor: "rgba(245, 158, 11, 0.3)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25), 0 0 10px rgba(245, 158, 11, 0.05)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.55)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0, 0, 0, 0.3), 0 0 15px rgba(245, 158, 11, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.3)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.25), 0 0 10px rgba(245, 158, 11, 0.05)";
              }}
            >
              <div className="flex-shrink-0 mt-0.5 p-2 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <FaExclamationTriangle className="text-base animate-pulse" />
              </div>

              <div className="flex-1 min-w-0 pr-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-amber-400 tracking-wide uppercase">
                    Supabase Outage Detected
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                    {incident.status}
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-slate-200 mt-1.5 leading-snug">
                  {incident.name}
                </h4>

                {latestUpdate && (
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium bg-black/20 p-2.5 rounded-lg border border-white/5">
                    {latestUpdate.body}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400 font-medium">
                  {updateTime && <span>Updated: {updateTime}</span>}
                  <a
                    href="https://status.supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors underline font-bold"
                  >
                    View Status Page <FaExternalLinkAlt className="text-[8px]" />
                  </a>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/10 hover:bg-black/30 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Dismiss Alert"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
