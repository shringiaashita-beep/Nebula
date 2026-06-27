import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import supabase from "../lib/supabase";

function StudyGalaxy({ setSelectedSubject, selectedSubject, onHide }) {
  const [subjectTopics, setSubjectTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate 60 randomized stars for celestial background
    const starList = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
    }));
    setStars(starList);
    fetchSubjects();
  }, []);

  const fetchTopicsForSubject = async (subjectName) => {
    const { data } = await supabase
      .from("topics").select("*").eq("subject_name", subjectName);
    setSubjectTopics(data || []);
  };

  const fetchSubjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("subjects").select("*").eq("user_id", user.id);
    console.log(data);
    setSubjects(data || []);
  };

  // Dynamic circular orbit calculations — logic untouched
  const getSubjectPosition = (index, total) => {
    if (total === 0) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const angle = (index * 2 * Math.PI) / total;
    const orbitRadius = index % 2 === 0 ? 190 : 270;
    const leftPercent = 50 + (orbitRadius * Math.cos(angle)) / 6.5;
    const topPercent  = 50 + (orbitRadius * Math.sin(angle)) / 8;
    return { left: `${leftPercent}%`, top: `${topPercent}%`, transform: "translate(-50%, -50%)" };
  };

  return (
    <div
      className="relative rounded-2xl h-[700px] overflow-hidden"
      style={{
        background: "#040510",
        border: "1px solid var(--arc-border)",
      }}
    >
      {/* Star Particles */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse pointer-events-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: Math.random() * 0.7 + 0.3,
            animationDuration: `${star.duration}s`,
            boxShadow: star.size > 1.5 ? "0 0 6px rgba(255,255,255,0.7)" : "none",
          }}
        />
      ))}

      {/* Ambient centre glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 60%)" }}
      />

      {/* Orbit Rings with slow rotation */}
      <div className="absolute left-1/2 top-1/2 w-[320px] h-[320px] rounded-full animate-orbit-1"
        style={{ border: "1px solid rgba(212,175,55,0.12)" }} />
      <div className="absolute left-1/2 top-1/2 w-[520px] h-[520px] rounded-full animate-orbit-2"
        style={{ border: "1px solid rgba(212,175,55,0.06)" }} />

      {/* Center Brain */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="w-36 h-36 rounded-full flex items-center justify-center text-5xl"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(170,124,17,0.1) 60%, transparent 100%)",
            border: "1px solid rgba(212,175,55,0.3)",
            boxShadow: "0 0 60px rgba(212,175,55,0.25)",
          }}
        >
          🧠
        </div>
      </motion.div>

      {/* Dynamic Subject Nodes */}
      {subjects.map((subject, index) => {
        const pos = getSubjectPosition(index, subjects.length);
        return (
          <motion.div
            key={subject.id}
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4 + index, repeat: Infinity }}
            className="absolute"
            style={pos}
          >
            <div
              onClick={() => {
                setSelectedSubject(subject.name);
                fetchTopicsForSubject(subject.name);
              }}
              className="w-44 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--arc-bg-elevated)",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: "14px",
                padding: "1rem",
                boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = "1px solid rgba(212,175,55,0.5)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4), 0 0 16px rgba(212,175,55,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = "1px solid rgba(212,175,55,0.2)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(212,175,55,0.08)";
              }}
            >
              <h3 className="font-bold text-sm" style={{ color: "var(--arc-text-primary)" }}>
                {subject.name}
              </h3>
              <p className="text-xs mt-1" style={{ color: "var(--arc-gold-400)" }}>
                Continue →
              </p>
            </div>
          </motion.div>
        );
      })}

      {/* Title */}
      <div className="absolute top-6 left-6">
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          Study Galaxy
        </h2>
        <p className="text-xs mt-1" style={{ color: "var(--arc-text-muted)" }}>
          Your learning universe
        </p>
      </div>

      {/* Hide button overlay */}
      {onHide && (
        <button
          onClick={onHide}
          title="Hide Galaxy Map"
          className="absolute top-6 right-6 arc-btn-ghost px-3 py-1.5 text-xs rounded-lg flex items-center justify-center cursor-pointer z-10"
        >
          ✕ Hide Map / छिपाएं
        </button>
      )}

      {/* Topics panel */}
      {selectedSubject && (
        <div
          className="absolute right-5 top-20 w-72 max-h-[580px] flex flex-col"
          style={{
            background: "var(--arc-bg-elevated)",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: "16px",
            boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 24px rgba(212,175,55,0.08)",
          }}
        >
          <div className="px-5 py-4 flex items-start justify-between" style={{ borderBottom: "1px solid var(--arc-border)" }}>
            <div>
              <h3 className="arc-font-display text-lg font-bold arc-text-gold capitalize">
                {selectedSubject}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--arc-text-muted)" }}>
                {subjectTopics.length} Topics
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedSubject(null);
                setSubjectTopics([]);
              }}
              title="Close Panel"
              className="text-slate-400 hover:text-amber-500 transition-all text-xs font-bold cursor-pointer p-1"
            >
              ✕ Close / बंद करें
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {subjectTopics.map((topic) => (
              <div
                key={topic.id}
                className="px-4 py-2.5 rounded-xl text-sm"
                style={{
                  background: "rgba(212,175,55,0.05)",
                  border: "1px solid var(--arc-border)",
                  color: "var(--arc-text-primary)",
                }}
              >
                {topic.topic_name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudyGalaxy;