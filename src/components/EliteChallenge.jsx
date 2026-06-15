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
const [selectedAnswer, setSelectedAnswer] =
  useState("");

const [showAnswer, setShowAnswer] =
  useState(false);

const [loading, setLoading] =
useState(true);

const [finished, setFinished] =
useState(false);

const [passed, setPassed] =
useState(false);

useEffect(() => {
fetchQuestions();
}, []);

const fetchQuestions = async () => {
const { data, error } =
await supabase
.from("question_bank")
.select("*")
.eq(
"subject_name",
subject
)
.eq(
"topic_name",
topic
);


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
  setSelectedAnswer(option);
setShowAnswer(true);
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

  setFinished(true);

  if (
    newScore >= passMarks
  ) {
    setPassed(true);

    if (onPass) {
      onPass();
    }
  }
} else {
  return;
}


};

if (loading) {
return ( <div className="mt-4">
Loading Questions... </div>
);
}

if (questions.length === 0) {
return ( <div className="mt-4 text-red-500">
No questions found for
this topic. </div>
);
}

if (finished) {
return ( <div
     className="
     mt-4
     p-6
     rounded-3xl
     shadow-xl
     bg-white
     border
   "
   > <h3 className="text-3xl font-black mb-4">
🏆 Challenge Complete </h3>


    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-yellow-100 p-4 rounded-2xl">
        <p className="text-sm">
          Final Score
        </p>

        <p className="text-3xl font-bold">
          ⭐ {score}
        </p>
      </div>

      <div className="bg-blue-100 p-4 rounded-2xl">
        <p className="text-sm">
          Total Questions
        </p>

        <p className="text-3xl font-bold">
          {questions.length}
        </p>
      </div>
    </div>

    <div
      className={`p-4 rounded-2xl text-white font-bold text-center ${
        passed
          ? "bg-green-600"
          : "bg-red-600"
      }`}
    >
      {passed
        ? "✅ PASS"
        : "❌ FAIL"}
    </div>
  </div>
);


}

return ( <div
   className="
   bg-white
   p-6
   rounded-3xl
   shadow-xl
   mt-4
   border
 "
 > <h3 className="font-black text-2xl mb-4">
⚔️ Elite Challenge </h3>


  <div className="grid grid-cols-2 gap-4 mb-5">
    <div className="bg-yellow-100 p-3 rounded-xl">
      <p className="text-sm text-slate-600">
        Score
      </p>

      <p className="text-2xl font-bold">
        ⭐ {score}
      </p>
    </div>

    <div className="bg-blue-100 p-3 rounded-xl">
      <p className="text-sm text-slate-600">
        Progress
      </p>

      <p className="text-2xl font-bold">
        {current + 1}/
        {questions.length}
      </p>
    </div>
  </div>

  <div className="bg-slate-50 p-5 rounded-2xl">
    <p className="font-semibold text-lg">
      {
        questions[current]
          .question
      }
    </p>
  </div>

  <div className="flex flex-col gap-3 mt-5">
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
        className="
        border
        p-3
        rounded-2xl
        text-left
        hover:bg-violet-50
        hover:border-violet-400
        transition-all
        "
      >
        {option}
      </button>
    ))}
  </div>
  {showAnswer && (
  <div className="mt-4">

    <div className="bg-red-100 p-3 rounded-xl mb-2">
      <strong>Your Answer:</strong>{" "}
      {selectedAnswer}
    </div>

    <div className="bg-green-100 p-3 rounded-xl">
      <strong>Correct Answer:</strong>{" "}
      {
        questions[current]
          .correct_answer
      }
    </div>

  </div>
)}
{showAnswer && (
  <button
    onClick={() => {
      setShowAnswer(false);
      setSelectedAnswer("");

      if (
        current <
        questions.length - 1
      ) {
        setCurrent(current + 1);
      }
    }}
    className="
    mt-4
    bg-violet-600
    text-white
    px-5
    py-3
    rounded-xl
    hover:bg-violet-700
    "
  >
    Next Question →
  </button>
)}
</div>


);
}

export default EliteChallenge;
