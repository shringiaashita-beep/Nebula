import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const geminiApiKey = process.env.VITE_GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
  console.error("Missing environment variables in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// JEE Advanced topics - hardest chapters from all 3 subjects
const advancedTopics = {
  Physics: [
    "Rotational Dynamics and Angular Momentum",
    "Electromagnetic Induction and AC Circuits",
    "Wave Optics and Interference",
    "Modern Physics and Nuclear Reactions",
    "Thermodynamics and Heat Engines",
    "Electrostatics and Gauss Law",
    "Current Electricity and Kirchhoff Laws",
    "Fluid Mechanics and Bernoulli Theorem"
  ],
  Chemistry: [
    "Chemical Bonding and Hybridization",
    "Chemical Equilibrium and Le Chatelier Principle",
    "Electrochemistry and Nernst Equation",
    "Organic Reaction Mechanisms",
    "Coordination Chemistry",
    "Chemical Kinetics and Arrhenius Equation",
    "p-Block Elements",
    "Biomolecules and Polymers"
  ],
  Mathematics: [
    "Definite Integration and Area Under Curves",
    "Differential Equations",
    "Complex Numbers and De Moivre Theorem",
    "Probability and Bayes Theorem",
    "Conic Sections and Parametric Equations",
    "Matrices and Determinants",
    "Vectors and 3D Geometry",
    "Permutations and Combinations"
  ]
};

const years = [2019, 2020, 2021, 2022, 2023, 2024];

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateHardBatch(subject, topic, count) {
  const prompt = `
Generate exactly ${count} EXTREMELY DIFFICULT multiple choice questions at JEE Advanced level.
Subject: ${subject}
Topic: ${topic}

RULES:
- These must be genuine JEE Advanced style — deep conceptual, multi-step reasoning required
- Questions can involve integer type numerical answers, paragraph-based reasoning, or tricky MCQs
- Return ONLY raw JSON. No markdown. No extra text.
- difficulty field MUST be "Hard"

JSON Schema:
[
  {
    "exam": "JEE Advanced",
    "subject": "${subject}",
    "topic": "${topic}",
    "year": 2023,
    "shift": "Paper 1",
    "question_no": 1,
    "question": "Question text with full context...",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_answer": "Option A",
    "difficulty": "Hard",
    "explanation": "Step-by-step solution here..."
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error("Not a JSON array");
    return parsed;
  } catch (error) {
    console.warn(`Failed generating for ${subject} - ${topic}:`, error.message);
    return null;
  }
}

async function seed() {
  console.log("🚀 Starting JEE Advanced HARD question seeder...\n");

  let totalInserted = 0;

  for (const subject of Object.keys(advancedTopics)) {
    console.log(`\n========================================`);
    console.log(`📚 Subject: ${subject}`);
    console.log(`========================================`);

    for (const topic of advancedTopics[subject]) {
      console.log(`  → Generating HARD questions for: ${topic}...`);

      let attempts = 0;
      let batch = null;

      while (attempts < 3 && !batch) {
        attempts++;
        batch = await generateHardBatch(subject, topic, 5);
        if (!batch) {
          console.log(`    Attempt ${attempts} failed. Retrying in 5s...`);
          await delay(5000);
        }
      }

      if (batch && batch.length > 0) {
        const rows = batch.map((q, idx) => ({
          ...q,
          difficulty: "Hard",
          year: years[Math.floor(Math.random() * years.length)],
          shift: Math.random() > 0.5 ? "Paper 1" : "Paper 2",
          question_no: idx + 1
        }));

        const { error } = await supabase.from("pyq_questions").insert(rows);
        if (error) {
          console.error(`    ❌ Insert error for ${topic}:`, error.message);
        } else {
          totalInserted += rows.length;
          console.log(`    ✅ Inserted ${rows.length} Hard questions`);
        }
      } else {
        console.warn(`    ⚠️ Skipping ${topic} — generation failed`);
      }

      await delay(2000);
    }
  }

  console.log(`\n✅ JEE Advanced Hard seeder complete! Total inserted: ${totalInserted} questions`);
}

seed();
