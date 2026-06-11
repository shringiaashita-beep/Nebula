import { generateNotes } from "../lib/gemini";

function GeminiTest() {
  const testGemini = async () => {
    try {
      const result =
        await generateNotes(
          "Python",
          "Variables"
        );

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={testGemini}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Test Gemini
    </button>
  );
}

export default GeminiTest;