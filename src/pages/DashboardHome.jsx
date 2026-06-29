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
      {showAiNotice && (
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-blue-300 text-xs sm:text-sm backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg">🤖</span>
            <p className="leading-relaxed">
              <strong>Generation Notice:</strong> Creating AI notes, mind maps, or revision packs takes about 15-30 seconds. The site is actively working on it in the background, please wait for generation.
            </p>
          </div>
          <button onClick={() => setShowAiNotice(false)} className="text-slate-400 hover:text-white font-bold text-xs p-1 shrink-0">
            ✖
          </button>
        </div>
      )}

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