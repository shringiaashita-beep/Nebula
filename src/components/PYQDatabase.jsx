import { useState, useEffect, useRef } from "react";
import { pyqApi } from "../lib/pyqApi";
import MathRenderer from "./MathRenderer";

const EXAM_SUBJECTS = {
  "JEE Main":     ["Physics", "Chemistry", "Mathematics"],
  "JEE Advanced": ["Physics", "Chemistry", "Mathematics"],
  "NEET":         ["Biology", "Physics", "Chemistry"],
  "UPSC":         ["Political Science", "History", "Geography", "Economics"],
  "RAS":          ["Rajasthan GK", "History", "Geography"],
  "REET":         ["Child Development", "Pedagogy", "Teaching Aptitude"],
  "GATE":         ["Engineering Maths", "Core Subject", "Aptitude"],
  "CAT":          ["Quant", "DILR", "VARC"],
  "CUET":         ["General Test", "English", "Domain Subject"],
};

const ALL_SUBJECTS = Array.from(new Set(Object.values(EXAM_SUBJECTS).flat())).sort();

function PYQDatabase() {
  const [activeTab, setActiveTab] = useState("explorer"); // explorer, test-generator, analytics, admin
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [infoType, setInfoType] = useState("success");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExam, setFilterExam] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Active User Notes & Bookmarks mapping
  const [bookmarks, setBookmarks] = useState({});
  const [favorites, setFavorites] = useState({});
  const [notes, setNotes] = useState({});
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNoteText, setTempNoteText] = useState("");
  const [reportingErrorId, setReportingErrorId] = useState(null);
  const [reportingErrorType, setReportingErrorType] = useState("");
  const [errorReportDesc, setErrorReportDesc] = useState("");

  // Explorer interactive learning mode states
  const [explorerAnswers, setExplorerAnswers] = useState({});
  const [explorerCorrectCount, setExplorerCorrectCount] = useState(0);
  const [explorerAttemptedCount, setExplorerAttemptedCount] = useState(0);

  // Quiz Mode State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizTimer, setQuizTimer] = useState(0);
  const timerRef = useRef(null);

  // Test Generator Config
  const [testExam, setTestExam] = useState("");
  const [testSubject, setTestSubject] = useState("");
  const [testDifficulty, setTestDifficulty] = useState("");
  const [testCount, setTestCount] = useState(10);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Admin Form State
  const [adminExam, setAdminExam] = useState("");
  const [adminSubject, setAdminSubject] = useState("");
  const [adminTopic, setAdminTopic] = useState("");
  const [adminQuestion, setAdminQuestion] = useState("");
  const [adminOptA, setAdminOptA] = useState("");
  const [adminOptB, setAdminOptB] = useState("");
  const [adminOptC, setAdminOptC] = useState("");
  const [adminOptD, setAdminOptD] = useState("");
  const [adminCorrect, setAdminCorrect] = useState("A");
  const [adminDifficulty, setAdminDifficulty] = useState("Medium");
  const [adminYear, setAdminYear] = useState(2025);
  const [bulkCSV, setBulkCSV] = useState("");

  const showInfo = (msg, type = "success") => {
    setInfoMsg(msg);
    setInfoType(type);
    setTimeout(() => setInfoMsg(""), 4000);
  };

  // Load Initial Data
  useEffect(() => {
    loadQuestions();
    loadBookmarks();
  }, [filterExam, filterSubject, filterDifficulty, filterLanguage, filterYear, currentPage]);



  useEffect(() => {
    if (activeTab === "analytics") {
      loadAnalytics();
    }
  }, [activeTab]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      let result;
      if (searchQuery) {
        result = await pyqApi.searchQuestions(searchQuery, {
          exam: filterExam,
          subject: filterSubject,
          page: currentPage,
          limit: itemsPerPage
        });
      } else {
        result = await pyqApi.fetchQuestions({
          exam: filterExam,
          subject: filterSubject,
          difficulty: filterDifficulty,
          language: filterLanguage,
          year: filterYear ? parseInt(filterYear) : undefined,
          page: currentPage,
          limit: itemsPerPage
        });
      }
      setQuestions(result.data || []);
      setTotalQuestions(result.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = async () => {
    const list = await pyqApi.getBookmarkedQuestions();
    const bookmarkMap = {};
    const favMap = {};
    list.forEach(q => {
      bookmarkMap[q.id] = true;
      if (q.is_favorite) favMap[q.id] = true;
    });
    setBookmarks(bookmarkMap);
    setFavorites(favMap);
  };

  const loadAnalytics = async () => {
    const data = await pyqApi.getAnalytics();
    setAnalytics(data);
  };

  // Action Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadQuestions();
  };

  const handleToggleBookmark = async (id, isFav = false) => {
    const result = await pyqApi.toggleBookmark(id, isFav);
    if (result) {
      if (isFav) {
        setFavorites(prev => ({ ...prev, [id]: result.isFavorite }));
      } else {
        setBookmarks(prev => ({ ...prev, [id]: result.bookmarked }));
      }
      showInfo(result.bookmarked ? "✓ Bookmark saved" : "✓ Bookmark removed");
    }
  };

  const startEditingNote = async (id) => {
    setEditingNoteId(id);
    const existing = await pyqApi.getNote(id);
    setTempNoteText(existing || "");
  };

  const saveNote = async (id) => {
    const result = await pyqApi.saveNote(id, tempNoteText);
    if (result) {
      setNotes(prev => ({ ...prev, [id]: tempNoteText }));
      setEditingNoteId(null);
      showInfo("✓ Personal note saved successfully!");
    }
  };

  const handleReportError = (id, type) => {
    setReportingErrorId(id);
    setReportingErrorType(type);
    setErrorReportDesc("");
  };

  const submitErrorReport = async () => {
    if (!errorReportDesc.trim()) return;
    const ok = await pyqApi.reportError(reportingErrorId, reportingErrorType, errorReportDesc.trim());
    if (ok) {
      showInfo("✓ Error reported. Thank you for your feedback!", "success");
      setReportingErrorId(null);
      setErrorReportDesc("");
    }
  };

  const handleSelectExplorerOption = (question, selectedLetter, optionText) => {
    if (explorerAnswers[question.id]) return; // already answered
    const isCorrect = selectedLetter === question.correct_answer;
    setExplorerAnswers(prev => ({ ...prev, [question.id]: selectedLetter }));
    setExplorerAttemptedCount(prev => prev + 1);
    if (isCorrect) {
      setExplorerCorrectCount(prev => prev + 1);
    }
    // Telemetry log in background
    pyqApi.saveAttempt(question.id, optionText, isCorrect);
  };

  // Quiz / Custom Practice Engine
  const startPracticeTest = async () => {
    setLoading(true);
    const testQs = await pyqApi.generateMockTest({
      exam: testExam,
      subject: testSubject,
      difficulty: testDifficulty,
      count: parseInt(testCount)
    });
    setLoading(false);
    if (testQs.length === 0) {
      showInfo("⚠️ No matching questions found for these criteria.", "warning");
      return;
    }
    setActiveQuiz(testQs);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQuizTimer(t => t + 1);
    }, 1000);
  };

  const submitQuiz = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuizSubmitted(true);
    
    // Save quiz attempt data to analytics in background
    activeQuiz.forEach((q, idx) => {
      const selected = quizAnswers[q.id];
      const correctOptionMap = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
      const isCorrect = selected === correctOptionMap[q.correct_answer];
      pyqApi.saveAttempt(q.id, selected, isCorrect, Math.round(quizTimer / activeQuiz.length));
    });
  };

  // Admin Handlers
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!adminExam || !adminSubject || !adminQuestion || !adminOptA || !adminOptB || !adminOptC || !adminOptD) {
      showInfo("⚠️ All core fields must be filled.", "warning");
      return;
    }
    const qData = {
      exam: adminExam,
      subject: adminSubject,
      topic: adminTopic || "General",
      question: adminQuestion,
      option_a: adminOptA,
      option_b: adminOptB,
      option_c: adminOptC,
      option_d: adminOptD,
      correct_answer: adminCorrect,
      difficulty: adminDifficulty,
      year: parseInt(adminYear)
    };
    try {
      await pyqApi.adminCreateQuestion(qData);
      showInfo("✓ Question created successfully!");
      // Reset form
      setAdminQuestion("");
      setAdminOptA("");
      setAdminOptB("");
      setAdminOptC("");
      setAdminOptD("");
      loadQuestions();
    } catch (err) {
      showInfo(`⚠️ Error adding: ${err.message}`, "warning");
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkCSV.trim()) {
      showInfo("⚠️ Please paste CSV lines first.", "warning");
      return;
    }
    try {
      const rows = bulkCSV.split("\n");
      const list = [];
      rows.forEach((row, i) => {
        if (!row.trim()) return;
        const [ex, subj, top, q, a, b, c, d, corr] = row.split("|");
        if (q && a && b && c && d && corr) {
          list.push({
            exam: ex.trim(),
            subject: subj.trim(),
            topic: top.trim(),
            question: q.trim(),
            option_a: a.trim(),
            option_b: b.trim(),
            option_c: c.trim(),
            option_d: d.trim(),
            correct_answer: corr.trim(),
            difficulty: "Medium",
            year: 2025
          });
        }
      });
      if (list.length === 0) {
        showInfo("⚠️ No valid CSV rows matched the format.", "warning");
        return;
      }
      for (let i = 0; i < list.length; i += 50) {
        const batch = list.slice(i, i + 50);
        await pyqApi.adminCreateQuestion(batch);
      }
      showInfo(`✓ Bulk loaded ${list.length} questions successfully!`);
      setBulkCSV("");
      loadQuestions();
    } catch (err) {
      showInfo(`⚠️ Bulk Upload Failed: ${err.message}`, "warning");
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <div className="arc-card p-6 space-y-6">
      {/* Toast Alert */}
      {infoMsg && (
        <div
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm shadow-2xl transition-all"
          style={{
            background: infoType === "success" ? "rgba(16,185,129,0.15)" : "rgba(212,175,55,0.15)",
            border: `1px solid ${infoType === "success" ? "rgba(16,185,129,0.4)" : "rgba(212,175,55,0.4)"}`,
            color: infoType === "success" ? "var(--arc-success)" : "var(--arc-gold-400)",
            backdropFilter: "blur(12px)"
          }}
        >
          {infoMsg}
        </div>
      )}

      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="arc-font-display text-2xl font-bold arc-text-gradient flex items-center gap-2">
            🏛 Quiz Treasure
          </h2>
          <p className="text-xs" style={{ color: "var(--arc-text-secondary)" }}>
            High-scale modular archive of past year examination questions.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-900 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "explorer", label: "🔍 Explorer" },
            { id: "test-generator", label: "⚡ Test Builder" },
            { id: "analytics", label: "📈 Performance" },
            { id: "admin", label: "⚙ Admin Control" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveQuiz(null);
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200"
              style={{
                background: activeTab === tab.id ? "rgba(212,175,55,0.1)" : "transparent",
                color: activeTab === tab.id ? "var(--arc-gold-400)" : "var(--arc-text-secondary)"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Questions Explorer */}
      {activeTab === "explorer" && !activeQuiz && (
        <div className="space-y-6">
          {/* Search bar & Advanced filters */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search by keywords, formulas, topic, or question ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="arc-input text-xs flex-1"
              style={{ background: "rgba(0,0,0,0.4)" }}
            />
            <button type="submit" className="arc-btn-gold px-5 py-2 text-xs">
              Search
            </button>
          </form>

          {/* Filters Matrix - 1 col on mobile, 2 col on sm, 5 col on md+ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            <select
              value={filterExam}
              onChange={(e) => { setFilterExam(e.target.value); setCurrentPage(1); }}
              className="arc-input text-xs"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <option value="">All Exams</option>
              <option value="JEE Main">JEE Main</option>
              <option value="JEE Advanced">JEE Advanced</option>
              <option value="NEET">NEET</option>
              <option value="UPSC">UPSC</option>
              <option value="RAS">RAS</option>
              <option value="REET">REET</option>
              <option value="GATE">GATE</option>
              <option value="CAT">CAT</option>
              <option value="CUET">CUET</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => { setFilterSubject(e.target.value); setCurrentPage(1); }}
              className="arc-input text-xs"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <option value="">All Subjects</option>
              {(filterExam ? (EXAM_SUBJECTS[filterExam] || []) : ALL_SUBJECTS).map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => { setFilterDifficulty(e.target.value); setCurrentPage(1); }}
              className="arc-input text-xs"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">🟢 Easy</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Hard">🔴 Hard</option>
              <option value="Hardest">💀 Hardest (JEE Advanced)</option>
            </select>

            <select
              value={filterLanguage}
              onChange={(e) => { setFilterLanguage(e.target.value); setCurrentPage(1); }}
              className="arc-input text-xs"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>

            <input
              placeholder="Year (e.g. 2024)"
              type="number"
              value={filterYear}
              onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}
              className="arc-input text-xs"
              style={{ background: "rgba(0,0,0,0.4)" }}
            />
          </div>

          {/* Learning Mode Score Tracker */}
          {explorerAttemptedCount > 0 && (
            <div className="arc-card p-4 flex justify-between items-center bg-slate-950/60 border border-slate-900 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ⚡ Learning Performance Score
              </span>
              <span className="text-sm font-black text-white">
                {explorerCorrectCount} / {explorerAttemptedCount} Correct ({((explorerCorrectCount / explorerAttemptedCount) * 100).toFixed(0)}% Accuracy)
              </span>
            </div>
          )}

          {/* Count Header */}
          <div className="flex justify-between items-center px-1 text-xs">
            <span style={{ color: "var(--arc-text-secondary)" }}>
              Total Found: <strong style={{ color: "var(--arc-gold-400)" }}>{totalQuestions}</strong> questions
            </span>
            <span style={{ color: "var(--arc-text-muted)" }}>
              Page {currentPage} of {Math.ceil(totalQuestions / itemsPerPage) || 1}
            </span>
          </div>

          {/* Infinite-Scroll / List container */}
          {loading ? (
            <div className="text-center py-10 animate-pulse text-xs" style={{ color: "var(--arc-gold-400)" }}>
              Accessing high-scale dataset index...
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12 text-xs" style={{ color: "var(--arc-text-muted)" }}>
              📭 No questions matched the selected parameters.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="arc-card p-5 border border-slate-900 hover:border-slate-800 space-y-4 relative"
                  style={{ background: "rgba(255,255,255,0.01)" }}
                >
                  {/* Top metadata badge row */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <button
                      onClick={() => { setFilterExam(q.exam); setCurrentPage(1); }}
                      title={`Filter by ${q.exam}`}
                      className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase transition-all hover:bg-amber-500/25 cursor-pointer"
                    >
                      {q.exam}
                    </button>
                    {/* JEE Advanced hardest badge */}
                    {q.exam === "JEE Advanced" && (
                      <span className="bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full border border-red-500/40 font-black uppercase tracking-wider animate-pulse">
                        💀 HARDEST
                      </span>
                    )}
                    <button
                      onClick={() => { setFilterSubject(q.subject); setCurrentPage(1); }}
                      title={`Filter by subject: ${q.subject}`}
                      className="bg-slate-800/40 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/30 transition-all hover:bg-slate-800/60 cursor-pointer"
                    >
                      {q.subject}
                    </button>
                    <button
                      onClick={() => { setSearchQuery(q.topic); setCurrentPage(1); }}
                      title={`Filter by topic: ${q.topic}`}
                      className="bg-slate-800/40 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/30 transition-all hover:bg-slate-800/60 cursor-pointer"
                    >
                      {q.topic}
                    </button>
                    <button
                      onClick={() => { setFilterYear(q.year.toString()); setCurrentPage(1); }}
                      title={`Filter by year: ${q.year}`}
                      className="bg-slate-800/40 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/30 transition-all hover:bg-slate-800/60 cursor-pointer"
                    >
                      Year {q.year}
                    </button>
                    {/* Color-coded difficulty badge */}
                    <button
                      onClick={() => { setFilterDifficulty(q.difficulty); setCurrentPage(1); }}
                      title={`Filter by difficulty: ${q.difficulty}`}
                      className="px-2 py-0.5 rounded-full border font-semibold transition-all cursor-pointer"
                      style={{
                        background: q.difficulty === "Hard" || q.difficulty === "Hardest"
                          ? "rgba(239,68,68,0.1)"
                          : q.difficulty === "Medium"
                          ? "rgba(245,158,11,0.1)"
                          : "rgba(16,185,129,0.1)",
                        borderColor: q.difficulty === "Hard" || q.difficulty === "Hardest"
                          ? "rgba(239,68,68,0.4)"
                          : q.difficulty === "Medium"
                          ? "rgba(245,158,11,0.4)"
                          : "rgba(16,185,129,0.4)",
                        color: q.difficulty === "Hard" || q.difficulty === "Hardest"
                          ? "#f87171"
                          : q.difficulty === "Medium"
                          ? "#fbbf24"
                          : "#34d399"
                      }}
                    >
                      {q.difficulty === "Hard" ? "🔴 Hard" : q.difficulty === "Hardest" ? "💀 Hardest" : q.difficulty === "Easy" ? "🟢 Easy" : "🟡 Medium"}
                    </button>
                    {/* Image-based question badge */}
                    {q.images && q.images.length > 0 && (
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-semibold">
                        🖼️ Image-Based
                      </span>
                    )}
                  </div>

                  {/* Question body */}
                  <div className="text-sm font-semibold text-white leading-relaxed pt-1">
                    <MathRenderer text={q.question} />
                  </div>

                  {/* Image-based question display — rendered in B&W like real exam papers */}
                  {q.images && q.images.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">📷 Diagram / Figure</p>
                      <div className="flex flex-wrap gap-3">
                        {q.images.map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className="border border-slate-700 rounded-xl overflow-hidden bg-white p-2">
                            <img
                              src={imgUrl}
                              alt={`Question diagram ${imgIdx + 1}`}
                              className="max-w-xs max-h-64 object-contain rounded"
                              style={{
                                filter: "grayscale(100%) contrast(1.2)",
                                WebkitFilter: "grayscale(100%) contrast(1.2)"
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Options display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {[
                      { letter: "A", text: q.option_a },
                      { letter: "B", text: q.option_b },
                      { letter: "C", text: q.option_c },
                      { letter: "D", text: q.option_d }
                    ].map((opt) => {
                      const userSelection = explorerAnswers[q.id];
                      const hasAnswered = !!userSelection;
                      const isSelected = userSelection === opt.letter;
                      const isCorrect = opt.letter === q.correct_answer;

                      let bg = "rgba(0,0,0,0.15)";
                      let border = "var(--arc-border-subtle)";
                      let textColor = "var(--arc-text-primary)";

                      if (hasAnswered) {
                        if (isCorrect) {
                          bg = "rgba(16, 185, 129, 0.08)";
                          border = "rgba(16, 185, 129, 0.4)";
                          textColor = "var(--arc-success)";
                        } else if (isSelected) {
                          bg = "rgba(239, 68, 68, 0.08)";
                          border = "rgba(239, 68, 68, 0.4)";
                          textColor = "var(--arc-error)";
                        } else {
                          bg = "rgba(0,0,0,0.05)";
                          border = "rgba(255,255,255,0.03)";
                          textColor = "var(--arc-text-muted)";
                        }
                      }

                      return (
                        <button
                          key={opt.letter}
                          disabled={hasAnswered}
                          onClick={() => handleSelectExplorerOption(q, opt.letter, opt.text)}
                          className="p-3 rounded-lg border flex items-start gap-2.5 text-left transition-all duration-150 hover:border-amber-500/35"
                          style={{
                            background: bg,
                            borderColor: border,
                            color: textColor
                          }}
                        >
                          <span
                            className="font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border"
                            style={{
                              background: hasAnswered && isCorrect ? "var(--arc-success)" : "rgba(255,255,255,0.03)",
                              borderColor: hasAnswered && isCorrect ? "var(--arc-success)" : "var(--arc-border)",
                              color: hasAnswered && isCorrect ? "#fff" : "inherit"
                            }}
                          >
                            {opt.letter}
                          </span>
                          <span><MathRenderer text={opt.text} /></span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Solutions summary: shown only on wrong selection */}
                  {(() => {
                    const userSelection = explorerAnswers[q.id];
                    const hasAnswered = !!userSelection;
                    const isSelectedCorrect = userSelection === q.correct_answer;

                    if (hasAnswered && !isSelectedCorrect) {
                      return (
                        <div className="bg-slate-950/60 p-3 rounded-lg border border-red-500/20 text-xs">
                          <span className="font-bold text-red-400">Incorrect / गलत. Correct Answer is Option {q.correct_answer}</span>
                          {q.explanation && (
                            <p className="mt-1.5" style={{ color: "var(--arc-text-secondary)" }}>
                              <strong>Explanation / व्याख्या:</strong> <MathRenderer text={q.explanation} />
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Actions / Interaction panel */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-950/80 pt-3 mt-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleBookmark(q.id, false)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                          bookmarks[q.id]
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-transparent text-slate-400 border-slate-800 hover:text-slate-300"
                        }`}
                      >
                        📌 {bookmarks[q.id] ? "Bookmarked" : "Bookmark"}
                      </button>

                      <button
                        onClick={() => handleToggleBookmark(q.id, true)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                          favorites[q.id]
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-transparent text-slate-400 border-slate-800 hover:text-slate-300"
                        }`}
                      >
                        ⭐ {favorites[q.id] ? "Favorited" : "Favorite"}
                      </button>

                      <button
                        onClick={() => startEditingNote(q.id)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold border bg-transparent text-slate-400 border-slate-800 hover:text-slate-300"
                      >
                        📝 {notes[q.id] || q.important_notes ? "Edit Note" : "Add Note"}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReportError(q.id, "Typo")}
                        className="text-[10px] text-red-400/70 hover:text-red-400 underline font-semibold"
                      >
                        Report Error
                      </button>
                    </div>
                  </div>

                  {/* Personal Note Editor overlay */}
                  {editingNoteId === q.id && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 space-y-3 mt-2">
                      <h4 className="text-xs font-bold text-amber-400">Personal Note for Question #{q.id}</h4>
                      <textarea
                        value={tempNoteText}
                        onChange={(e) => setTempNoteText(e.target.value)}
                        className="arc-input text-xs w-full"
                        rows="3"
                        placeholder="Add highlights, formula cues, or personal solutions..."
                        style={{ background: "rgba(0,0,0,0.4)" }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveNote(q.id)}
                          className="arc-btn-gold px-3 py-1.5 text-xs rounded-lg"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error Report overlay */}
                  {reportingErrorId === q.id && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-red-500/20 space-y-3 mt-2">
                      <h4 className="text-xs font-bold text-red-400">Report Issue for Question #{q.id} ({reportingErrorType})</h4>
                      <textarea
                        value={errorReportDesc}
                        onChange={(e) => setErrorReportDesc(e.target.value)}
                        className="arc-input text-xs w-full"
                        rows="3"
                        placeholder="Describe the issue (typo, wrong answer, formatting error, etc.)..."
                        style={{ background: "rgba(0,0,0,0.4)" }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setReportingErrorId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={submitErrorReport}
                          className="px-3 py-1.5 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
                        >
                          Submit Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-900">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="arc-btn-ghost px-4 py-2 text-xs rounded-xl disabled:opacity-30"
                >
                  ◀ Previous Page
                </button>
                <button
                  disabled={currentPage >= Math.ceil(totalQuestions / itemsPerPage)}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="arc-btn-ghost px-4 py-2 text-xs rounded-xl disabled:opacity-30"
                >
                  Next Page ▶
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Mock Test / Custom Practice Generator */}
      {activeTab === "test-generator" && !activeQuiz && (
        <div className="arc-card p-6 space-y-5" style={{ background: "rgba(255,255,255,0.01)" }}>
          <div>
            <h3 className="arc-font-display text-lg font-bold arc-text-gradient">⚡ Mock Test & Custom Practice Builder</h3>
            <p className="text-xs" style={{ color: "var(--arc-text-secondary)" }}>
              Instantly configure and generate mock exams from indexed competitive question bank.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-3">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Target Exam</label>
                <select
                  value={testExam}
                  onChange={(e) => setTestExam(e.target.value)}
                  className="arc-input text-xs w-full"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                >
                  <option value="">Mixed Exams</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="JEE Advanced">JEE Advanced</option>
                  <option value="NEET">NEET</option>
                  <option value="UPSC">UPSC</option>
                  <option value="RAS">RAS</option>
                  <option value="REET">REET</option>
                  <option value="GATE">GATE</option>
                  <option value="CAT">CAT</option>
                  <option value="CUET">CUET</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Syllabus Subject</label>
                <input
                  placeholder="e.g. Physics, Chemistry, History"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="arc-input text-xs w-full"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Difficulty level</label>
                <select
                  value={testDifficulty}
                  onChange={(e) => setTestDifficulty(e.target.value)}
                  className="arc-input text-xs w-full"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                >
                  <option value="">Mixed Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Question Count</label>
                <select
                  value={testCount}
                  onChange={(e) => setTestCount(e.target.value)}
                  className="arc-input text-xs w-full"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                >
                  <option value="10">10 Questions (Quick Review)</option>
                  <option value="20">20 Questions (Standard Drill)</option>
                  <option value="50">50 Questions (Mega Quiz)</option>
                  <option value="100">100 Questions (Full Length Mock)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={startPracticeTest}
            className="arc-btn-gold w-full py-3.5 text-xs font-bold rounded-xl mt-4"
          >
            ⚡ Generate & Start Exam Practice
          </button>
        </div>
      )}

      {/* Active Practice Quiz Mode */}
      {activeQuiz && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-900">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Mock Exam Active</span>
              <h3 className="text-sm font-semibold text-white mt-0.5">Length: {activeQuiz.length} Questions</h3>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold block" style={{ color: "var(--arc-text-muted)" }}>Time Elapsed</span>
              <span className="text-lg font-black text-white">{formatTime(quizTimer)}</span>
            </div>
          </div>

          <div className="space-y-6">
            {activeQuiz.map((q, idx) => (
              <div key={q.id} className="arc-card p-5 border border-slate-900 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold" style={{ color: "var(--arc-gold-400)" }}>Question {idx + 1} of {activeQuiz.length}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{q.subject}</span>
                </div>

                <div className="text-sm font-semibold text-white">
                  <MathRenderer text={q.question} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {[
                    { letter: "A", val: q.option_a },
                    { letter: "B", val: q.option_b },
                    { letter: "C", val: q.option_c },
                    { letter: "D", val: q.option_d }
                  ].map(opt => {
                    const isSelected = quizAnswers[q.id] === opt.val;
                    const isCorrect = opt.letter === q.correct_answer;
                    
                    let bg = "rgba(0,0,0,0.2)";
                    let border = "var(--arc-border)";

                    if (isSelected && !quizSubmitted) {
                      bg = "rgba(212,175,55,0.08)";
                      border = "var(--arc-gold-500)";
                    } else if (quizSubmitted) {
                      if (isCorrect) {
                        bg = "rgba(16,185,129,0.1)";
                        border = "var(--arc-success)";
                      } else if (isSelected) {
                        bg = "rgba(239, 68, 68, 0.1)";
                        border = "var(--arc-error)";
                      }
                    }

                    return (
                      <button
                        key={opt.letter}
                        disabled={quizSubmitted}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                        className="text-left p-3 rounded-lg border transition-all duration-200"
                        style={{ background: bg, borderColor: border }}
                      >
                        <span className="font-bold mr-2 text-[10px] w-5 h-5 rounded-full inline-flex items-center justify-center border bg-white/5 border-white/10">{opt.letter}</span>
                        <span><MathRenderer text={opt.val} /></span>
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 text-xs space-y-1">
                    <span className="font-bold text-emerald-400">Correct Answer: Option {q.correct_answer}</span>
                    {q.explanation && (
                      <p style={{ color: "var(--arc-text-secondary)" }}><strong>Explanation:</strong> <MathRenderer text={q.explanation} /></p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {!quizSubmitted ? (
            <button
              onClick={submitQuiz}
              className="arc-btn-gold w-full py-4 text-xs font-bold rounded-xl mt-4"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                boxShadow: "0 0 20px rgba(16,185,129,0.2)"
              }}
            >
              ✓ Submit & End Mock Test
            </button>
          ) : (
            <button
              onClick={() => setActiveQuiz(null)}
              className="arc-btn-gold w-full py-4 text-xs font-bold rounded-xl mt-4"
            >
              ◀ Back to Test Generator
            </button>
          )}
        </div>
      )}

      {/* TAB 3: Analytics & Progress Heatmap */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Practice Drill", value: analytics?.totalAttempts || 0, icon: "🔥" },
              { label: "Practice Accuracy %", value: `${analytics?.accuracy || 0}%`, icon: "🎯" },
              { label: "Avg Time per Item", value: `${analytics?.avgTime || 0}s`, icon: "⏱" },
              { label: "Active Subjects", value: Object.keys(analytics?.subjectStats || {}).length, icon: "📚" }
            ].map(({ label, value, icon }) => (
              <div key={label} className="arc-card-elevated p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs" style={{ color: "var(--arc-text-muted)" }}>
                  <span>{label}</span>
                  <span>{icon}</span>
                </div>
                <span className="text-lg font-black text-white mt-1">{value}</span>
              </div>
            ))}
          </div>

          {/* Subject Stats breakdown table */}
          <div className="arc-card p-5 border border-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--arc-text-muted)" }}>Subject Performance Index</h3>
            {(!analytics || Object.keys(analytics.subjectStats).length === 0) ? (
              <p className="text-xs text-center py-6" style={{ color: "var(--arc-text-muted)" }}>No practice logs available yet.</p>
            ) : (
              <div className="space-y-3.5">
                {Object.entries(analytics.subjectStats).map(([subj, stats]) => {
                  const acc = ((stats.correct / stats.total) * 100).toFixed(0);
                  return (
                    <div key={subj} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">{subj}</span>
                        <span style={{ color: "var(--arc-gold-400)" }}>{stats.correct}/{stats.total} correct ({acc}%)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${acc}%`,
                            background: parseInt(acc) > 70 ? "var(--arc-success)" : parseInt(acc) > 40 ? "var(--arc-gold-500)" : "var(--arc-error)"
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Admin Control Panel */}
      {activeTab === "admin" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Question Form */}
          <form onSubmit={handleAddQuestion} className="arc-card p-5 border border-slate-900 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Add Question</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Exam Name (e.g. UPSC)"
                value={adminExam}
                onChange={(e) => setAdminExam(e.target.value)}
                className="arc-input text-xs"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
              <input
                placeholder="Subject Name (e.g. History)"
                value={adminSubject}
                onChange={(e) => setAdminSubject(e.target.value)}
                className="arc-input text-xs"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="Topic Name"
                value={adminTopic}
                onChange={(e) => setAdminTopic(e.target.value)}
                className="arc-input text-xs"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
              <select
                value={adminDifficulty}
                onChange={(e) => setAdminDifficulty(e.target.value)}
                className="arc-input text-xs"
                style={{ background: "rgba(0,0,0,0.4)" }}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <input
                placeholder="Year"
                type="number"
                value={adminYear}
                onChange={(e) => setAdminYear(e.target.value)}
                className="arc-input text-xs"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
            </div>

            <textarea
              placeholder="Question text (Supports LaTeX/Math expressions)"
              value={adminQuestion}
              onChange={(e) => setAdminQuestion(e.target.value)}
              rows="3"
              className="arc-input text-xs w-full"
              style={{ background: "rgba(0,0,0,0.4)" }}
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Option A"
                value={adminOptA}
                onChange={(e) => setAdminOptA(e.target.value)}
                className="arc-input text-xs"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
              <input
                placeholder="Option B"
                value={adminOptB}
                onChange={(e) => setAdminOptB(e.target.value)}
                className="arc-input text-xs"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
              <input
                placeholder="Option C"
                value={adminOptC}
                onChange={(e) => setAdminOptC(e.target.value)}
                className="arc-input text-xs"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
              <input
                placeholder="Option D"
                value={adminOptD}
                onChange={(e) => setAdminOptD(e.target.value)}
                className="arc-input text-xs"
                style={{ background: "rgba(0,0,0,0.4)" }}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Correct Option Letter</label>
              <select
                value={adminCorrect}
                onChange={(e) => setAdminCorrect(e.target.value)}
                className="arc-input text-xs w-full"
                style={{ background: "rgba(0,0,0,0.4)" }}
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <button type="submit" className="arc-btn-gold w-full py-3 text-xs font-bold">
              ✓ Save Question
            </button>
          </form>

          {/* Bulk CSV Import Panel */}
          <div className="arc-card p-5 border border-slate-900 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">Bulk CSV/Excel Upload</h3>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--arc-text-secondary)" }}>
                Paste pipe-separated (<code>|</code>) question rows here to upload multiple records at once.
              </p>
              <span className="text-[10px] mt-2 block font-mono" style={{ color: "var(--arc-text-muted)" }}>
                Format: Exam | Subject | Topic | Question | Opt A | Opt B | Opt C | Opt D | CorrectOptionLetter
              </span>
            </div>

            <textarea
              placeholder="UPSC | History | Medieval | Who built Red Fort? | Akbar | Shah Jahan | Jahangir | Babur | B"
              value={bulkCSV}
              onChange={(e) => setBulkCSV(e.target.value)}
              rows="6"
              className="arc-input text-xs w-full font-mono mt-3 flex-1"
              style={{ background: "rgba(0,0,0,0.4)" }}
            />

            <button
              onClick={handleBulkUpload}
              className="arc-btn-gold w-full py-3 text-xs font-bold mt-4"
            >
              🚀 Run Bulk Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PYQDatabase;
