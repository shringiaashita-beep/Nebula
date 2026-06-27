import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
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
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const topicsBySubject = {
  Physics: [
    "Electrostatics",
    "Current Electricity",
    "Magnetic Effects of Current and Magnetism",
    "Electromagnetic Induction and Alternating Currents",
    "Optics",
    "Dual Nature of Matter and Radiation",
    "Atoms and Nuclei",
    "Electronic Devices",
    "Kinematics and Laws of Motion",
    "Work, Energy and Power",
    "Rotational Motion",
    "Gravitation",
    "Thermodynamics",
    "Oscillations and Waves",
    "Modern Physics"
  ],
  Chemistry: [
    "Some Basic Concepts in Chemistry",
    "States of Matter",
    "Atomic Structure",
    "Chemical Bonding and Molecular Structure",
    "Chemical Thermodynamics",
    "Solutions",
    "Equilibrium",
    "Redox Reactions and Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
    "General Organic Chemistry",
    "Hydrocarbons",
    "Organic Compounds Containing Halogens",
    "Organic Compounds Containing Oxygen",
    "Biomolecules and Polymers"
  ],
  Mathematics: [
    "Sets, Relations and Functions",
    "Complex Numbers and Quadratic Equations",
    "Matrices and Determinants",
    "Permutations and Combinations",
    "Mathematical Inductions",
    "Binomial Theorem",
    "Sequences and Series",
    "Limit, Continuity and Differentiability",
    "Integral Calculus",
    "Differential Equations",
    "Coordinate Geometry",
    "Three Dimensional Geometry",
    "Vector Algebra",
    "Statistics and Probability",
    "Trigonometry"
  ]
};

const years = [2021, 2022, 2023, 2024, 2025];
const shifts = ["January Shift 1", "January Shift 2", "April Shift 1", "April Shift 2"];

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateBatch(subject, topic, count) {
  const prompt = `
Generate exactly ${count} multiple choice questions matching JEE Main standard.
Subject: ${subject}
Topic: ${topic}

STRICT OUTPUT RULES:
- Return ONLY raw JSON array.
- Do NOT wrap output inside \`\`\`json or any markdown formatting.
- Do NOT output any other text or characters.
- Follow the JSON schema below precisely.

JSON Schema:
[
  {
    "exam": "JEE Main",
    "subject": "${subject}",
    "topic": "${topic}",
    "year": 2024,
    "shift": "January Shift 1",
    "question_no": 1,
    "question": "Question text here...",
    "option_a": "Option A text...",
    "option_b": "Option B text...",
    "option_c": "Option C text...",
    "option_d": "Option D text...",
    "correct_answer": "Option A"
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
    if (!Array.isArray(parsed)) {
      throw new Error("Gemini response is not a JSON array.");
    }
    return parsed;
  } catch (error) {
    console.warn(`Failed generating for ${subject} - ${topic}:`, error.message);
    return null;
  }
}

async function seed() {
  console.log("Starting seeder script for JEE Main database...");
  
  for (const subject of Object.keys(topicsBySubject)) {
    console.log(`\n==========================================`);
    console.log(`Processing Subject: ${subject}`);
    console.log(`==========================================`);
    
    const topics = topicsBySubject[subject];
    let insertedCount = 0;
    
    // We want at least 150 questions per subject.
    // 15 topics, generating 10 questions per topic = 150 questions.
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      console.log(`[${insertedCount}/150] Generating for Topic: ${topic}...`);
      
      let attempts = 0;
      let success = false;
      let batch = [];
      
      while (attempts < 3 && !success) {
        attempts++;
        batch = await generateBatch(subject, topic, 10);
        if (batch && batch.length > 0) {
          success = true;
        } else {
          console.log(`Attempt ${attempts} failed. Retrying in 5 seconds...`);
          await delay(5000);
        }
      }
      
      if (success && batch.length > 0) {
        const randomizedBatch = batch.map((q, idx) => ({
          ...q,
          year: years[Math.floor(Math.random() * years.length)],
          shift: shifts[Math.floor(Math.random() * shifts.length)],
          question_no: idx + 1
        }));
        
        const { error } = await supabase.from("pyq_questions").insert(randomizedBatch);
        if (error) {
          console.error(`Error inserting batch for ${topic}:`, error.message);
        } else {
          insertedCount += randomizedBatch.length;
          console.log(`Successfully generated and inserted ${randomizedBatch.length} questions.`);
        }
      } else {
        console.error(`Skipping topic ${topic} due to generation failures.`);
      }
      
      await delay(2000);
    }
    
    console.log(`Finished ${subject}. Total inserted: ${insertedCount} questions.`);
  }
  
  console.log("\nJEE Main Seeding complete!");
}

seed();
