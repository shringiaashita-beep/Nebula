import { useState } from "react";
import { generateMysteryTopic } from "../lib/gemini";

function SyllabusGenerator() {
const [mysteryTopic, setMysteryTopic] =
  useState("");

const [explanation, setExplanation] =
  useState("");

const [challenge, setChallenge] =
  useState("");

const [loading, setLoading] =
  useState(false);

const revealTopic = async () => {
  try {
    setLoading(true);

    const response =
      await generateMysteryTopic(
        "Pharmacology"
      );

    const topicMatch =
      response.match(
        /TOPIC:\s*([\s\S]*?)EXPLANATION:/i
      );

    const explanationMatch =
      response.match(
        /EXPLANATION:\s*([\s\S]*?)CHALLENGE:/i
      );

    const challengeMatch =
      response.match(
        /CHALLENGE:\s*([\s\S]*)/i
      );

    setMysteryTopic(
      topicMatch?.[1]?.trim() || ""
    );

    setExplanation(
      explanationMatch?.[1]?.trim() ||
        ""
    );

    setChallenge(
      challengeMatch?.[1]?.trim() ||
        ""
    );
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};


return ( <div
   className="
   bg-gradient-to-br
   from-violet-600
   to-purple-700
   text-white
   p-8
   rounded-3xl
   shadow-2xl
   mt-8
 "
 > <h2 className="text-4xl font-black mb-2">
🎁 Mystery Learning </h2>


  <p className="opacity-90 mb-6">
    Discover a random topic and
    challenge yourself today.
  </p>

  <button
    onClick={revealTopic}
    className="
    bg-white
    text-violet-700
    px-6
    py-3
    rounded-2xl
    font-bold
    shadow-lg
    hover:scale-105
    transition-all
    "
  >
   {
  loading
    ? "Generating..."
    : "Reveal Topic"
}
  </button>

 {mysteryTopic && (
  <div className="mt-6 bg-white/10 p-5 rounded-2xl">

    <p className="text-sm opacity-80">
      ✨ Mystery Topic Found
    </p>

    <h3 className="text-3xl font-bold mt-2">
      {mysteryTopic}
    </h3>

    <div className="mt-4">
      <h4 className="font-bold">
        📖 Why It Matters
      </h4>

      <p className="mt-2">
        {explanation}
      </p>
    </div>

    <div className="mt-4 bg-black/20 p-4 rounded-xl">
      <h4 className="font-bold">
        🎯 Challenge
      </h4>

      <p className="mt-2">
        {challenge}
      </p>
    </div>

  </div>
)}
</div>

);

}

export default SyllabusGenerator;
