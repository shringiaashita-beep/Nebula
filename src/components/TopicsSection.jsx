import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import supabase from "../lib/supabase";
import EliteChallenge from "./EliteChallenge";
import TopicNotes from "./TopicNotes";
import Flashcards from "./Flashcards";
import MindMap from "./MindMap";
import {
  generateTopics,
  generateNotes,
  generateHardQuestions,
} from "../lib/gemini";
import {
  generateEliteChallenge,
} from "../lib/gemini";
import QuickRevision from "./QuickRevision";
import ReactMarkdown from "react-markdown";
function TopicsSection({
  selectedSubject,
}) {
  const { t } = useTranslation();
  const button3D =
"cursor-pointer relative overflow-hidden rounded-2xl px-5 py-3 font-semibold text-white transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:translate-y-0 shadow-[0_8px_0_rgba(0,0,0,0.25),0_15px_25px_rgba(0,0,0,0.18)]";

const [subjectName, setSubjectName] = useState("");
const [topicName, setTopicName] = useState("");
const [level, setLevel] = useState("");
const [topics, setTopics] = useState([]);
const [openMenu, setOpenMenu] =
  useState(null);
const [bulkGenerating, setBulkGenerating] = useState(false);
const [questionGeneratingTopicId, setQuestionGeneratingTopicId] = useState(null);
const [selectedTopic, setSelectedTopic] = useState(null);
const [editingTopic, setEditingTopic] = useState(null);
const [editText, setEditText] = useState("");
const [toast, setToast] = useState(null);
const showToast = (message, type = "info") => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 3000);
};
const alert = (msg) => showToast(msg, "info");
useEffect(() => {

}, [topics]);
const [notesTopic, setNotesTopic] =
  useState(null);
const [flashcardTopic, setFlashcardTopic] =
  useState(null);
  const [mindMapTopic, setMindMapTopic] =
  useState(null);
  const [revisionTopic, setRevisionTopic] =
  useState(null);
useEffect(() => {
  fetchTopics();
}, [
  selectedSubject,
]);
const fetchTopics = async () => {
const {
data: { user },
} = await supabase.auth.getUser();

if (!user) return;

let query =
  supabase
    .from("topics")
    .select("*")
    .eq(
      "user_id",
      user.id
    );

if (
  selectedSubject
) {
  query =
    query.eq(
      "subject_name",
      selectedSubject
    );
}

const {
  data,
  error,
} = await query.order(
  "created_at",
  {
    ascending: true,
  }
);



if (error) {
  console.error(error);
  return;
}


setTopics(data || []);
};

const addTopic = async () => {
const {
data: { user },
} = await supabase.auth.getUser();

if (!user) {
  alert("User not found");
  return;
}

const normalizedSubject = subjectName.trim();
const normalizedTopic = topicName.trim();

if (!normalizedSubject || !normalizedTopic) {
  alert("Fill all fields");
  return;
}

const {
  data: existingTopic,
  error: existingError,
} = await supabase
  .from("topics")
  .select("id")
  .eq("user_id", user.id)
  .eq("subject_name", normalizedSubject)
  .eq("topic_name", normalizedTopic)
  .maybeSingle();

if (existingError) {
  console.error(existingError);
  return;
}

if (existingTopic) {
  alert("This topic already exists.");
  return;
}

const { error } = await supabase
  .from("topics")
  .insert([
    {
      user_id: user.id,
      subject_name: normalizedSubject,
      topic_name: normalizedTopic,
      is_completed: false,
    },
  ]);

if (error) {
  alert(error.message);
  return;
}

setSubjectName("");
setTopicName("");

fetchTopics();

};
const deleteTopic = async (id) => {
  const { error } =
    await supabase
      .from("topics")
      .delete()
      .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  fetchTopics();
};
const updateTopic = async (
  topicId
) => {
  const { error } =
    await supabase
      .from("topics")
      .update({
        topic_name: editText,
      })
      .eq("id", topicId);

  if (error) {
    console.error(error);
    return;
  }

  setEditingTopic(null);
  setEditText("");

  fetchTopics();
};
const generateAITopics =
  async () => {
    const subject = subjectName.trim();

    if (!subject) {
      alert(
        "Enter a subject first"
      );
      return;
    }

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) return;

    let aiTopics;
    try {
      aiTopics = await generateTopics(
        subject
      );
    } catch (error) {
      alert(
        error.message ||
          "AI quota exceeded or failed to generate topics. Please try again later."
      );
      return;
    }

    const topicList = [
      ...new Set(
        aiTopics
          .split("\n")
          .map((t) => t.trim())
          .filter((t) => t !== "")
      ),
    ];

    const { data: existingTopics } =
      await supabase
        .from("topics")
        .select("topic_name")
        .eq("user_id", user.id)
        .eq("subject_name", subject);

    const existingNames = new Set(
      (existingTopics || []).map((topic) =>
        topic.topic_name.trim().toLowerCase()
      )
    );

    const rows = topicList
      .filter(
        (topic) =>
          !existingNames.has(
            topic.toLowerCase()
          )
      )
      .map((topic) => ({
        user_id: user.id,
        subject_name: subject,
        topic_name: topic,
        is_completed: false,
      }));

    if (rows.length === 0) {
      alert(
        "No new AI topics to add."
      );
      return;
    }

    const { error } =
      await supabase
        .from("topics")
        .insert(rows);

    if (error) {
      console.error(error);
      return;
    }

    fetchTopics();

    alert(
      "AI Topics Generated!"
    );
  };

const generateNotesForAllTopics =
  async () => {
    if (topics.length === 0) {
      alert("No topics available to generate notes for.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const subjects = [
      ...new Set(
        topics.map((topic) =>
          topic.subject_name
        )
      ),
    ];

    const { data: existingNotes, error: notesError } =
      await supabase
        .from("topic_notes")
        .select("subject_name, topic_name")
        .in("subject_name", subjects);

    if (notesError) {
      console.error(notesError);
      return;
    }

    const existingSet = new Set(
      (existingNotes || []).map(
        (item) =>
          `${item.subject_name}|${item.topic_name}`.toLowerCase()
      )
    );

    const missingTopics = topics.filter(
      (topic) => {
        const key = `${topic.subject_name}|${topic.topic_name}`.toLowerCase();
        return (
          topic.topic_name?.trim() &&
          !existingSet.has(key)
        );
      }
    );

    if (missingTopics.length === 0) {
      alert("All displayed topics already have notes.");
      return;
    }

    setBulkGenerating(true);
    let generatedCount = 0;

    for (const topic of missingTopics) {
      try {
        const notesText = await generateNotes(
          topic.subject_name,
          topic.topic_name
        );

        const { error } = await supabase
          .from("topic_notes")
          .insert([
            {
              subject_name:
                topic.subject_name,
              topic_name:
                topic.topic_name,
              notes: notesText,
            },
          ]);

        if (!error) {
          generatedCount += 1;
        }
      } catch (error) {
        console.error(
          "Error generating notes for",
          topic.topic_name,
          error
        );
        if (error?.message?.includes("quota")) {
          alert(
            "AI quota exceeded while generating notes. Please wait and try again later."
          );
          break;
        }
      }
    }

    setBulkGenerating(false);
    fetchTopics();
    alert(
      `${generatedCount} note(s) created for ${missingTopics.length} topic(s).`
    );
  };

const generateHardQuestionsForTopic =
  async (topicItem) => {
    const subject = topicItem.subject_name;
    const topicText = topicItem.topic_name;

    const { data: existingQuestions, error: existingError } =
      await supabase
        .from("question_bank")
        .select("question")
        .eq("subject_name", subject)
        .eq("topic_name", topicText);

    if (existingError) {
      console.error(existingError);
      alert("Could not check existing questions.");
      return;
    }

    const existingSet = new Set(
      (existingQuestions || []).map((item) =>
        item.question.trim().toLowerCase()
      )
    );

    if (existingQuestions?.length >= 30) {
      alert("This topic already has 30 or more questions.");
      return;
    }

    const requiredCount =
      30 - (existingQuestions?.length || 0);

    setQuestionGeneratingTopicId(topicItem.id);

    let generatedQuestions = [];
    try {
      generatedQuestions = await generateHardQuestions(
        subject,
        topicText,
        requiredCount
      );
    } catch (error) {
      alert(
        error.message ||
          "AI quota exceeded or failed to generate questions. Please try again later."
      );
      setQuestionGeneratingTopicId(null);
      return;
    }

    if (!Array.isArray(generatedQuestions)) {
      alert("AI returned invalid question data. Try again.");
      setQuestionGeneratingTopicId(null);
      return;
    }

    const rows = generatedQuestions
      .map((item) => ({
        subject_name: subject,
        topic_name: topicText,
        question: item.question?.trim(),
        option_a: item.option_a?.trim(),
        option_b: item.option_b?.trim(),
        option_c: item.option_c?.trim(),
        option_d: item.option_d?.trim(),
        correct_answer: item.correct_answer?.trim(),
      }))
      .filter(
        (item) =>
          item.question &&
          item.option_a &&
          item.option_b &&
          item.option_c &&
          item.option_d &&
          item.correct_answer &&
          !existingSet.has(
            item.question.toLowerCase()
          )
      )
      .slice(0, requiredCount);

    if (rows.length === 0) {
      alert("No new valid questions were generated.");
      setQuestionGeneratingTopicId(null);
      return;
    }

    const { error: insertError } =
      await supabase
        .from("question_bank")
        .insert(rows);

    setQuestionGeneratingTopicId(null);

    if (insertError) {
      console.error(insertError);
      alert("Failed to save generated questions.");
      return;
    }

    alert(
      `${rows.length} hard question(s) generated for this topic. ` +
        `Total questions: ${
          (existingQuestions?.length || 0) + rows.length
        }`
    );
  };
const completeTopic = async (
topicId,
isCompleted
) => {
const {
data: { user },
} = await supabase.auth.getUser();
if (!user) return;

const { error } = await supabase
  .from("topics")
  .update({
    is_completed: !isCompleted,
  })
  .eq("id", topicId)
  .eq("user_id", user.id);

if (error) {
  console.error(error);
  return;
}

fetchTopics();
};

  return (
    <div className="arc-card p-6 space-y-6 mt-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all"
          style={{
            background: "rgba(212,175,55,0.15)",
            border: "1px solid rgba(212,175,55,0.4)",
            color: "var(--arc-gold-400)",
            backdropFilter: "blur(12px)",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="arc-font-display text-2xl font-bold arc-text-gradient">
          Topic Academy
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--arc-text-secondary)" }}>
          Organize and manage your topics, generate AI summaries and questions
        </p>
      </div>

      {/* Inputs Grid */}
      <div className="grid md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Subject"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="arc-input text-sm"
          style={{ background: "rgba(0,0,0,0.4)" }}
        />
        <input
          type="text"
          placeholder="Class / Degree / Semester"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="arc-input text-sm"
          style={{ background: "rgba(0,0,0,0.4)" }}
        />
        <input
          type="text"
          placeholder="Topic"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          className="arc-input text-sm"
          style={{ background: "rgba(0,0,0,0.4)" }}
        />
      </div>

      {/* Actions/Buttons bar */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={addTopic}
          className="arc-btn-gold px-5 py-2.5 text-sm rounded-xl font-bold"
        >
          ✨ Add Topic
        </button>
        <button
          onClick={generateAITopics}
          className="arc-btn-ghost px-5 py-2.5 text-sm rounded-xl font-bold"
          disabled={bulkGenerating}
        >
          Generate AI Topics
        </button>
        <button
          onClick={generateNotesForAllTopics}
          className="arc-btn-ghost px-5 py-2.5 text-sm rounded-xl font-bold"
          disabled={bulkGenerating}
        >
          {bulkGenerating ? "Generating Notes..." : "Generate Notes for Topics"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Topics", value: topics.length, icon: "📚" },
          { label: "Completed", value: topics.filter((t) => t.is_completed).length, icon: "🏆" },
          { label: "Active Topics", value: topics.filter((t) => !t.is_completed).length, icon: "🔥" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="arc-card-elevated px-4 py-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--arc-text-muted)" }}>{label}</span>
              <span style={{ color: "var(--arc-gold-400)" }}>{icon}</span>
            </div>
            <span className="text-2xl font-black mt-1" style={{ color: "var(--arc-text-hero)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="p-5 rounded-xl transition-all relative overflow-visible"
            style={{
              background: "var(--arc-bg-elevated)",
              border: "1px solid var(--arc-border)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.2)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--arc-border)"; }}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--arc-text-muted)" }}>
                  {topic.subject_name}
                </span>

                {editingTopic === topic.id ? (
                  <div className="flex gap-2 items-center mt-1">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="arc-input text-sm"
                      style={{ background: "rgba(0,0,0,0.4)" }}
                    />
                    <button onClick={() => updateTopic(topic.id)} className="arc-btn-gold px-3 py-1.5 text-xs rounded-lg">Save</button>
                    <button onClick={() => setEditingTopic(null)} className="arc-btn-ghost px-3 py-1.5 text-xs rounded-lg">Cancel</button>
                  </div>
                ) : (
                  <h3 className="arc-font-display text-lg font-bold" style={{ color: "var(--arc-text-primary)" }}>
                    {topic.topic_name}
                  </h3>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold" style={{ color: topic.is_completed ? "var(--arc-success)" : "var(--arc-gold-400)" }}>
                    {topic.is_completed ? "🏆 Completed" : "📖 In Progress"}
                  </span>
                  {questionGeneratingTopicId === topic.id && (
                    <span className="text-xs animate-pulse" style={{ color: "var(--arc-gold-400)" }}>
                      ⚡ Generating questions...
                    </span>
                  )}
                </div>
              </div>

              {/* Actions button & dropdown menu */}
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === topic.id ? null : topic.id)}
                  className="arc-btn-ghost px-3 py-1.5 text-xs rounded-lg flex items-center gap-1"
                >
                  ⚡ Actions {openMenu === topic.id ? "▲" : "▼"}
                </button>

                {openMenu === topic.id && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-[9999] overflow-hidden"
                    style={{
                      background: "var(--arc-bg-elevated)",
                      border: "1px solid var(--arc-border)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                    }}
                  >
                    <div className="py-1">
                      {[
                        { label: "📖 View Notes", action: () => setNotesTopic(topic) },
                        { label: "🎴 Flashcards", action: () => setFlashcardTopic(topic) },
                        { label: "🧠 Mind Map", action: () => setMindMapTopic(topic) },
                        { label: "⚡ Quick Revision", action: () => setRevisionTopic(topic) },
                        { label: "🎯 Generate 30 Hard Questions", action: () => generateHardQuestionsForTopic(topic) },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => { item.action(); setOpenMenu(null); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium transition-all hover:bg-white/5"
                          style={{ color: "var(--arc-text-primary)" }}
                        >
                          {item.label}
                        </button>
                      ))}

                      {!topic.is_completed && (
                        <button
                          onClick={() => { setSelectedTopic(topic); setOpenMenu(null); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium transition-all hover:bg-white/5"
                          style={{ color: "var(--arc-gold-400)" }}
                        >
                          🏆 Take Challenge
                        </button>
                      )}

                      <button
                        onClick={() => { setEditingTopic(topic.id); setEditText(topic.topic_name); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium transition-all hover:bg-white/5"
                        style={{ color: "var(--arc-text-secondary)" }}
                      >
                        ✏️ Edit Name
                      </button>

                      <button
                        onClick={() => { deleteTopic(topic.id); setOpenMenu(null); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium transition-all hover:bg-red-500/10"
                        style={{ color: "var(--arc-error)" }}
                      >
                        🗑 {t("Buttons.Delete")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Child Components if open */}
            <div className="mt-4">
              {notesTopic?.id === topic.id && (
                <TopicNotes subject={topic.subject_name} topic={topic.topic_name} onClose={() => setNotesTopic(null)} />
              )}
              {flashcardTopic?.id === topic.id && (
                <Flashcards subject={topic.subject_name} topic={topic.topic_name} onClose={() => setFlashcardTopic(null)} />
              )}
              {mindMapTopic?.id === topic.id && (
                <MindMap subject={topic.subject_name} topic={topic.topic_name} onClose={() => setMindMapTopic(null)} />
              )}
              {revisionTopic?.id === topic.id && (
                <QuickRevision subject={topic.subject_name} topic={topic.topic_name} onClose={() => setRevisionTopic(null)} />
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTopic && (
        <EliteChallenge
          subject={selectedTopic.subject_name}
          topic={selectedTopic.topic_name}
          onPass={async () => {
            const {
              data: { user },
            } = await supabase.auth.getUser();

            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();

            const { data: existingBadge } = await supabase
              .from("user_badges")
              .select("*")
              .eq("user_id", user.id)
              .eq("badge_name", "First Victory")
              .maybeSingle();

            if (!existingBadge) {
              await supabase.from("user_badges").insert([
                {
                  user_id: user.id,
                  badge_name: "First Victory",
                },
              ]);
            }

            const currentXP = profile?.xp || 0;
            const newXP = currentXP + 50;
            let newLevel = 1;

            if (newXP >= 1000)      newLevel = 5;
            else if (newXP >= 500) newLevel = 4;
            else if (newXP >= 250) newLevel = 3;
            else if (newXP >= 100) newLevel = 2;

            await supabase
              .from("profiles")
              .update({
                xp: newXP,
                level: newLevel,
              })
              .eq("id", user.id);

            const today = new Date().toISOString().split("T")[0];
            const { data: streak } = await supabase
              .from("user_streaks")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();

            if (streak) {
              if (streak.last_study_date !== today) {
                await supabase
                  .from("user_streaks")
                  .update({
                    streak_count: (streak.streak_count || 0) + 1,
                    last_study_date: today,
                  })
                  .eq("user_id", user.id);
              }
            }

            await completeTopic(selectedTopic.id, false);
            setSelectedTopic(null);
            showToast(`🏆 Topic Mastered! +50 XP · Level ${newLevel}`, "success");
          }}
        />
      )}
    </div>
  );
}

export default TopicsSection;
