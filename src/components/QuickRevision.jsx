import { useEffect, useState } from "react";
import { generateRevisionPack } from "../lib/gemini";
import MathRenderer from "./MathRenderer";

function QuickRevision({
  subject,
  topic,
  onClose
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRevision();
  }, []);

  const loadRevision = async () => {
    try {
      setLoading(true);

      const result = await generateRevisionPack(subject, topic);

      setData(result);
    } catch (err) {
      console.error("QuickRevision generation error:", err);
      setError("Failed to generate revision pack.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border p-8 rounded-2xl mt-4 bg-slate-900/40 border-slate-800 text-center space-y-4 shadow-xl backdrop-blur-sm animate-pulse">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-white">
          ⚡ AI is assembling your Quick Revision pack...
        </p>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Please wait. Generating summaries, key flashcards, and concept maps takes about 15-30 seconds. The site is actively working on it!
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 mt-4">
        {error}
      </div>
    );
  }

  return (
    <div
      className="border p-6 rounded-2xl mt-4"
      style={{
        background: "var(--arc-bg-surface)",
        borderColor: "var(--arc-border)",
        color: "var(--arc-text-primary)"
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: "var(--arc-text-hero)" }}>
          ⚡ Quick Revision
        </h2>
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

      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--arc-gold-400)" }}>
        📖 Summary
      </h3>

      <div className="mb-6 text-sm leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
        <MathRenderer text={data.summary} />
      </div>

      <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--arc-gold-400)" }}>
        📚 Flashcards
      </h3>

      <div className="grid gap-3 mb-6">
        {data.flashcards?.map(
          (card, index) => (
            <div
              key={index}
              className="border rounded-xl p-4 bg-black/25"
              style={{ borderColor: "var(--arc-border)" }}
            >
              <div className="font-semibold text-sm flex gap-1.5 items-start" style={{ color: "var(--arc-text-primary)" }}>
                <span className="shrink-0">Q:</span>
                <MathRenderer text={card.question} />
              </div>

              <div className="text-sm mt-2 flex gap-1.5 items-start" style={{ color: "var(--arc-text-secondary)" }}>
                <span className="shrink-0 font-semibold text-slate-500">A:</span>
                <MathRenderer text={card.answer} />
              </div>
            </div>
          )
        )}
      </div>

      <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--arc-gold-400)" }}>
        🧠 Mind Map
      </h3>

      <div className="space-y-4">
        {data.mindmap?.branches?.map(
          (
            branch,
            index
          ) => (
            <div
              key={index}
              className="border rounded-xl p-4 bg-black/25"
              style={{ borderColor: "var(--arc-border)" }}
            >
              <h4 className="font-bold text-sm mb-2" style={{ color: "var(--arc-text-primary)" }}>
                <MathRenderer text={branch.title} />
              </h4>

              <ul className="list-disc ml-5 space-y-1 text-sm" style={{ color: "var(--arc-text-secondary)" }}>
                {branch.points?.map(
                  (
                    point,
                    pointIndex
                  ) => (
                    <li
                      key={
                        pointIndex
                      }
                    >
                      <MathRenderer text={point} />
                    </li>
                  )
                )}
              </ul>
            </div>
          )
        )}
      </div>

    </div>
  );
}

export default QuickRevision;           