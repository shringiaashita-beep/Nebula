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
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (firstError) {
    try {
      let cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const start = cleaned.indexOf("[");
      const end = cleaned.lastIndexOf("]");

      if (
        start !== -1 &&
        end !== -1 &&
        end > start
      ) {
        let jsonText = cleaned.slice(
          start,
          end + 1
        );

        jsonText = jsonText.replace(
          /\\(?!["\\/bfnrtu])/g,
          "\\\\"
        );

        return JSON.parse(jsonText);
      }
    } catch (secondError) {
      console.error(
        "JSON Parse Error:",
        secondError
      );
    }

    console.error(
      "Original Gemini Response:",
      text
    );

    throw new Error(
      "AI returned invalid JSON. Please try again."
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

IMPORTANT RULES:

Return ONLY raw JSON.

Do NOT write explanations.
Do NOT write markdown.
Do NOT wrap output inside \`\`\`json.
Do NOT write any text before or after JSON.

Format:

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

    const responseText =
      result.response.text();

    console.log(
      "Gemini Questions Response:",
      responseText
    );

    return parseJsonResponse(
      responseText
    );
  } catch (error) {
    throw parseGeminiError(error);
  }
};
export const generateRevisionPack =
  async (subject, topic) => {
    const prompt = `
Create a quick revision pack.

Subject: ${subject}
Topic: ${topic}

Return ONLY valid JSON.

{
  "summary":"",
  "flashcards":[
    {
      "question":"",
      "answer":""
    }
  ],
  "mindmap":{
    "main_topic":"",
    "branches":[
      {
        "title":"",
        "points":[]
      }
    ]
  }
}
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
  export const generateFlashcards =
  async (subject, topic) => {
    const prompt = `
Create 10 flashcards.

Subject: ${subject}
Topic: ${topic}

Return ONLY valid JSON.

[
  {
    "question":"",
    "answer":""
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
  export const generateMindMap =
  async (subject, topic) => {
    const prompt = `
Create a study mind map.

Subject: ${subject}
Topic: ${topic}

Return ONLY valid JSON.

{
  "main_topic":"",
  "branches":[
    {
      "title":"",
      "points":[]
    }
  ]
}
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
  export const askTutor = async (
  subject,
  topic,
  question
) => {
  const prompt = `
You are an expert tutor.

Subject: ${subject}
Topic: ${topic}

Student Question:
${question}

Answer in the same language
used by the student.

Be clear and educational.
`;

  const result =
    await model.generateContent(
      prompt
    );

  return result.response.text();
};