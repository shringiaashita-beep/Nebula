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
  const [correctAnswer, setCorrectAnswer] =
    useState("");

  const [questions, setQuestions] =
    useState([]);

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
      alert(error.message);
      return;
    }

    alert("Question Added");

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
    <div
  className="
  bg-gradient-to-br
  from-white
  to-blue-50
  p-8
  rounded-3xl
  shadow-2xl
  mt-8
  border
  border-blue-100
"
>
  <h2 className="text-4xl font-black mb-2">
  🧠 Question Bank
</h2>

<p className="text-slate-500 mb-6">
  Create and manage practice questions
</p>
<div className="grid md:grid-cols-3 gap-4 mb-6">

  <div className="bg-blue-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      {questions.length}
    </h3>
    <p>Total Questions</p>
  </div>

  <div className="bg-green-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      📝
    </h3>
    <p>Practice Mode</p>
  </div>

  <div className="bg-violet-500 text-white p-4 rounded-2xl shadow-lg">
    <h3 className="text-3xl font-bold">
      🎯
    </h3>
    <p>Question Creator</p>
  </div>

</div>

      <div className="grid gap-4">
        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) =>
            setSubject(e.target.value)
          }
          className="
p-4
rounded-2xl
border-2
border-slate-200
focus:outline-none
focus:border-violet-500
"
        />

        <input
          placeholder="Topic"
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
          className="
p-4
rounded-2xl
border-2
border-slate-200
focus:outline-none
focus:border-violet-500
"
        />

        <textarea
          placeholder="Question"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          className="
p-4
rounded-2xl
border-2
border-slate-200
focus:outline-none
focus:border-violet-500
"
        />

        <input
          placeholder="Option A"
          value={optionA}
          onChange={(e) =>
            setOptionA(e.target.value)
          }
          className="
p-4
rounded-2xl
border-2
border-slate-200
focus:outline-none
focus:border-violet-500
"       
        />

        <input
          placeholder="Option B"
          value={optionB}
          onChange={(e) =>
            setOptionB(e.target.value)
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Option C"
          value={optionC}
          onChange={(e) =>
            setOptionC(e.target.value)
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Option D"
          value={optionD}
          onChange={(e) =>
            setOptionD(e.target.value)
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Correct Answer"
          value={correctAnswer}
          onChange={(e) =>
            setCorrectAnswer(
              e.target.value
            )
          }
          className="border p-2 rounded"
        />

        <button
          onClick={addQuestion}
        className="
bg-gradient-to-r
from-violet-600
to-purple-700
text-white
py-4
rounded-2xl
font-bold
shadow-lg
hover:scale-105
transition-all
"       >
          Add Question
        </button>
      </div>
    </div>
  );
}

export default QuestionBank;