import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

function EliteChallenge({
  subject,
  topic,
  onPass,
}) {
  const [questions, setQuestions] =
    useState([]);

  const [current, setCurrent] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
  console.log("SUBJECT:", subject);
  console.log("TOPIC:", topic);

  const { data, error } =
    await supabase
      .from("question_bank")
      .select("*")
      .eq("subject_name", subject)
      .eq("topic_name", topic);

  console.log("QUESTION DATA:", data);
  console.log("QUESTION ERROR:", error);

  if (error) {
    console.log(error);
    return;
  }

  setQuestions(data || []);
  setLoading(false);
};
  const answerQuestion = (
    option
  ) => {
    let newScore = score;

    if (
      option ===
      questions[current]
        .correct_answer
    ) {
      newScore++;
      setScore(newScore);
    }

    if (
      current ===
      questions.length - 1
    ) {
      const passMarks =
        Math.ceil(
          questions.length * 0.6
        );

      if (newScore >= passMarks) {
        onPass();
      } else {
        alert(
          `Failed! Score: ${newScore}/${questions.length}`
        );
      }
    } else {
      setCurrent(current + 1);
    }
  };

  if (loading) {
    return (
      <div className="mt-4">
        Loading Questions...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mt-4 text-red-500">
        No questions found for
        this topic.
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-lg mt-4">
      <h3 className="font-bold text-xl">
        Elite Challenge
      </h3>

      <p className="text-sm mb-3">
        {current + 1}/
        {questions.length}
      </p>

      <p className="font-medium">
        {
          questions[current]
            .question
        }
      </p>

      <div className="flex flex-col gap-2 mt-4">
        {[
          questions[current]
            .option_a,
          questions[current]
            .option_b,
          questions[current]
            .option_c,
          questions[current]
            .option_d,
        ].map((option) => (
          <button
            key={option}
            onClick={() =>
              answerQuestion(
                option
              )
            }
            className="border p-2 rounded hover:bg-slate-100"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default EliteChallenge;