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
  console.error("❌ Missing environment variables in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ============================================================
// ALL COMPETITIVE EXAMS — Topics + Difficulty Map
// ============================================================
const ALL_EXAMS = [
  {
    exam: "JEE Main",
    difficulty: "Hard",
    subjects: {
      Physics: ["Rotational Motion", "Electromagnetic Induction", "Wave Optics", "Modern Physics", "Thermodynamics"],
      Chemistry: ["Chemical Equilibrium", "Electrochemistry", "Organic Reaction Mechanisms", "Coordination Chemistry", "Chemical Kinetics"],
      Mathematics: ["Definite Integration", "Differential Equations", "Complex Numbers", "Probability", "Conic Sections"]
    }
  },
  {
    exam: "JEE Advanced",
    difficulty: "Hard",
    subjects: {
      Physics: ["Mechanics and Newton Laws", "Electrostatics and Gauss Law", "Electromagnetic Waves", "Nuclear Physics", "Fluid Mechanics"],
      Chemistry: ["p-Block and d-Block Elements", "Organic Named Reactions", "Thermodynamics and Gibb Energy", "Chemical Bonding", "Biomolecules"],
      Mathematics: ["Matrices and Determinants", "Vectors and 3D Geometry", "Permutations and Combinations", "Binomial Theorem", "Sequences and Series"]
    }
  },
  {
    exam: "NEET",
    difficulty: "Hard",
    subjects: {
      Biology: ["Genetics and Molecular Basis of Inheritance", "Ecology and Ecosystem", "Human Physiology", "Plant Physiology", "Biotechnology"],
      Physics: ["Optics and Wave Nature of Light", "Electrostatics", "Thermodynamics", "Modern Physics", "Current Electricity"],
      Chemistry: ["Biomolecules", "Organic Chemistry", "Coordination Compounds", "Chemical Kinetics", "Electrochemistry"]
    }
  },
  {
    exam: "UPSC",
    difficulty: "Hard",
    subjects: {
      History: ["Modern Indian History", "Ancient History and Civilizations", "World History Post-WW2", "Indian Freedom Struggle", "Post Independence India"],
      Geography: ["Geomorphology and Landforms", "Climatology", "Economic Geography", "Human Geography", "Indian Geography"],
      "Political Science": ["Indian Constitution", "International Relations", "Public Administration", "Governance and Policy", "Parliamentary System"],
      Economics: ["Macroeconomics", "Indian Economy", "Planning and Development", "International Trade", "Fiscal Policy"]
    }
  },
  {
    exam: "RAS",
    difficulty: "Hard",
    subjects: {
      "Rajasthan GK": ["Rajasthan History", "Rajasthan Culture and Traditions", "Rajasthan Geography", "Rajasthan Economy", "Rajasthan Polity"],
      History: ["Medieval Rajasthan", "Modern Rajasthan", "Ancient Rajput Kingdoms", "Freedom Struggle in Rajasthan", "Post Independence"],
      Geography: ["Physical Geography of Rajasthan", "Rivers and Water Bodies", "Agriculture and Soils", "Climate Zones", "Mineral Resources"]
    }
  },
  {
    exam: "REET",
    difficulty: "Hard",
    subjects: {
      "Child Development": ["Theories of Development", "Learning and Motivation", "Inclusive Education", "Assessment and Evaluation", "Piaget and Vygotsky"],
      Pedagogy: ["Teaching Methods", "Curriculum Design", "Classroom Management", "Learning Difficulties", "Educational Psychology"],
      "Teaching Aptitude": ["Communication Skills", "Critical Thinking", "Problem Solving in Education", "Professional Ethics", "Educational Technology"]
    }
  },
  {
    exam: "GATE",
    difficulty: "Hard",
    subjects: {
      "Engineering Maths": ["Linear Algebra", "Calculus and Differential Equations", "Complex Analysis", "Probability and Statistics", "Numerical Methods"],
      "Core Subject": ["Data Structures and Algorithms", "Operating Systems", "Database Management", "Computer Networks", "Digital Logic"],
      Aptitude: ["Quantitative Reasoning", "Verbal Ability", "Analytical Reasoning", "Data Interpretation", "Logical Deduction"]
    }
  },
  {
    exam: "CAT",
    difficulty: "Hard",
    subjects: {
      Quant: ["Number Theory", "Algebra and Quadratic Equations", "Geometry and Mensuration", "Permutations and Combinations", "Time Speed Distance"],
      DILR: ["Data Interpretation Sets", "Logical Reasoning Puzzles", "Seating Arrangement", "Data Sufficiency", "Critical Path Analysis"],
      VARC: ["Reading Comprehension", "Para Jumbles", "Sentence Correction", "Critical Reasoning", "Vocabulary in Context"]
    }
  },
  {
    exam: "CUET",
    difficulty: "Hard",
    subjects: {
      "General Test": ["Quantitative Reasoning", "Logical and Analytical Reasoning", "General Knowledge", "Current Affairs", "Numerical Ability"],
      English: ["Reading Comprehension", "Vocabulary and Grammar", "Sentence Rearrangement", "Error Detection", "Passage Completion"],
      "Domain Subject": ["Business Studies", "Accountancy", "Economics", "Political Science", "Sociology"]
    }
  }
];

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateBatch(exam, subject, topic, difficulty, count = 5) {
  const difficultyInstruction = difficulty === "Hard"
    ? "These must be genuinely HARD — multi-step reasoning, deep conceptual understanding required. No trivial questions."
    : difficulty === "Easy"
    ? "These should be EASY — straightforward recall, basic understanding, direct questions."
    : "These should be MEDIUM — moderate reasoning required.";

  const prompt = `
Generate exactly ${count} multiple choice questions for competitive exam.
Exam: ${exam}
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

${difficultyInstruction}

STRICT RULES:
- Return ONLY raw JSON array. NO markdown. NO backticks. NO extra text.
- correct_answer must be EXACTLY one of: "A", "B", "C", or "D"
- Include a short explanation for each answer

JSON Schema (follow EXACTLY):
[
  {
    "exam": "${exam}",
    "subject": "${subject}",
    "topic": "${topic}",
    "difficulty": "${difficulty}",
    "year": 2024,
    "question_no": 1,
    "question": "Full question text here...",
    "option_a": "Option A text",
    "option_b": "Option B text",
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_answer": "A",
    "explanation": "Brief explanation of correct answer"
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error("Not a JSON array");
    return parsed;
  } catch (error) {
    console.warn(`    ⚠ Failed: ${error.message}`);
    return null;
  }
}

async function seed() {
  console.log("🚀 Starting FULL COMPETITIVE EXAM Hard Question Seeder...\n");
  console.log(`📋 Covering: JEE Main, JEE Advanced, NEET, UPSC, RAS, REET, GATE, CAT, CUET\n`);

  let grandTotal = 0;

  for (const examConfig of ALL_EXAMS) {
    const { exam, difficulty, subjects } = examConfig;
    console.log(`\n${"=".repeat(55)}`);
    console.log(`🎯 EXAM: ${exam} | Difficulty: ${difficulty}`);
    console.log(`${"=".repeat(55)}`);

    let examTotal = 0;

    for (const [subject, topics] of Object.entries(subjects)) {
      console.log(`\n  📚 Subject: ${subject}`);

      for (const topic of topics) {
        process.stdout.write(`    → ${topic}... `);

        let attempts = 0;
        let batch = null;

        while (attempts < 3 && !batch) {
          attempts++;
          batch = await generateBatch(exam, subject, topic, difficulty, 5);
          if (!batch) {
            process.stdout.write(`retry ${attempts}... `);
            await delay(4000);
          }
        }

        if (batch && batch.length > 0) {
          // Sanitize rows before insert
          const rows = batch.map((q, idx) => ({
            exam: exam,
            subject: subject,
            topic: topic,
            difficulty: difficulty,
            year: q.year || 2024,
            shift: q.shift || "Session 1",
            question_no: idx + 1,
            question: q.question || "",
            option_a: q.option_a || "",
            option_b: q.option_b || "",
            option_c: q.option_c || "",
            option_d: q.option_d || "",
            correct_answer: (q.correct_answer || "A").charAt(0).toUpperCase(),
            explanation: q.explanation || "",
          }));

          const { error } = await supabase.from("pyq_questions").insert(rows);
          if (error) {
            console.log(`❌ Insert error: ${error.message}`);
          } else {
            examTotal += rows.length;
            grandTotal += rows.length;
            console.log(`✅ +${rows.length}`);
          }
        } else {
          console.log(`⛔ Skipped`);
        }

        await delay(1500);
      }
    }

    console.log(`\n  ✅ ${exam} total inserted: ${examTotal} Hard questions`);
  }

  console.log(`\n${"=".repeat(55)}`);
  console.log(`🎉 SEEDING COMPLETE! Grand Total: ${grandTotal} questions added`);
  console.log(`${"=".repeat(55)}\n`);
}

seed();
