import DashboardStats from "../components/DashboardStats";
import ProfileStats from "../components/ProfileStats";
import StreakCard from "../components/StreakCard";
import StudyGalaxy from "../components/StudyGalaxy";
import PrivacySettings from "../components/PrivacySettings";

import { useState, useEffect } from "react";

function DashboardHome({
  selectedSubject,
  setSelectedSubject,
}) {
  const [showGalaxy, setShowGalaxy] = useState(true);
  const [showAiNotice, setShowAiNotice] = useState(true);

  useEffect(() => {
    // Load preference from local storage without forcing it to true
    const stored = localStorage.getItem("showGalaxyMap");
    if (stored === null) {
      localStorage.setItem("showGalaxyMap", "true");
      setShowGalaxy(true);
    } else {
      setShowGalaxy(stored !== "false");
    }

    const handleToggle = () => {
      setShowGalaxy(localStorage.getItem("showGalaxyMap") !== "false");
    };
    window.addEventListener("galaxyMapToggle", handleToggle);
    return () => window.removeEventListener("galaxyMapToggle", handleToggle);
  }, []);

  const handleHideGalaxy = () => {
    localStorage.setItem("showGalaxyMap", "false");
    setShowGalaxy(false);
    // Dispatch event so the privacy panel updates dynamically too
    window.dispatchEvent(new Event("galaxyMapToggle"));
  };

  return (
    <div className="space-y-8 lg:space-y-10 p-1">
      {/* AI Processing Notice */}
      {/* AI Processing Notice */}
      {showAiNotice && (
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-3 sm:p-4 flex items-start sm:items-center justify-between gap-3 text-blue-300 text-xs backdrop-blur-md">
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <span className="text-base shrink-0 mt-0.5 sm:mt-0">🤖</span>
            <p className="leading-relaxed line-clamp-3 sm:line-clamp-none">
              <strong>Generation Notice:</strong> Creating AI notes, mind maps, or revision packs takes about 15-30 seconds. The site is actively working on it in the background, please wait for generation.
            </p>
          </div>
          <button onClick={() => setShowAiNotice(false)} className="text-slate-400 hover:text-white font-bold text-xs p-1.5 shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center">
            ✖
          </button>
        </div>
      )}

      {/* Quota Warning Banner */}
      <div className="bg-amber-900/25 border border-amber-500/40 rounded-2xl p-3 sm:p-4 flex items-start gap-3 text-amber-200 text-xs backdrop-blur-md">
        <span className="text-lg shrink-0 mt-0.5">⚠️</span>
        <div className="space-y-1 min-w-0">
          <p className="font-bold text-amber-400 text-xs sm:text-sm">API Quota Disclaimer — Please Read</p>
          <p className="leading-relaxed text-amber-200/90">
            The free Google Gemini API key has a <strong>limited daily quota</strong>. Please <strong>do not click AI generation buttons more than 15 times per day</strong>. If content does not appear, your free quota may be exhausted for the day — it resets automatically the next day.
          </p>
          <p className="text-amber-300/70 text-xs mt-1 hidden sm:block">
            📌 <em>Nebula is not responsible for content not loading due to API quota limits. Manage your usage wisely.</em>
          </p>
        </div>
      </div>


      {/* Main Dashboard Layout Split: 2/3 Main Content, 1/3 Sidebar Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Area (2/3 width) */}
        <div className="lg:col-span-2">
          <DashboardStats />
        </div>

        {/* Sidebar widgets Area (1/3 width) - Balanced with side-by-side grids on tablet */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
            <ProfileStats />
            <StreakCard />
          </div>
          <PrivacySettings />
        </div>
      </div>

      {/* Galaxy Map Section */}
      {showGalaxy && (
        <div className="mb-6">
          <StudyGalaxy
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            onHide={handleHideGalaxy}
          />
        </div>
      )}
    </div>
  );
}

export default DashboardHome;