import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import supabase from "../lib/supabase";
import { generateMindMap } from "../lib/gemini";

function MindMap({ subject, topic, onClose }) {
  const [mindmap, setMindmap] = useState("Loading...");

  useEffect(() => {
    fetchMindMap();
  }, [subject, topic]);

  const fetchMindMap = async () => {
    const { data, error } = await supabase
      .from("topic_mindmaps")
      .select("*");

    if (error) {
      setMindmap("Error loading mind map");
      return;
    }

    const match = data?.find(
      (item) =>
        item.subject_name === subject &&
        item.topic_name === topic
    );

    if (match) {
      setMindmap(match.mindmap);
    } else {
      try {
        setMindmap("Generating Mind Map...");
        const aiMindMap = await generateMindMap(subject, topic);
        const mapText = typeof aiMindMap === "string" ? aiMindMap : JSON.stringify(aiMindMap, null, 2);

        await supabase
          .from("topic_mindmaps")
          .insert([
            {
              subject_name: subject,
              topic_name: topic,
              mindmap: mapText,
            }
          ]);

        setMindmap(mapText);
      } catch (err) {
        console.error(err);
        setMindmap("No mind map available for this topic.");
      }
    }
  };

  const COLORS = [
    { bg: "linear-gradient(135deg, #FF6B6B, #EE5253)", shadow: "rgba(238,82,83,0.3)" },
    { bg: "linear-gradient(135deg, #48DBFB, #0ABDE3)", shadow: "rgba(10,189,227,0.3)" },
    { bg: "linear-gradient(135deg, #1DD1A1, #10AC84)", shadow: "rgba(16,172,132,0.3)" },
    { bg: "linear-gradient(135deg, #FF9F43, #FECA57)", shadow: "rgba(255,159,67,0.3)" },
    { bg: "linear-gradient(135deg, #5F27CD, #341F97)", shadow: "rgba(95,39,205,0.3)" },
    { bg: "linear-gradient(135deg, #FF9FF3, #F368E0)", shadow: "rgba(243,104,224,0.3)" },
  ];

  // Helper to parse and render mindmap hierarchy beautifully
  const renderMindMapContent = () => {
    try {
      const parsed = JSON.parse(mindmap);
      if (parsed && parsed.branches) {
        return (
          <div className="flex flex-col items-center w-full py-8 overflow-x-hidden">
            {/* Main Central Node */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative z-10 px-8 py-5 rounded-3xl shadow-2xl text-center max-w-sm mb-12"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #AA8C2C)",
                boxShadow: "0 10px 30px rgba(212,175,55,0.4)",
                border: "2px solid rgba(255,255,255,0.2)"
              }}
            >
              <h2 className="text-2xl font-black text-white drop-shadow-md">
                {parsed.main_topic || topic}
              </h2>
            </motion.div>

            {/* Branches Container */}
            <div className="relative w-full flex flex-wrap justify-center gap-6 px-2">
              {/* Decorative connecting line behind everything */}
              <div className="absolute top-[-3rem] left-1/2 w-[2px] h-[3rem] bg-gradient-to-b from-[#D4AF37] to-transparent -translate-x-1/2 opacity-50 z-0"></div>

              {parsed.branches.map((branch, index) => {
                const colorObj = COLORS[index % COLORS.length];
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 * index, type: "spring" }}
                    className="relative z-10 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] rounded-3xl p-1"
                    style={{
                      background: colorObj.bg,
                      boxShadow: `0 10px 25px ${colorObj.shadow}`,
                    }}
                  >
                    {/* Inner Content Card (dark background) */}
                    <div className="bg-slate-950/95 h-full rounded-[22px] p-5 backdrop-blur-sm border border-white/10 flex flex-col">
                      <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm"
                          style={{ background: colorObj.bg }}
                        >
                          {index + 1}
                        </div>
                        <h4 className="font-bold text-lg text-white leading-tight">
                          {branch.title}
                        </h4>
                      </div>
                      
                      <ul className="space-y-3 flex-1">
                        {branch.points?.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2.5 text-sm text-slate-300">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colorObj.bg }}></span>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      }
    } catch (e) {
      // Fallback to text output if it's not a JSON structure
    }

    return (
      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
        {mindmap}
      </pre>
    );
  };

  if (mindmap === "Loading..." || mindmap === "Generating Mind Map...") {
    return (
      <div className="border p-8 rounded-2xl mt-3 bg-slate-900/40 border-slate-800 text-center space-y-4 shadow-xl backdrop-blur-sm animate-pulse">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-white">
          🧠 AI is designing your interactive Mind Map...
        </p>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Please wait. Organising topics and branches into a beautiful visual concept map takes about 15-30 seconds. The site is actively working on it!
        </p>
      </div>
    );
  }

  return (
    <div
      className="border p-6 rounded-2xl mt-3"
      style={{
        background: "var(--arc-bg-surface)",
        borderColor: "var(--arc-border)",
        color: "var(--arc-text-primary)"
      }}
    >
      <div className="flex justify-between items-center w-full mb-4">
        <h3 className="font-bold text-lg" style={{ color: "var(--arc-text-hero)" }}>
          🧠 Mind Map
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
            title="Close"
          >
            ✖
          </button>
        )}
      </div>

      {renderMindMapContent()}
    </div>
  );
}

export default MindMap;