import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { generateHardQuestions } from "../lib/gemini";

function EliteChallenge({ subject, topic, onPass }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("question_bank")
        .select("*")
        .eq("subject_name", subject)
        .eq("topic_name", topic);

      if (error) throw error;

      if (data && data.length > 0) {
        setQuestions(data);
        setLoading(false);
        return;
      }

      // Auto-generate and seed 30 questions into Supabase
      const seeded = await generateHardQuestions(subject, topic, 30);
      const rows = seeded.map((q) => ({
        subject_name: subject,
        topic_name: topic,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        difficulty: "hard"
      }));

      await supabase.from("question_bank").insert(rows);

      const { data: refetched } = await supabase
        .from("question_bank")
        .select("*")
        .eq("subject_name", subject)
        .eq("topic_name", topic);

      setQuestions(refetched && refetched.length > 0 ? refetched : rows);
    } catch (err) {
      console.error("Error fetching/seeding challenge questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = (option) => {
    if (showAnswer) return;
    setSelectedAnswer(option);
    setShowAnswer(true);
    let newScore = score;

    if (option === questions[current].correct_answer) {
      newScore++;
      setScore(newScore);
    }

    if (current === questions.length - 1) {
      const passMarks = Math.ceil(questions.length * 0.6);
      setFinished(true);
      if (newScore >= passMarks) {
        setPassed(true);
        if (onPass) onPass();
      }
    }
  };

  if (loading) {
    return (
      <div className="mt-4 text-sm" style={{ color: "var(--arc-text-secondary)" }}>
        Loading Challenge Questions...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mt-4 text-sm text-red-500 font-bold">
        No questions found for this topic.
      </div>
    );
  }

  if (finished) {
    return (
      <div
        className="mt-4 p-6 rounded-2xl border space-y-6"
        style={{
          background: "var(--arc-bg-surface)",
          borderColor: "var(--arc-border)",
          color: "var(--arc-text-primary)"
        }}
      >
        <h3 className="arc-font-display text-2xl font-bold arc-text-gradient">
          🏆 Challenge Complete
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-xl border flex flex-col items-center justify-center"
            style={{
              background: "rgba(212,175,55,0.06)",
              borderColor: "rgba(212,175,55,0.2)"
            }}
          >
            <span className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: "var(--arc-text-muted)" }}>
              Final Score
            </span>
            <span className="text-3xl font-black" style={{ color: "var(--arc-gold-400)" }}>
              ⭐ {score}
            </span>
          </div>

          <div
            className="p-4 rounded-xl border flex flex-col items-center justify-center"
            style={{
              background: "rgba(59,130,246,0.06)",
              borderColor: "rgba(59,130,246,0.2)"
            }}
          >
            <span className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: "var(--arc-text-muted)" }}>
              Total Questions
            </span>
            <span className="text-3xl font-black" style={{ color: "#60a5fa" }}>
              {questions.length}
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-xl font-bold text-center border"
          style={{
            background: passed ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
            borderColor: passed ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)",
            color: passed ? "#34d399" : "#f87171"
          }}
        >
          {passed ? "✅ PASSED (TOPIC MASTERED)" : "❌ FAILED (TRY AGAIN)"}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[current];

  return (
    <div
      className="p-6 rounded-2xl mt-4 border space-y-6"
      style={{
        background: "var(--arc-bg-surface)",
        borderColor: "var(--arc-border)",
        color: "var(--arc-text-primary)"
      }}
    >
      <h3 className="arc-font-display text-2xl font-bold arc-text-gradient">
        ⚔️ Elite Challenge
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div
          className="p-3 rounded-xl border flex justify-between items-center"
          style={{
            background: "rgba(212,175,55,0.06)",
            borderColor: "rgba(212,175,55,0.2)",
            color: "var(--arc-gold-400)"
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider">Score</span>
          <span className="font-extrabold text-lg">⭐ {score}</span>
        </div>

        <div
          className="p-3 rounded-xl border flex justify-between items-center"
          style={{
            background: "rgba(59,130,246,0.06)",
            borderColor: "rgba(59,130,246,0.2)",
            color: "#60a5fa"
          }}
        >
          <span className="text-xs font-bold uppercase tracking-wider">Progress</span>
          <span className="font-extrabold text-lg">
            {current + 1} / {questions.length}
          </span>
        </div>
      </div>

      <div
        className="p-5 rounded-xl border"
        style={{
          background: "rgba(0,0,0,0.25)",
          borderColor: "var(--arc-border)"
        }}
      >
        <p className="font-bold text-base leading-relaxed" style={{ color: "var(--arc-text-primary)" }}>
          {currentQuestion.question}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {[
          currentQuestion.option_a,
          currentQuestion.option_b,
          currentQuestion.option_c,
          currentQuestion.option_d,
        ].map((option) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correct_answer;

          let btnBg = "rgba(255, 255, 255, 0.02)";
          let btnBorder = "var(--arc-border)";
          let btnText = "var(--arc-text-primary)";

          if (showAnswer) {
            if (isCorrect) {
              btnBg = "rgba(16, 185, 129, 0.15)";
              btnBorder = "rgba(16, 185, 129, 0.5)";
              btnText = "#34d399";
            } else if (isSelected) {
              btnBg = "rgba(239, 68, 68, 0.15)";
              btnBorder = "rgba(239, 68, 68, 0.5)";
              btnText = "#f87171";
            } else {
              btnBg = "rgba(255, 255, 255, 0.01)";
              btnBorder = "var(--arc-border)";
              btnText = "var(--arc-text-muted)";
            }
          }

          return (
            <button
              key={option}
              onClick={() => answerQuestion(option)}
              disabled={showAnswer}
              className="p-4 rounded-xl text-left transition-all duration-200 border text-sm font-medium hover:bg-white/5 active:scale-[0.99] cursor-pointer"
              style={{
                background: btnBg,
                borderColor: btnBorder,
                color: btnText
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showAnswer && (
        <div className="space-y-2 mt-4">
          <div
            className="p-3 rounded-xl border text-sm font-semibold"
            style={{
              background: "rgba(0,0,0,0.2)",
              borderColor: "var(--arc-border)"
            }}
          >
            <span style={{ color: "var(--arc-text-muted)" }}>Your Answer:</span>{" "}
            <span style={{ color: selectedAnswer === currentQuestion.correct_answer ? "#34d399" : "#f87171" }}>
              {selectedAnswer}
            </span>
          </div>

          <div
            className="p-3 rounded-xl border text-sm font-semibold"
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              borderColor: "rgba(16, 185, 129, 0.25)",
              color: "#34d399"
            }}
          >
            <span>Correct Answer:</span> {currentQuestion.correct_answer}
          </div>
        </div>
      )}

      {showAnswer && (
        <button
          onClick={() => {
            setShowAnswer(false);
            setSelectedAnswer("");
            if (current < questions.length - 1) {
              setCurrent(current + 1);
            }
          }}
          className="arc-btn-gold px-5 py-2.5 text-sm rounded-xl font-bold w-full sm:w-auto"
        >
          Next Question →
        </button>
      )}
    </div>
  );
}

export default EliteChallenge;
