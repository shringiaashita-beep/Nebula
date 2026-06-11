import Leaderboard from "../components/Leaderboard";
import DailyQuests from "../components/DailyQuests";
import Achievements from "../components/Achievements";
import Analytics from "../components/Analytics";

function ProgressPage() {
  return (
    <>
      <Analytics />

      <Leaderboard />

      <DailyQuests />

      <Achievements />
    </>
  );
}

export default ProgressPage;