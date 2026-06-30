import { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { generateHardQuestions } from "../lib/gemini";

const LOADING_MESSAGES = [
  "Generating your personalized challenge...",
  "Analyzing the selected topic...",
  "Preparing 30 high-quality questions...",
  "Formulating challenging scenarios...",
  "Almost ready to start the quiz..."
];

function EliteChallenge({ subject, topic, onClose, onPass }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finished, setFinished] = useState(false);
  const [passed, setPassed] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, [subject, topic]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Validate session before query
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No active user session found.");
      }

      const { data, error: fetchError } = await supabase
        .from("question_bank")
        .select("*")
        .eq("subject_name", subject)
        .eq("topic_name", topic);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setQuestions(data);
        setLoading(false);
        return;
      }

      // Auto-generate and seed 30 questions into Supabase
      const seeded = await generateHardQuestions(subject, topic, 30);
      if (!seeded || !Array.isArray(seeded) || seeded.length === 0) {
        throw new Error("Failed to generate questions. Please check your AI API key and try again.");
      }

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

      const { error: insertError } = await supabase.from("question_bank").insert(rows);
      if (insertError) throw insertError;

      const { data: refetched, error: refetchError } = await supabase
        .from("question_bank")
        .select("*")
        .eq("subject_name", subject)
        .eq("topic_name", topic);

      if (refetchError) throw refetchError;

      setQuestions(refetched && refetched.length > 0 ? refetched : rows);
    } catch (err) {
      console.error("Error fetching/seeding challenge questions:", err);
      setError(err.message || "An error occurred while generating questions.");
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

  // 1. Loading View
  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col justify-center items-center p-6 bg-slate-950/95 backdrop-blur-md text-center">
        <div className="relative flex flex-col items-center justify-center space-y-5 max-w-sm p-8 rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          {/* Animated Spinners */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin [animation-direction:reverse]"></div>
          </div>
          
          <h3 className="arc-font-display text-xl font-bold arc-text-gradient animate-pulse mt-4">
            🚀 Preparing Challenge
          </h3>
          
          <p className="text-sm font-semibold text-slate-200 transition-opacity duration-300">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
          
          <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
            Generating high-quality educational challenges takes about 15-30 seconds.
          </p>

          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // 2. Error View
  if (error) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col justify-center items-center p-6 bg-slate-950/95 backdrop-blur-md text-center">
        <div className="max-w-md p-8 rounded-3xl border border-red-500/30 bg-red-950/20 space-y-6 shadow-2xl">
          <span className="text-4xl block">⚠️</span>
          <h3 className="font-bold text-xl text-red-400">Challenge Generation Failed</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchQuestions}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 text-sm rounded-xl transition-colors cursor-pointer active:scale-95"
            >
              Retry Generation
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/15 text-white font-bold px-5 py-2.5 text-sm rounded-xl transition-colors cursor-pointer active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State View
  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col justify-center items-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
        <div 
          className="w-full max-w-md p-8 rounded-3xl border text-center space-y-5 relative"
          style={{
            background: "var(--arc-bg-surface)",
            borderColor: "var(--arc-border)",
            color: "var(--arc-text-primary)"
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-slate-400 bg-white/5 border border-white/10 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
            title="Exit Challenge"
          >
            ✖
          </button>
          <div className="text-red-500 text-3xl">📭</div>
          <h3 className="font-bold text-lg text-white">No Questions Available</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No questions could be generated for this topic. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchQuestions}
              className="arc-btn-gold px-5 py-2 text-xs rounded-xl cursor-pointer"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="arc-btn-ghost px-5 py-2 text-xs rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Finished State View
  if (finished) {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col justify-center items-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
        <div 
          className="w-full max-w-xl p-6 md:p-8 rounded-3xl border space-y-6 relative"
          style={{
            background: "var(--arc-bg-surface)",
            borderColor: "var(--arc-border)",
            color: "var(--arc-text-primary)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-slate-400 bg-white/5 border border-white/10 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
            title="Exit Challenge"
          >
            ✖
          </button>
          
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

          <button
            onClick={onClose}
            className="arc-btn-gold px-5 py-2.5 text-sm rounded-xl font-bold w-full"
          >
            Back to Topics List
          </button>
        </div>
      </div>
    );
  }

  // 5. Active Quiz View
  const currentQuestion = questions[current];

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col justify-center items-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-2xl p-6 md:p-8 rounded-3xl border space-y-6 relative"
        style={{
          background: "var(--arc-bg-surface)",
          borderColor: "var(--arc-border)",
          color: "var(--arc-text-primary)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-slate-400 bg-white/5 border border-white/10 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
          title="Exit Challenge"
        >
          ✖
        </button>

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
            className="arc-btn-gold px-5 py-2.5 text-sm rounded-xl font-bold w-full sm:w-auto cursor-pointer"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}

export default EliteChallenge;
