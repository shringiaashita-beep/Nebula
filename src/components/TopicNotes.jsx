import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import supabase from "../lib/supabase";
import {
  generateNotes,
  askTutor,
  translateContent
} from "../lib/gemini";
import ReactMarkdown from "react-markdown";
import { getLanguageConfig, LANGUAGES } from "../config/languages";
import { useTranslation } from "react-i18next";
import MathRenderer from "./MathRenderer";

function TopicNotes({
  subject,
  topic,
  onClose,
}) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState("");
  const [translatedNotes, setTranslatedNotes] = useState(null);
  const [showingTranslation, setShowingTranslation] = useState(false);
  const [userLanguage, setUserLanguage] = useState("english");
  const [translating, setTranslating] = useState(false);

  const [loading, setLoading] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [question, setQuestion] = useState("");

  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    setAiError(null);
    setTranslatedNotes(null);
    setShowingTranslation(false);
    fetchNotes();
  }, [subject, topic]);

  const fetchNotes = async () => {
    setLoading(true);

    try {
      // Fetch user profile language
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("language_preference")
          .eq("id", session.user.id)
          .single();
        if (profile?.language_preference) {
          setUserLanguage(profile.language_preference.toLowerCase());
        }
      }

      const { data, error } =
        await supabase
          .from("topic_notes")
          .select("*")
          .eq("subject_name", subject)
          .eq("topic_name", topic)
          .maybeSingle();

      if (error) throw error;

      if (data?.notes?.trim()) {
        setNotes(data.notes);
        setGenerated(false);
        setLoading(false);
        return;
      }

      await generateAndStoreNotes(data?.id);
    } catch (err) {
      console.error("fetchNotes error:", err);
      setLoading(false);
    }
  };

  const generateAndStoreNotes = async (noteId) => {
    setLoading(true);

    try {
      const generatedNotes = await generateNotes(subject, topic);
      setNotes(generatedNotes);
      setGenerated(true);

      if (noteId) {
        await supabase
          .from("topic_notes")
          .update({ notes: generatedNotes })
          .eq("id", noteId);
      } else {
        await supabase.from("topic_notes").insert([
          {
            subject_name: subject,
            topic_name: topic,
            notes: generatedNotes,
          },
        ]);
      }
    } catch (error) {
      console.error("generateAndStoreNotes error:", error);
      setAiError(error.message || "Failed to generate notes.");
    } finally {
      setLoading(false);
    }
  };

  const regenerateNotes = async () => {
    setGenerated(true);
    setTranslatedNotes(null);
    setShowingTranslation(false);
    await generateAndStoreNotes();
  };

  const handleTranslate = async () => {
    if (translatedNotes) {
      // Toggle back and forth if already translated
      setShowingTranslation(!showingTranslation);
      return;
    }

    try {
      setTranslating(true);
      const result = await translateContent(notes, userLanguage);
      setTranslatedNotes(result);
      setShowingTranslation(true);
    } catch (err) {
      setErrorMsg("Translation failed: " + err.message);
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setTranslating(false);
    }
  };

  const handleAskAI = async () => {
    if (!question.trim()) return;

    try {
      setAsking(true);
      const response = await askTutor(subject, topic, question);
      setAnswer(response);
    } catch (error) {
      setErrorMsg(error.message || "Failed to get answer.");
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="border p-8 rounded-2xl mt-4 bg-slate-900/40 border-slate-800 text-center space-y-4 shadow-xl backdrop-blur-sm animate-pulse">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-white">
          🤖 AI is generating your comprehensive notes...
        </p>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Please wait. Generating high-quality educational notes, derivations, and practice exercises takes about 15-30 seconds. The site is actively working on it!
        </p>
      </div>
    );
  }

  if (aiError) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
        <h3 className="font-semibold text-red-700 mb-2">
          Unable to generate notes
        </h3>
        <p className="text-sm text-red-600 mb-3">
          {aiError}
        </p>
        <button
          onClick={generateAndStoreNotes}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const downloadPdf = () => {
    const doc = new jsPDF();
    const title = `${subject} - ${topic} Notes`;
    const contentToPrint = showingTranslation ? translatedNotes : notes;
    const content = `Subject: ${subject}\nTopic: ${topic}\n\n${contentToPrint}`;
    const lines = doc.splitTextToSize(content, 180);

    doc.setFontSize(14);
    doc.text(title, 10, 20);
    doc.setFontSize(11);
    doc.text(lines, 10, 30);
    doc.save(`${subject}-${topic}-notes.pdf`);
  };

  const currentConfig = getLanguageConfig(userLanguage);
  const activeContent = showingTranslation && translatedNotes ? translatedNotes : notes;

  return (
    <div
      className="border p-6 rounded-2xl mt-4"
      style={{
        background: "var(--arc-bg-surface)",
        borderColor: "var(--arc-border)",
        color: "var(--arc-text-primary)"
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-xl" style={{ color: "var(--arc-text-hero)" }}>
            📖 {t("Navigation.Notes")}
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
        <div className="flex flex-wrap gap-2">
          {userLanguage !== "english" && !generated && (
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="bg-blue-600 text-white px-4 py-2 text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {translating ? "Translating..." : (showingTranslation ? "View Original" : `Translate to ${currentConfig.label}`)}
            </button>
          )}
          <button
            onClick={regenerateNotes}
            className="arc-btn-gold px-4 py-2 text-xs rounded-lg"
          >
            Regenerate Notes
          </button>
          <button
            onClick={downloadPdf}
            className="arc-btn-ghost px-4 py-2 text-xs rounded-lg"
          >
            {t("Buttons.Download")} PDF
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-xl mb-4 flex justify-between items-center animate-fade-in">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold hover:text-white ml-2 text-sm">✖</button>
        </div>
      )}

      {generated && (
        <p className="text-sm mb-4" style={{ color: "var(--arc-text-secondary)" }}>
          Generated by AI because no saved notes were found.
        </p>
      )}

      {showingTranslation && (
        <div className="bg-blue-900/20 text-blue-300 text-xs px-3 py-2 rounded-lg mb-4 border border-blue-500/30">
          Showing translated version ({currentConfig.label}). The original version is preserved.
        </div>
      )}

      <div
        className="topic-notes-content rounded-2xl p-6 prose prose-lg max-w-none break-words overflow-x-hidden border"
        style={{
          background: "var(--arc-bg-base)",
          borderColor: "var(--arc-border)"
        }}
      >
        <MathRenderer text={activeContent} />
      </div>

      <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--arc-border)" }}>
        <h3 className="text-xl font-bold mb-3">
          🤖 Ask AI Tutor
        </h3>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAskAI();
            }
          }}
          placeholder="Ask anything in any language..."
          className="w-full border p-3 rounded-xl bg-gray-900 text-white border-gray-700 focus:outline-none focus:border-blue-500"
          rows={3}
        />
        <button
          onClick={handleAskAI}
          disabled={asking}
          className="mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl"
        >
          {asking ? "Thinking..." : "Ask AI"}
        </button>

        {answer && (
          <div className="mt-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
            <h4 className="font-semibold mb-2 text-blue-400">
              AI Answer
            </h4>
            <div className="text-slate-200 mt-2 leading-relaxed">
              <MathRenderer text={answer} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopicNotes;