import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const parseGeminiError = (error) => {
  console.error("Gemini API error:", error);

  if (
    error?.message?.includes("quota") ||
    error?.message?.includes("Quota")
  ) {
    return new Error(
      "AI quota exceeded. Please wait for the quota to reset or upgrade your Gemini plan."
    );
  }

  return error;
};

const parseJsonResponse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]");

    if (
      start !== -1 &&
      end !== -1 &&
      end > start
    ) {
      return JSON.parse(
        text.slice(start, end + 1)
      );
    }

    throw new Error(
      "Unable to parse AI response."
    );
  }
};

export const generateNotes = async (
  subject,
  topic
) => {
  const prompt = `
Create detailed study notes.

Subject: ${subject}
Topic: ${topic}

Use headings, subheadings, bullet points and examples.
`;

  try {
    const result =
      await model.generateContent(
        prompt
      );

    return result.response.text();
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateTopics = async (
  subject
) => {
  const prompt = `
Generate 10 study topics for ${subject}.

Return only topic names.

One topic per line.
`;

  try {
    const result =
      await model.generateContent(
        prompt
      );

    return result.response.text();
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateEliteChallenge = async (
  subject,
  topic
) => {
  const prompt = `
You are an expert examiner.

Generate 30 highly difficult questions.

Subject: ${subject}
Topic: ${topic}

Rules:
- Questions must be extremely challenging.
- Test deep understanding.
- No basic definitions.
- Include analytical questions.
- Include application-based questions.
- Include tricky conceptual questions.
- Include problem-solving questions.

Return ONLY a numbered list.
`;

  try {
    const result =
      await model.generateContent(
        prompt
      );

    return result.response.text();
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateHardQuestions = async (
  subject,
  topic,
  count = 30
) => {
  const prompt = `
Generate ${count} hardest multiple-choice questions.

Subject: ${subject}
Topic: ${topic}

Return only valid JSON:

[
 {
   "question":"",
   "option_a":"",
   "option_b":"",
   "option_c":"",
   "option_d":"",
   "correct_answer":""
 }
]
`;

  try {
    const result =
      await model.generateContent(
        prompt
      );

    return parseJsonResponse(
      result.response.text()
    );
  } catch (error) {
    throw parseGeminiError(error);
  }
};