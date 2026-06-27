import { useState, useEffect, useRef } from "react";
import { generatePYQQuiz, askTutor } from "../lib/gemini";
import supabase from "../lib/supabase";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import MathRenderer from "./MathRenderer";

function PYQQuiz({ exam, subject }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  // AI Tutor state
  const [messages, setMessages] = useState([]);
  const [tutorQuery, setTutorQuery] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadQuestions();
  }, [exam, subject]);

  useEffect(() => {
    if (questions.length > 0) {
      setMessages([
        {
          sender: "tutor",
          text: `Hello! I am your Nebula AI Tutor. Need a hint or step-by-step explanation for Question #${questions[currentQuestion]?.question_no || (currentQuestion + 1)}? Ask me anything below.`
        }
      ]);
    }
  }, [currentQuestion, questions]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      console.log("Exam Prop:", exam, "Subject Prop:", subject);
      
      let query = supabase
        .from("pyq_questions")
        .select("*")
        .eq("exam", exam);
        
      if (subject) {
        query = query.eq("subject", subject);
      }

      let { data, error } = await query.order("question_no");

      if (error) {
        console.log(error);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No questions found in Supabase for:", exam, "subject:", subject);
        setQuestions([]);
        setLoading(false);
        return;
      }

      const formattedQuestions = (data || []).map((q) => ({
        id: q.id,
        question_no: q.question_no,
        question: q.question,
        options: [
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
        ],
        correctAnswer:
          q["option_" + q.correct_answer.toLowerCase()],
        explanation: "",
      }));

      console.log("Questions:", formattedQuestions);
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error("PYQ ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTutorQuery = async (e) => {
    e.preventDefault();
    if (!tutorQuery.trim() || chatLoading) return;

    const userMessage = tutorQuery.trim();
    setTutorQuery("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setChatLoading(true);

    try {
      const activeQuestion = questions[currentQuestion];
      const contextPrompt = `
Context Question: "${activeQuestion?.question}"
Options:
- A: ${activeQuestion?.options[0]}
- B: ${activeQuestion?.options[1]}
- C: ${activeQuestion?.options[2]}
- D: ${activeQuestion?.options[3]}
Correct Answer: ${activeQuestion?.correctAnswer}

Student Query: ${userMessage}
`;

      const responseText = await askTutor(exam, "PYQ Support", contextPrompt);
      setMessages((prev) => [...prev, { sender: "tutor", text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: "tutor", text: "Sorry, I couldn't reach the AI module. Please try again." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const score = questions.reduce((total, question) => {
    return answers[question.id] === question.correctAnswer ? total + 1 : total;
  }, 0);

  const percentage =
    questions.length > 0 ? ((score / questions.length) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="arc-card p-8 text-center space-y-3">
        <div className="animate-pulse text-lg font-bold" style={{ color: "var(--arc-gold-400)" }}>
          Syncing with Nebula Command Center...
        </div>
        <p className="text-xs" style={{ color: "var(--arc-text-secondary)" }}>Preparing and loading PYQ Workspace...</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="arc-card p-8 text-center space-y-3">
        <div className="text-3xl">📭</div>
        <h3 className="arc-font-display text-lg font-bold arc-text-gradient">No Practice Questions Found</h3>
        <p className="text-xs max-w-md mx-auto" style={{ color: "var(--arc-text-secondary)" }}>
          There are currently no competitive exam questions loaded in the database for <strong>{exam}</strong>. Please seed the database or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Submission Banner */}
      {submitted && (
        <div className="bg-gradient-to-r from-emerald-600 to-indigo-600 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-black">🎉 Test Submitted Successfully</h2>
            <p className="text-emerald-100 text-sm mt-1">Review your answers and explanations below.</p>
          </div>
          <div className="flex gap-6 text-center">
            <div className="bg-white/10 px-6 py-2 rounded-2xl">
              <span className="block text-xs uppercase opacity-75">Score</span>
              <span className="text-2xl font-bold">{score} / {questions.length}</span>
            </div>
            <div className="bg-white/10 px-6 py-2 rounded-2xl">
              <span className="block text-xs uppercase opacity-75">Accuracy</span>
              <span className="text-2xl font-bold">{percentage}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* LEFT COLUMN: Question & Nav (3/5 width) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              {/* Question Header Metadata */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                    {exam}
                  </span>
                  {marked.includes(currentQuestion) && (
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                      📌 Marked for Review
                    </span>
                  )}
                  {skipped.includes(currentQuestion) && (
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                      ⚠️ Skipped
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-sm font-medium">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>

              {/* Question Text Box */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl text-white mb-6 leading-relaxed">
                <h3 className="text-lg font-semibold text-slate-100">
                  <MathRenderer text={questions[currentQuestion]?.question} />
                </h3>
              </div>
            </div>

            {/* Question Navigation Numbers */}
            <div className="border-t border-slate-800 pt-6 mt-6">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Jump To Question</h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {questions.map((q, index) => {
                  const isCurrent = currentQuestion === index;
                  const isAnswered = answers[q.id] !== undefined;
                  const isMarked = marked.includes(index);
                  
                  let btnBg = "bg-slate-800 hover:bg-slate-700 text-slate-300";
                  if (isCurrent) {
                    btnBg = "bg-indigo-600 text-white font-bold ring-2 ring-indigo-400";
                  } else if (isAnswered) {
                    btnBg = "bg-emerald-600/20 border border-emerald-500/30 text-emerald-400";
                  } else if (isMarked) {
                    btnBg = "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-9 h-9 rounded-xl font-semibold transition-all duration-200 ${btnBg}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MCQ Choices & AI Tutor Chat (2/5 width) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* MCQ Option Selection */}
          <div className="arc-card p-6 space-y-4">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Choose Your Response</h4>
            <div className="space-y-3">
              {questions[currentQuestion]?.options?.map((option, index) => {
                const isSelected = answers[questions[currentQuestion].id] === option;
                const isCorrect = option === questions[currentQuestion].correctAnswer;

                let customStyle = {
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--arc-border)",
                  color: "var(--arc-text-primary)"
                };

                if (isSelected && !submitted) {
                  customStyle = {
                    background: "rgba(212, 175, 55, 0.08)",
                    border: "1px solid var(--arc-gold-500)",
                    color: "var(--arc-gold-300)",
                    fontWeight: "600",
                    boxShadow: "0 0 15px rgba(212,175,55,0.15)"
                  };
                } else if (submitted) {
                  if (isCorrect) {
                    customStyle = {
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid var(--arc-success)",
                      color: "var(--arc-success)",
                      fontWeight: "600"
                    };
                  } else if (isSelected) {
                    customStyle = {
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid var(--arc-error)",
                      color: "var(--arc-error)",
                      fontWeight: "600"
                    };
                  } else {
                    customStyle = {
                      background: "rgba(0,0,0,0.1)",
                      border: "1px solid var(--arc-border-subtle)",
                      color: "var(--arc-text-muted)",
                      opacity: 0.5
                    };
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (submitted) return;
                      setAnswers({
                        ...answers,
                        [questions[currentQuestion].id]: option,
                      });
                    }}
                    disabled={submitted}
                    className="w-full text-left p-4 rounded-2xl cursor-pointer transition-all duration-200"
                    style={customStyle}
                  >
                    <MathRenderer text={option} />
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons: Next, Skip, Review, Submit */}
            <div className="flex gap-2.5 mt-6 flex-wrap">
              <button
                onClick={() =>
                  setCurrentQuestion(Math.min(currentQuestion + 1, questions.length - 1))
                }
                className="arc-btn-gold flex-1 py-2.5 text-sm"
              >
                Save & Next
              </button>

              <button
                onClick={() => {
                  if (!skipped.includes(currentQuestion)) {
                    setSkipped([...skipped, currentQuestion]);
                  }
                  setCurrentQuestion(Math.min(currentQuestion + 1, questions.length - 1));
                }}
                className="arc-btn-ghost px-4 py-2.5 text-sm font-semibold"
              >
                Skip
              </button>

              <button
                onClick={() => {
                  if (!marked.includes(currentQuestion)) {
                    setMarked([...marked, currentQuestion]);
                  }
                }}
                className="arc-btn-ghost px-4 py-2.5 text-sm font-semibold text-yellow-400"
                style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}
              >
                Mark
              </button>

              {!submitted && (
                <button
                  onClick={() => setSubmitted(true)}
                  className="arc-btn-gold w-full mt-4 py-3 text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    boxShadow: "0 0 20px rgba(16,185,129,0.2)"
                  }}
                >
                  Submit Practice Set
                </button>
              )}
            </div>
          </div>

          {/* AI Study Assistant Chat */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex-1 flex flex-col min-h-[350px] max-h-[480px]">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <span className="text-xl">🧠</span>
              <div>
                <h4 className="text-white font-bold text-sm">Nebula AI Study Assistant</h4>
                <p className="text-slate-400 text-xs">Real-time derivations & tutoring</p>
              </div>
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 text-sm scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-slate-950 border border-slate-850 text-slate-200 rounded-bl-none"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-850 text-indigo-400 rounded-2xl rounded-bl-none px-4 py-2.5 animate-pulse font-semibold">
                    Nebula AI is deriving...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Query Input */}
            <form onSubmit={handleSendTutorQuery} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask AI Tutor for hints or solutions..."
                value={tutorQuery}
                onChange={(e) => setTutorQuery(e.target.value)}
                disabled={chatLoading}
                className="flex-1 bg-slate-950 border border-slate-850 text-white rounded-xl px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="bg-indigo-600 hover:bg-indigo-750 text-white px-4 rounded-xl font-bold transition-all text-sm disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

export default PYQQuiz;