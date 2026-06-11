import DashboardStats from "../components/DashboardStats";
import ProfileStats from "../components/ProfileStats";
import StreakCard from "../components/StreakCard";
import StudyGalaxy from "../components/StudyGalaxy";
import GeminiTest from "../components/GeminiTest";
function DashboardHome({
  selectedSubject,
  setSelectedSubject,
}) {
  return (
  <>
  <div className="grid lg:grid-cols-3 gap-6 mb-6">
    <ProfileStats />
    <StreakCard />
    <DashboardStats />
  </div>

  <div className="mb-6">
    <StudyGalaxy
      selectedSubject={selectedSubject}
      setSelectedSubject={setSelectedSubject}
    />
  </div>
  <GeminiTest />
</>
  );
}

export default DashboardHome;