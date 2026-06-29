import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { generateFlashcards } from "../lib/gemini";
import MathRenderer from "./MathRenderer";

function Flashcards({ subject, topic, onClose }) {
  const [cards, setCards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("subject_name", subject)
      .eq("topic_name", topic);

    if (!error && data && data.length > 0) {
      setCards(data);
      return;
    }

    try {
      const aiCards = await generateFlashcards(subject, topic);
      const rows = aiCards.map((card) => ({
        subject_name: subject,
        topic_name: topic,
        question: card.question,
        answer: card.answer,
      }));

      await supabase.from("flashcards").insert(rows);
      setCards(rows);
    } catch (err) {
      console.error("Flashcard generation error:", err);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="mt-4 text-sm" style={{ color: "var(--arc-text-secondary)" }}>
        No Flashcards Found
      </div>
    );
  }

  // Helper to render point-wise flashcard answers
  const renderAnswer = (answerText) => {
    const lines = answerText
      .split("\n")
      .map((line) => line.replace(/^[•\-\*\s]+/, "").trim())
      .filter((line) => line.length > 0);

    if (lines.length > 1) {
      return (
        <ul className="list-disc pl-5 mt-3 space-y-1 text-sm leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
          {lines.map((line, idx) => (
            <li key={idx}><MathRenderer text={line} /></li>
          ))}
        </ul>
      );
    }

    return (
      <div className="mt-3 text-sm leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
        <MathRenderer text={answerText} />
      </div>
    );
  };

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
        <h3 className="font-bold text-lg" style={{ color: "var(--arc-text-hero)" }}>
          🃏 Flashcard Review
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

      <div
        className="p-5 rounded-xl border mb-4"
        style={{
          background: "rgba(0,0,0,0.25)",
          borderColor: "var(--arc-border)"
        }}
      >
        <div className="font-semibold text-base flex gap-1.5 items-start" style={{ color: "var(--arc-text-primary)" }}>
          <span className="shrink-0">Q:</span>
          <MathRenderer text={cards[current].question} />
        </div>

        {showAnswer && renderAnswer(cards[current].answer)}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="arc-btn-gold px-4 py-2 text-xs rounded-lg font-bold"
        >
          {showAnswer ? "Hide Answer" : "Show Answer"}
        </button>

        <button
          onClick={() => {
            setCurrent((prev) => (prev + 1) % cards.length);
            setShowAnswer(false);
          }}
          className="arc-btn-ghost px-4 py-2 text-xs rounded-lg font-bold"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}

export default Flashcards;