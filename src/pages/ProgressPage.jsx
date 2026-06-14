import Leaderboard from "../components/Leaderboard";
import DailyQuests from "../components/DailyQuests";
import Achievements from "../components/Achievements";
import Analytics from "../components/Analytics";

function ProgressPage() {
  return (
    <div className="space-y-6">

      {/* Hero Section */}
      <div className="
        bg-gradient-to-r
        from-violet-600
        to-purple-700
        text-white
        p-8
        rounded-3xl
        shadow-2xl
      ">
        <h1 className="text-4xl font-black mb-2">
          🏆 Progress Command Center
        </h1>

        <p className="text-lg opacity-90">
          Track your growth, achievements,
          streaks and study performance.
        </p>
      </div>

      <Analytics />

      <div className="grid lg:grid-cols-2 gap-6">
        <DailyQuests />
        <Leaderboard />
      </div>

      <Achievements />
    </div>
  );
}

export default ProgressPage;