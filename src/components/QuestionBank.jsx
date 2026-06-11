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
    <div className="bg-white p-6 rounded-2xl shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Question Bank
      </h2>

      <div className="grid gap-2">
        <input
          placeholder="Subject"
          value={subject}
          onChange={(e) =>
            setSubject(e.target.value)
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Topic"
          value={topic}
          onChange={(e) =>
            setTopic(e.target.value)
          }
          className="border p-2 rounded"
        />

        <textarea
          placeholder="Question"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          className="border p-2 rounded"
        />

        <input
          placeholder="Option A"
          value={optionA}
          onChange={(e) =>
            setOptionA(e.target.value)
          }
          className="border p-2 rounded"
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
          className="bg-black text-white py-2 rounded"
        >
          Add Question
        </button>
      </div>
    </div>
  );
}

export default QuestionBank;