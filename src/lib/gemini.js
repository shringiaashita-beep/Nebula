import supabase from "./supabase";
import { getLanguageConfig } from "../config/languages";

const BACKEND_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai`;

/**
 * Converts any raw Gemini/backend error into a clean, user-friendly message.
 * Never leaks API URLs, JSON blobs, or technical error codes to the UI.
 */
const parseGeminiError = (error) => {
  console.error("Gemini API error:", error);

  const raw = error?.message || "";

  // Strip technical noise before pattern matching
  const msg = raw
    .replace(/\[GoogleGenerativeAI Error\]/gi, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\[{[\s\S]*?}\]/g, "")
    .toLowerCase();

  // No API key configured by user
  if (
    raw.includes("API_KEY_NOT_FOUND") ||
    raw.toLowerCase().includes("no api key configured") ||
    raw.toLowerCase().includes("please add one in settings")
  ) {
    return new Error(
      "No API key set up. Please go to Settings and add your Gemini API key to use AI features."
    );
  }

  // 403 – API not enabled / project disabled
  if (
    msg.includes("403") ||
    msg.includes("service_disabled") ||
    msg.includes("not been used in project") ||
    msg.includes("forbidden") ||
    msg.includes("not enabled")
  ) {
    return new Error(
      "The Gemini API is not enabled for your API key. Please enable it in your Google Cloud Console, then try again."
    );
  }

  // 404 – model deprecated / not found
  if (
    msg.includes("404") ||
    msg.includes("is not found") ||
    msg.includes("not supported for generatecontent") ||
    msg.includes("deprecated") ||
    msg.includes("model unavailable")
  ) {
    return new Error(
      "The AI model is temporarily unavailable. Please try again in a moment."
    );
  }

  // 429 – quota / rate limit
  if (
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit")
  ) {
    return new Error(
      "AI quota limit reached. Please wait a few minutes and try again."
    );
  }

  // 401 – invalid key / unauthenticated
  if (
    msg.includes("401") ||
    msg.includes("api_key_invalid") ||
    msg.includes("unauthenticated") ||
    msg.includes("invalid api key") ||
    msg.includes("api key not valid")
  ) {
    return new Error(
      "Your API key is invalid. Please go to Settings and check your Gemini API key."
    );
  }

  // Network failures
  if (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("load failed") ||
    msg.includes("network request failed")
  ) {
    return new Error(
      "Network error. Please check your internet connection and try again."
    );
  }

  // All AI models unavailable (our custom backend message)
  if (msg.includes("all ai models are currently unavailable")) {
    return new Error(
      "All AI models are currently unavailable. Please try again in a few minutes."
    );
  }

  // Generic fallback – aggressively strip all technical noise
  const clean = raw
    .replace(/\[GoogleGenerativeAI Error\]/gi, "")
    .replace(/Error fetching from[\s\S]*?:/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\[{[\s\S]*?}\]/g, "")
    .replace(/AI Error:\s*/gi, "")
    .replace(/\[\d+\s+\w+\]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return new Error(clean || "Something went wrong with AI. Please try again.");
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

      if (start !== -1 && end !== -1 && end > start) {
        let jsonText = cleaned.slice(start, end + 1);
        jsonText = jsonText.replace(/\\(?!["\\\/bfnrtu])/g, "\\\\");
        return JSON.parse(jsonText);
      }
    } catch (secondError) {
      console.error("JSON Parse Error:", secondError);
    }
    console.error("Original Gemini Response:", text);
    throw new Error("AI returned invalid JSON. Please try again.");
  }
};

/**
 * Generic function to call the backend proxy.
 */
const generateFromBackend = async (prompt) => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    throw new Error("You must be logged in to use AI features.");
  }

  // Fetch language preference
  let finalPrompt = prompt;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("language_preference")
      .eq("id", session.user.id)
      .single();

    if (profile && profile.language_preference) {
      const languageId = profile.language_preference.toLowerCase();
      if (languageId !== "english") {
        const langConfig = getLanguageConfig(languageId);
        finalPrompt = prompt + `\n\nIMPORTANT LANGUAGE REQUIREMENT: ${langConfig.promptInstruction}`;
      }
    }
  } catch (err) {
    console.error("Error fetching language pref:", err);
  }

  const response = await fetch(`${BACKEND_URL}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      prompt: finalPrompt,
      provider: "gemini",
      modelName: "gemini-1.5-flash"
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to generate content");
  }

  return data.text;
};

export const translateContent = async (textToTranslate, targetLanguageId) => {
  const langConfig = getLanguageConfig(targetLanguageId.toLowerCase());
  
  const prompt = `
Translate the following study notes exactly according to these rules:
1. Preserve all markdown formatting, bullet points, headings, and math equations (LaTeX).
2. ${langConfig.promptInstruction}

Text to translate:
${textToTranslate}
`;

  try {
    // We bypass generateFromBackend's internal injection to tightly control the prompt here
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error("You must be logged in to translate content.");
    }
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        prompt,
        provider: "gemini",
        modelName: "gemini-1.5-flash"
      })
    });
    
    if (!response.ok) throw new Error("Translation failed.");
    const data = await response.json();
    return data.text;
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateNotes = async (subject, topic) => {
  const prompt = `
Create extremely detailed, comprehensive, and thorough study notes for:
Subject: ${subject}
Topic: ${topic}

IMPORTANT INSTRUCTIONS:
- Do NOT write short summaries. Write highly in-depth, textbook-style detailed notes.
- Use structured headings, subheadings, and bullet points.
- Include mathematical derivations, equations (using LaTeX format like \\[ ... \\] or \\( ... \\)) where applicable.
- Include real-world practical examples, analogies, and case studies.
- Point out common pitfalls and mistakes students make in examinations.
- Provide scoring tips and step-by-step problem-solving strategies.

Use this Markdown format structure:
# Comprehensive Study Analysis: ${topic} (${subject})
## 🔬 Section 1: Foundational Framework and Theory
Detailed background theory here.
## 📐 Section 2: Mathematical Formulations & Derivations
Include formulas and LaTeX derivations.
## 💡 Section 3: Intuitive Analogies & Memory Hooks
Analogies and mnemonics.
## ⚠️ Section 4: Common Pitfalls & Corrective Action
Highlight common mistakes and how to avoid them.
## 🎯 Section 5: High-Scoring Exam Tactics
Scoring guidelines and tactical rules.
## 📝 Section 6: In-Depth Practice Exercises
Practice problems.
`;

  try {
    return await generateFromBackend(prompt);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateTopics = async (subject) => {
  const prompt = `
Generate 10 study topics for ${subject}.

Return only topic names.
One topic per line.
`;

  try {
    return await generateFromBackend(prompt);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateEliteChallenge = async (subject, topic) => {
  const prompt = `
You are an expert examiner.
Generate 30 highly difficult questions in clear markdown format.
Subject: ${subject}
Topic: ${topic}

Rules:
- Questions must be extremely challenging, testing deep conceptual understanding.
- Do not write basic definitions.
- Return ONLY a numbered list.
`;

  try {
    return await generateFromBackend(prompt);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateHardQuestions = async (subject, topic, count = 30) => {
  const prompt = `
Generate exactly ${count} hardest multiple-choice questions for:
Subject: ${subject}
Topic: ${topic}

IMPORTANT RULES:
- Return ONLY raw JSON.
- Do NOT write explanations.
- Do NOT write markdown code blocks like \`\`\`json.
- Do NOT write any conversational text before or after the JSON.

Format structure:
[
  {
    "question": "Question text here...",
    "option_a": "A) Option text...",
    "option_b": "B) Option text...",
    "option_c": "C) Option text...",
    "option_d": "D) Option text...",
    "correct_answer": "Option text exactly matching option_a, option_b, option_c, or option_d"
  }
]
`;

  try {
    const responseText = await generateFromBackend(prompt);

    return parseJsonResponse(responseText);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateRevisionPack = async (subject, topic) => {
  const prompt = `
Create a quick revision pack.
Subject: ${subject}
Topic: ${topic}

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do NOT wrap in \`\`\`json markdown blocks.
- Flashcard answers MUST be in a detailed, point-wise format using bullet points (e.g. "• Point 1\\n• Point 2").

JSON Format:
{
  "summary": "Detailed summary of the topic here...",
  "flashcards": [
    {
      "question": "Question text...",
      "answer": "• Point 1\\n• Point 2\\n• Point 3"
    }
  ],
  "mindmap": {
    "main_topic": "${topic}",
    "branches": [
      {
        "title": "Branch Title",
        "points": ["Subpoint 1", "Subpoint 2"]
      }
    ]
  }
}
`;

  try {
    const responseText = await generateFromBackend(prompt);
    return parseJsonResponse(responseText);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateFlashcards = async (subject, topic) => {
  const prompt = `
Create 10 comprehensive flashcards for:
Subject: ${subject}
Topic: ${topic}

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do NOT wrap in \`\`\`json markdown blocks.
- The flashcard answer field MUST be in a detailed, point-wise format using bullet points (e.g. "• Point 1\\n• Point 2\\n• Point 3").

JSON Format:
[
  {
    "question": "Question text here?",
    "answer": "• Point-wise explanation point 1.\\n• Point-wise explanation point 2.\\n• Point-wise explanation point 3."
  }
]
`;

  try {
    const responseText = await generateFromBackend(prompt);
    return parseJsonResponse(responseText);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateMindMap = async (subject, topic) => {
  const prompt = `
Create a comprehensive study mind map for:
Subject: ${subject}
Topic: ${topic}

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do NOT wrap in \`\`\`json markdown blocks.

JSON Format:
{
  "main_topic": "${topic}",
  "branches": [
    {
      "title": "Subtopic Branch Title",
      "points": ["Key factor 1", "Key factor 2", "Important metric 3"]
    }
  ]
}
`;

  try {
    const responseText = await generateFromBackend(prompt);
    return parseJsonResponse(responseText);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const askTutor = async (subject, topic, question) => {
  const prompt = `
You are an expert tutor.
Subject: ${subject}
Topic: ${topic}

Student Question:
${question}

Answer in the same language used by the student.
Be clear, educational, and detailed.
`;

  try {
    return await generateFromBackend(prompt);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generateMysteryTopic = async (subject) => {
  const prompt = `
Choose ONE interesting topic from ${subject}.

Return EXACTLY in this format:
TOPIC:
<topic>

EXPLANATION:
<detailed explanation of why this topic matters>

CHALLENGE:
<one challenging conceptual practice question>

Keep it motivating and highly educational.
`;

  try {
    return await generateFromBackend(prompt);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const generatePYQQuiz = async (exam) => {
  const prompt = `
Generate exactly 20 MCQs for ${exam}.

Return ONLY valid JSON.

[
  {
    "id": 1,
    "question": "Question here",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": "Option A",
    "explanation": "Short explanation"
  }
]

STRICT RULES:
- Return only JSON, no markdown code block wraps.
- Every question must contain id, question, options, correctAnswer and explanation.
`;

  try {
    const responseText = await generateFromBackend(prompt);
    return parseJsonResponse(responseText);
  } catch (error) {
    throw parseGeminiError(error);
  }
};

export const translateQuestionToHindi = async (questionObj) => {
  const prompt = `
You are a professional educational translator. Translate the following examination question, options, and explanation into Hindi (using Devanagari script).

JSON input:
${JSON.stringify({
  question: questionObj.question,
  option_a: questionObj.option_a,
  option_b: questionObj.option_b,
  option_c: questionObj.option_c,
  option_d: questionObj.option_d,
  explanation: questionObj.explanation
})}

Return ONLY raw translated JSON matching this exact structure:
{
  "question": "translated text",
  "option_a": "translated text",
  "option_b": "translated text",
  "option_c": "translated text",
  "option_d": "translated text",
  "explanation": "translated text"
}

Do NOT write markdown wrap. Do NOT write anything else.
`;

  try {
    const responseText = await generateFromBackend(prompt);
    return parseJsonResponse(responseText);
  } catch (err) {
    console.error("Translation failed:", err);
    return null;
  }
};
