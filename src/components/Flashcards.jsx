import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

function Flashcards({
  subject,
  topic,
}) {
  const [cards, setCards] =
    useState([]);

  const [current, setCurrent] =
    useState(0);

  const [showAnswer, setShowAnswer] =
    useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const { data, error } =
      await supabase
        .from("flashcards")
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

    setCards(data || []);
  };

  if (cards.length === 0) {
    return (
      <div className="mt-4">
        No Flashcards Found
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border p-4 rounded-lg mt-4">
      <h3 className="font-bold text-xl mb-4">
        🃏 Flashcards
      </h3>

      <p className="font-semibold">
        {cards[current].question}
      </p>

      {showAnswer && (
        <p className="mt-3">
          {cards[current].answer}
        </p>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() =>
            setShowAnswer(
              !showAnswer
            )
          }
          className="bg-black text-white px-3 py-1 rounded"
        >
          {showAnswer
            ? "Hide Answer"
            : "Show Answer"}
        </button>

        <button
          onClick={() => {
            setCurrent(
              (prev) =>
                (prev + 1) %
                cards.length
            );

            setShowAnswer(
              false
            );
          }}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Next Card
        </button>
      </div>
    </div>
  );
}

export default Flashcards;