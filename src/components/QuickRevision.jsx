import { useEffect, useState } from "react";
import { generateRevisionPack } from "../lib/gemini";

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
      <div className="mt-4">
        Generating Revision Pack...
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
    <div className="bg-white rounded-3xl shadow-xl p-6 mt-6">

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold">
          ⚡ Quick Revision
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-500 hover:text-white transition-colors"
            title="Close"
          >
            ✖
          </button>
        )}
      </div>

      <h3 className="text-xl font-semibold mb-2">
        📖 Summary
      </h3>

      <p className="mb-6">
        {data.summary}
      </p>

      <h3 className="text-xl font-semibold mb-3">
        📚 Flashcards
      </h3>

      <div className="grid gap-3 mb-6">
        {data.flashcards?.map(
          (card, index) => (
            <div
              key={index}
              className="border rounded-2xl p-4"
            >
              <p className="font-semibold">
                Q:
                {" "}
                {card.question}
              </p>

              <p className="text-slate-600 mt-2">
                A:
                {" "}
                {card.answer}
              </p>
            </div>
          )
        )}
      </div>

      <h3 className="text-xl font-semibold mb-3">
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
              className="border rounded-2xl p-4"
            >
              <h4 className="font-bold">
                {branch.title}
              </h4>

              <ul className="list-disc ml-5 mt-2">
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
                      {point}
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