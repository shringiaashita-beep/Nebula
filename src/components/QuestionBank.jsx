import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

function QuestionBank() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  const [questions, setQuestions] = useState([]);
  const [infoMsg, setInfoMsg] = useState("");

  const showInfo = (msg) => {
    setInfoMsg(msg);
    setTimeout(() => setInfoMsg(""), 3000);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data } = await supabase
      .from("question_bank")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    setQuestions(data || []);
  };

  const addQuestion = async () => {
    if (!subject.trim() || !topic.trim() || !question.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim() || !correctAnswer.trim()) {
      showInfo("⚠️ Please fill all fields before adding a question.");
      return;
    }

    const { error } = await supabase
      .from("question_bank")
      .insert([
        {
          subject_name: subject,
          topic_name: topic,
          question,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: correctAnswer,
        },
      ]);

    if (error) {
      showInfo("⚠️ " + error.message);
      return;
    }

    showInfo("✓ Question Added successfully!");

    setSubject("");
    setTopic("");
    setQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("");

    fetchQuestions();
  };

  return (
    <div className="arc-card p-6 space-y-6 mt-8">
      {/* Toast message */}
      {infoMsg && (
        <div className="arc-alert-success">
          <span>✓</span><span>{infoMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          🧠 Question Bank
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Create and manage practice questions
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Questions", value: questions.length, icon: "📚" },
          { label: "Practice Mode",   value: "Active",         icon: "📝" },
          { label: "Creator Tier",    value: "Standard",       icon: "🎯" },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="arc-card-elevated px-4 py-3 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--arc-text-muted)" }}>{label}</span>
              <span style={{ color: "var(--arc-gold-400)" }}>{icon}</span>
            </div>
            <span className="text-xl font-black mt-1" style={{ color: "var(--arc-text-hero)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Question Form */}
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Subject (e.g. Physics)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="arc-input text-sm"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />

          <input
            placeholder="Topic (e.g. Thermodynamics)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="arc-input text-sm"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
        </div>

        <textarea
          placeholder="Question text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows="3"
          className="arc-input text-sm w-full"
          style={{ background: "rgba(0,0,0,0.4)" }}
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Option A"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            className="arc-input text-sm"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />

          <input
            placeholder="Option B"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            className="arc-input text-sm"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />

          <input
            placeholder="Option C"
            value={optionC}
            onChange={(e) => setOptionC(e.target.value)}
            className="arc-input text-sm"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />

          <input
            placeholder="Option D"
            value={optionD}
            onChange={(e) => setOptionD(e.target.value)}
            className="arc-input text-sm"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
        </div>

        <input
          placeholder="Correct Answer (e.g. A, B, C, or D)"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          className="arc-input text-sm"
          style={{ background: "rgba(0,0,0,0.4)" }}
        />

        <button
          onClick={addQuestion}
          className="arc-btn-gold w-full py-3 text-sm font-bold rounded-xl"
        >
          Add Question
        </button>
      </div>
    </div>
  );
}

export default QuestionBank;