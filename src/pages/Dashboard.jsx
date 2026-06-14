import { useNavigate } from "react-router-dom";
import {
  useEffect,
  useState,
} from "react";
import supabase from "../lib/supabase";
import ThemeToggle from "../components/ThemeToggle";

import DashboardHome from "./DashboardHome";
import SubjectsPage from "./SubjectsPage";
import PlannerPage from "./PlannerPage";
import ProgressPage from "./ProgressPage";

function Dashboard() {
  const [activePage, setActivePage] =
  useState("dashboard");
  const [
  selectedSubject,
  setSelectedSubject,
] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  useEffect(() => {
  createProfile();
  createStreak();
}, []);
const createProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!data) {
   await supabase
  .from("profiles")
  .insert([
    {
      id: user.id,
      username:
        user.email.split("@")[0],
      xp: 0,
      level: 1,
    },
  ]);
  }
};

const createStreak = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!data) {
    await supabase
      .from("user_streaks")
      .insert([
        {
          user_id: user.id,
          streak_count: 0,
        },
      ]);
  }
};

return (
    <div
  className="min-h-screen flex"
  style={{
    backgroundColor: "var(--color-primary-50)",
  }}
>
      {/* Sidebar */}
      <div className="
    w-72
    bg-slate-950
    text-white
    shadow-2xl
    p-6
    sticky
    top-0
    h-screen
    border-r
    border-primary-900
    ">
        <div className="mb-10">
  <h1 className="text-3xl font-black text-primary-400">
    NEBULA
  </h1>

  <p className="text-slate-500 text-sm">
    Study Command Center
  </p>
</div>

        <ul className="space-y-4">
          <li>
  <button
    onClick={() =>
      setActivePage(
        "dashboard"
      )
    }
   className={`
w-full
text-left
px-4
py-3
rounded-xl
transition-all
duration-300

${
  activePage ===
  "dashboard"
    ? "bg-primary-500 text-white shadow-lg"
    : "hover:bg-slate-800"
}
`}
    aria-current={activePage === 'dashboard' ? 'page' : undefined}
    style={activePage === 'dashboard' ? { backgroundColor: 'var(--sidebar-accent)' } : {}}
  >
    Dashboard
  </button>
</li>

        <li>
  <button
    onClick={() => setActivePage("subjects")}
    className={`
w-full
text-left
px-4
py-3
rounded-xl
transition-all
duration-300

${
  activePage ===
  "subjects"
    ? "bg-primary-500 text-white shadow-lg"
    : "hover:bg-slate-800"
}
`}
    aria-current={activePage === 'subjects' ? 'page' : undefined}
    style={activePage === 'subjects' ? { backgroundColor: 'var(--sidebar-accent)' } : {}}
  >
    Subjects
  </button>
</li>

         <li>
  <button
    onClick={() =>
      setActivePage(
        "planner"
      )
    }
    className={`
w-full
text-left
px-4
py-3
rounded-xl
transition-all
duration-300

${
  activePage ===
  "planner"
    ? "bg-primary-500 text-white shadow-lg"
    : "hover:bg-slate-800"
}
`}
    aria-current={activePage === 'planner' ? 'page' : undefined}
    style={activePage === 'planner' ? { backgroundColor: 'var(--sidebar-accent)' } : {}}
  >
    Planner
  </button>
</li>
<li>
  <button
    onClick={() =>
      setActivePage(
        "progress"
      )
    }
    className={`
w-full
text-left
px-4
py-3
rounded-xl
transition-all
duration-300

${
  activePage ===
  "progress"
    ? "bg-primary-500 text-white shadow-lg"
    : "hover:bg-slate-800"
}
`}
    aria-current={activePage === 'progress' ? 'page' : undefined}
    style={activePage === 'progress' ? { backgroundColor: 'var(--sidebar-accent)' } : {}}
  >
    Progress
  </button>
</li>
<li className="pt-6 overflow-hidden">
  <ThemeToggle />
</li>

          <li className="pt-4">
            <button
              onClick={handleLogout}
              className="
  w-full
  text-left
  px-4
  py-3
  rounded-xl
  hover:bg-slate-800
  transition-all
  duration-300
    " 
            >
              Logout
            </button>
          </li>
        </ul>
      </div>

    <div className="flex-1 p-8">
  <h1 className="text-4xl font-bold mb-8">
     Mission Control 🚀
  </h1>

  {activePage === "dashboard" && (
    <DashboardHome
      selectedSubject={selectedSubject}
      setSelectedSubject={setSelectedSubject}
    />
  )}

  {activePage === "subjects" && (
    <SubjectsPage
      selectedSubject={selectedSubject}
    />
  )}

  {activePage === "planner" && (
    <PlannerPage />
  )}

  {activePage === "progress" && (
    <ProgressPage />
  )}    
              
</div>  
          
    </div>  
);
}
export default Dashboard;