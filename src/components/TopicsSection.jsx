import { useState, useEffect } from "react";
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
function TopicsSection({
  selectedSubject,
}) {
  console.log(
  "SELECTED SUBJECT:",
  selectedSubject
);
const [subjectName, setSubjectName] = useState("");
const [topicName, setTopicName] = useState("");
const [level, setLevel] = useState("");
const [topics, setTopics] = useState([]);
const [bulkGenerating, setBulkGenerating] = useState(false);
const [questionGeneratingTopicId, setQuestionGeneratingTopicId] = useState(null);
const [editingTopic, setEditingTopic] =
  useState(null);
const [editText, setEditText] =
  useState("");
const [selectedTopic, setSelectedTopic] = useState(null);
useEffect(() => {
  console.log(
    "TOPICS STATE:",
    topics
  );
}, [topics]);
const [notesTopic, setNotesTopic] =
  useState(null);
const [flashcardTopic, setFlashcardTopic] =
  useState(null);
  const [mindMapTopic, setMindMapTopic] =
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
  console.log(
  "FILTER:",
  selectedSubject
);

console.log(
  "TOPICS:",
  data
);
if (error) {
  console.log(error);
  return;
}
console.log(
  "SETTING:",
  data
);

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
  console.log(existingError);
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
    console.log(error);
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
    console.log(error);
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
      console.log(error);
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
      console.log(notesError);
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
        console.log(
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
      console.log(existingError);
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
      console.log(insertError);
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
  console.log(error);
  return;
}

fetchTopics();
};

return ( <div className="bg-white p-6 rounded-2xl shadow mt-8"> <h2 className="text-2xl font-bold mb-4">
Topic Academy </h2>

  <div className="grid md:grid-cols-3 gap-2 mb-4">
    <input
      type="text"
      placeholder="Subject"
      value={subjectName}
      onChange={(e) =>
        setSubjectName(e.target.value)
      }
      className="border p-2 rounded-lg"
    />
 <input
    type="text"
    placeholder="Class / Degree / Semester"
    value={level}
    onChange={(e) =>
      setLevel(e.target.value)
    }
    className="border p-2 rounded-lg"
  />

    <input
      type="text"
      placeholder="Topic"
      value={topicName}
      onChange={(e) =>
        setTopicName(e.target.value)
      }
      className="border p-2 rounded-lg"
    />

    <button
      onClick={addTopic}
      className="bg-black text-white rounded-lg px-4 py-2"
    >
      Add Topic
    </button>
    <button
  onClick={
    generateAITopics
  }
  className="bg-purple-600 text-white rounded-lg px-4 py-2"
>
  Generate AI Topics
</button>
  <button
    onClick={generateNotesForAllTopics}
    className="bg-indigo-600 text-white rounded-lg px-4 py-2"
    disabled={bulkGenerating}
  >
    {bulkGenerating
      ? "Generating Notes..."
      : "Generate Notes for Topics"}
  </button>
  </div>
 
  {topics.map((topic) => (
    
  <div
    key={topic.id}
    className="border p-4 rounded-lg mb-2"
  >
    <div className="flex justify-between items-center">
      <div>
        <strong>{topic.subject_name}</strong>

        {editingTopic === topic.id ? (
  <input
    value={editText}
    onChange={(e) =>
      setEditText(
        e.target.value
      )
    }
    className="border p-1 rounded"
  />
) : (
  <p>{topic.topic_name}</p>
)}

        <p>
          {topic.is_completed
            ? "🏆 Completed"
            : "📖 In Progress"}
        </p>
      </div>

    <div className="flex gap-2">
    <button
    onClick={() =>
      deleteTopic(topic.id)
    }
    className="bg-red-600 text-white px-3 py-1 rounded"
  >
    Delete
  </button>
  <button
    onClick={() =>
      setNotesTopic(topic)
    }
    className="bg-yellow-500 text-white px-3 py-1 rounded"
  >
    View Notes
  </button>

  <button
    onClick={() =>
      setFlashcardTopic(topic)
    }
    className="bg-purple-600 text-white px-3 py-1 rounded"
  >
    Flashcards
  </button>
  <button
  onClick={() =>
    setMindMapTopic(topic)
  }
  className="bg-green-600 text-white px-3 py-1 rounded"
>
  Mind Map
</button>
  <button
    onClick={() =>
      generateHardQuestionsForTopic(topic)
    }
    className="bg-pink-600 text-white px-3 py-1 rounded"
    disabled={
      questionGeneratingTopicId === topic.id
    }
  >
    {questionGeneratingTopicId === topic.id
      ? "Generating..."
      : "Generate 30 Hard Questions"}
  </button>

  {!topic.is_completed ? (
    <button
      onClick={() =>
        setSelectedTopic(topic)
      }
      className="bg-blue-600 text-white px-3 py-1 rounded"
    >
      Take Challenge
    </button>
  ) : (
    <span className="bg-green-600 text-white px-3 py-1 rounded">
      Completed
    </span>
  )}
</div>
    </div>

   {notesTopic?.id === topic.id && (
  <TopicNotes
    subject={topic.subject_name}
    topic={topic.topic_name}
  />
)}

{flashcardTopic?.id === topic.id && (
  <Flashcards
    subject={topic.subject_name}
    topic={topic.topic_name}
  />
)}
  {mindMapTopic?.id === topic.id && (
  <MindMap
    subject={topic.subject_name}
    topic={topic.topic_name}
  />
)}
  </div>
))}

  {selectedTopic && (
   <EliteChallenge
  subject={selectedTopic.subject_name}
  topic={selectedTopic.topic_name}
  onPass={async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        const { data: existingBadge } =
  await supabase
    .from("user_badges")
    .select("*")
    .eq("user_id", user.id)
    .eq(
      "badge_name",
      "First Victory"
    )
    .single();

if (!existingBadge) {
  await supabase
    .from("user_badges")
    .insert([
      {
        user_id: user.id,
        badge_name:
          "First Victory",
      },
    ]);
}
  const currentXP =
      profile?.xp || 0;

    const newXP =
      currentXP + 50;

    let newLevel = 1;

    if (newXP >= 1000)
      newLevel = 5;
    else if (newXP >= 500)
      newLevel = 4;
    else if (newXP >= 250)
      newLevel = 3;
    else if (newXP >= 100)
      newLevel = 2;

    await supabase
      .from("profiles")
      .update({
        xp: newXP,
        level: newLevel,
      })
      .eq("id", user.id);
      const today = new Date()
  .toISOString()
  .split("T")[0];

const { data: streak } =
  await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", user.id)
    .single();

if (streak) {
  if (
    streak.last_study_date !== today
  ) {
    await supabase
      .from("user_streaks")
      .update({
        streak_count:
          (streak.streak_count || 0) + 1,
        last_study_date: today,
      })
      .eq("user_id", user.id);
  }
}

    await completeTopic(
      selectedTopic.id,
      false
    );

    setSelectedTopic(null);

    alert(
      `🏆 Topic Mastered!\n+50 XP\nLevel ${newLevel}`
    );
  }}
/>
  )}
</div>
);
}

export default TopicsSection;
