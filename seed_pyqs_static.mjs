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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const years = [2021, 2022, 2023, 2024, 2025];
const shifts = ["January Shift 1", "January Shift 2", "April Shift 1", "April Shift 2"];

// Helper to shuffle options and track the correct answer
function buildMCQ(questionText, correctVal, wrongVals) {
  const optionsList = [
    { text: correctVal, isCorrect: true },
    ...wrongVals.map(v => ({ text: v, isCorrect: false }))
  ];
  
  // Deterministic shuffle using a simple helper
  for (let i = optionsList.length - 1; i > 0; i--) {
    const j = (i * 7) % (i + 1); // pseudo-random deterministic swap
    const temp = optionsList[i];
    optionsList[i] = optionsList[j];
    optionsList[j] = temp;
  }

  const correctIndex = optionsList.findIndex(o => o.isCorrect);
  const correctOptionLetter = ["Option A", "Option B", "Option C", "Option D"][correctIndex];

  return {
    question: questionText,
    option_a: optionsList[0].text,
    option_b: optionsList[1].text,
    option_c: optionsList[2].text,
    option_d: optionsList[3].text,
    correct_answer: correctOptionLetter
  };
}

// Procedural Generator for Mathematics (150 Questions)
function generateMathQuestions() {
  const list = [];
  const topic = "Matrices and Algebra";
  
  // 1. Matrix Determinant templates (15 variants)
  for (let i = 1; i <= 15; i++) {
    const a = i * 2;
    const b = i + 3;
    const det = a * a - b;
    const q = buildMCQ(
      `Find the determinant of the 2x2 matrix A = [[${a}, ${b}], [1, ${a}]].`,
      `${det}`,
      [`${det + 5}`, `${det - 3}`, `${det + 2}`]
    );
    list.push({ ...q, topic, subject: "Mathematics" });
  }

  // 2. Quadratic equation roots templates (15 variants)
  for (let i = 1; i <= 15; i++) {
    const p = i + 1;
    const q_val = i * 3;
    const sum = p + q_val;
    const prod = p * q_val;
    const q = buildMCQ(
      `If the roots of the quadratic equation x^2 - ${sum}x + k = 0 are ${p} and ${q_val}, find the value of k.`,
      `${prod}`,
      [`${prod + 4}`, `${prod - 2}`, `${prod + 10}`]
    );
    list.push({ ...q, topic: "Quadratic Equations", subject: "Mathematics" });
  }

  // 3. Limits templates (15 variants)
  for (let i = 1; i <= 15; i++) {
    const a = i + 2;
    const b = i * 2;
    const ans = (a / b).toFixed(2);
    const q = buildMCQ(
      `Evaluate the limit as x approaches 0: lim (sin(${a}x)) / (${b}x).`,
      `${ans}`,
      [`${(a / (b + 1)).toFixed(2)}`, `${(a * 2 / b).toFixed(2)}`, `1.00`]
    );
    list.push({ ...q, topic: "Limits & Continuity", subject: "Mathematics" });
  }

  // 4. Arithmetic Progression templates (15 variants)
  for (let i = 1; i <= 15; i++) {
    const a1 = i * 3;
    const d = i + 1;
    const n = 10;
    const an = a1 + (n - 1) * d;
    const q = buildMCQ(
      `For an Arithmetic Progression, if the first term is ${a1} and the common difference is ${d}, find the 10th term.`,
      `${an}`,
      [`${an + 5}`, `${an - 5}`, `${an + d}`]
    );
    list.push({ ...q, topic: "Sequences & Series", subject: "Mathematics" });
  }

  // 5. Differential Equations order templates (15 variants)
  for (let i = 1; i <= 15; i++) {
    const order = (i % 3) + 2;
    const degree = (i % 2) + 1;
    const q = buildMCQ(
      `Find the sum of order and degree of the differential equation: (d^${order}y/dx^${order})^${degree} + dy/dx + y = 0.`,
      `${order + degree}`,
      [`${order}`, `${degree}`, `${order * degree}`]
    );
    list.push({ ...q, topic: "Differential Equations", subject: "Mathematics" });
  }

  // 6. Vector dot product templates (15 variants)
  for (let i = 1; i <= 15; i++) {
    const a = i;
    const b = i + 2;
    const c = 3;
    const dot = a * 2 + b * (-1) + c * 3;
    const q = buildMCQ(
      `Find the dot product of vectors u = ${a}i + ${b}j + ${c}k and v = 2i - j + 3k.`,
      `${dot}`,
      [`${dot + 4}`, `${dot - 4}`, `0`]
    );
    list.push({ ...q, topic: "Vector Algebra", subject: "Mathematics" });
  }

  // 7. Binomial coefficients templates (15 variants)
  for (let i = 1; i <= 15; i++) {
    const n = i + 4;
    const terms = n + 1;
    const q = buildMCQ(
      `Find the number of terms in the expansion of (x + y)^${n}.`,
      `${terms}`,
      [`${n}`, `${n - 1}`, `${terms + 1}`]
    );
    list.push({ ...q, topic: "Binomial Theorem", subject: "Mathematics" });
  }

  // 8. Probability coin tosses (15 variants)
  for (let i = 1; i <= 15; i++) {
    const tosses = (i % 3) + 3; // 3, 4, 5
    const outcomes = Math.pow(2, tosses);
    const q = buildMCQ(
      `If a fair coin is tossed ${tosses} times, find the total number of possible outcomes.`,
      `${outcomes}`,
      [`${tosses * 2}`, `${outcomes - 2}`, `${outcomes + 4}`]
    );
    list.push({ ...q, topic: "Probability", subject: "Mathematics" });
  }

  // 9. Coordinate Geometry straight lines (15 variants)
  for (let i = 1; i <= 15; i++) {
    const m = i;
    const perp_m = (-1 / m).toFixed(2);
    const q = buildMCQ(
      `Find the slope of a line perpendicular to the line with slope ${m}.`,
      `${perp_m}`,
      [`-${m}`, `${m}`, `${(1 / m).toFixed(2)}`]
    );
    list.push({ ...q, topic: "Coordinate Geometry", subject: "Mathematics" });
  }

  // 10. Trigonometric identity values (15 variants)
  for (let i = 1; i <= 15; i++) {
    const angle = i * 10;
    const ans = "1";
    const q = buildMCQ(
      `Evaluate: sin^2(${angle}°) + cos^2(${angle}°).`,
      `${ans}`,
      [`0`, `-1`, `2`]
    );
    list.push({ ...q, topic: "Trigonometry", subject: "Mathematics" });
  }

  return list;
}

// Procedural Generator for Physics (150 Questions)
function generatePhysicsQuestions() {
  const list = [];

  // 1. Kinematics acceleration (15 variants)
  for (let i = 1; i <= 15; i++) {
    const a = i * 2;
    const t = i + 1;
    const dist = 0.5 * a * t * t;
    const q = buildMCQ(
      `A car starts from rest and accelerates uniformly at ${a} m/s^2. Find the distance traveled in ${t} seconds.`,
      `${dist} m`,
      [`${dist + 10} m`, `${dist - 5} m`, `${dist * 2} m`]
    );
    list.push({ ...q, topic: "Kinematics", subject: "Physics" });
  }

  // 2. Ohm's Law resistors (15 variants)
  for (let i = 1; i <= 15; i++) {
    const r = i * 5;
    const v = i * 10;
    const current = (v / r).toFixed(1);
    const q = buildMCQ(
      `A resistor of ${r} ohms is connected across a potential difference of ${v} V. Find the current flowing through it.`,
      `${current} A`,
      [`${(current * 1.5).toFixed(1)} A`, `${(current / 2).toFixed(1)} A`, `0 A`]
    );
    list.push({ ...q, topic: "Current Electricity", subject: "Physics" });
  }

  // 3. Kinetic energy (15 variants)
  for (let i = 1; i <= 15; i++) {
    const m = i * 2;
    const v = i + 3;
    const ke = 0.5 * m * v * v;
    const q = buildMCQ(
      `A body of mass ${m} kg is moving with a velocity of ${v} m/s. Find its kinetic energy.`,
      `${ke} J`,
      [`${ke + 25} J`, `${ke - 10} J`, `${ke * 1.5} J`]
    );
    list.push({ ...q, topic: "Work, Energy & Power", subject: "Physics" });
  }

  // 4. Force & Newton's Laws (15 variants)
  for (let i = 1; i <= 15; i++) {
    const m = i + 1;
    const a = i * 3;
    const force = m * a;
    const q = buildMCQ(
      `Find the force required to accelerate a mass of ${m} kg at a rate of ${a} m/s^2.`,
      `${force} N`,
      [`${force + 8} N`, `${force - 4} N`, `${force * 2} N`]
    );
    list.push({ ...q, topic: "Laws of Motion", subject: "Physics" });
  }

  // 5. Gravitational force proportional (15 variants)
  for (let i = 1; i <= 15; i++) {
    const distFactor = i + 1;
    const forceFactor = (1 / (distFactor * distFactor)).toFixed(3);
    const q = buildMCQ(
      `If the distance between two masses is increased by a factor of ${distFactor}, the gravitational force between them changes by a factor of:`,
      `${forceFactor}`,
      [`${distFactor}`, `${(1 / distFactor).toFixed(3)}`, `${distFactor * distFactor}`]
    );
    list.push({ ...q, topic: "Gravitation", subject: "Physics" });
  }

  // 6. Capacitors in parallel (15 variants)
  for (let i = 1; i <= 15; i++) {
    const c1 = i;
    const c2 = i + 3;
    const total = c1 + c2;
    const q = buildMCQ(
      `Find the equivalent capacitance of two capacitors ${c1} μF and ${c2} μF connected in parallel.`,
      `${total} μF`,
      [`${(c1 * c2 / (c1 + c2)).toFixed(2)} μF`, `${total + 2} μF`, `${total - 1} μF`]
    );
    list.push({ ...q, topic: "Electrostatics", subject: "Physics" });
  }

  // 7. Wave frequency and wavelength (15 variants)
  for (let i = 1; i <= 15; i++) {
    const lambda = i * 0.1;
    const v = 340;
    const freq = Math.round(v / lambda);
    const q = buildMCQ(
      `A sound wave traveling at 340 m/s has a wavelength of ${lambda.toFixed(2)} m. Find its frequency.`,
      `${freq} Hz`,
      [`${freq + 100} Hz`, `${freq - 50} Hz`, `${Math.round(freq / 2)} Hz`]
    );
    list.push({ ...q, topic: "Oscillations & Waves", subject: "Physics" });
  }

  // 8. Photoelectric work function (15 variants)
  for (let i = 1; i <= 15; i++) {
    const ev = (i * 0.5 + 1.5).toFixed(2);
    const q = buildMCQ(
      `If the work function of a metal is ${ev} eV, find the threshold energy required to eject photoelectrons.`,
      `${ev} eV`,
      [`${(ev * 1.5).toFixed(2)} eV`, `${(ev - 1).toFixed(2)} eV`, `0 eV`]
    );
    list.push({ ...q, topic: "Modern Physics", subject: "Physics" });
  }

  // 9. Transformer turns ratio (15 variants)
  for (let i = 1; i <= 15; i++) {
    const np = i * 100;
    const ns = i * 20;
    const ratio = (np / ns).toFixed(0);
    const q = buildMCQ(
      `A transformer has ${np} primary turns and ${ns} secondary turns. Find the turns ratio (Np/Ns).`,
      `${ratio}`,
      [`${(ns / np).toFixed(2)}`, `${ratio * 2}`, `${ratio - 1}`]
    );
    list.push({ ...q, topic: "Electromagnetic Induction", subject: "Physics" });
  }

  // 10. Lens power (15 variants)
  for (let i = 1; i <= 15; i++) {
    const f = (i * 0.1).toFixed(2);
    const power = (1 / f).toFixed(2);
    const q = buildMCQ(
      `Find the power of a convex lens with a focal length of ${f} m.`,
      `${power} D`,
      [`-${power} D`, `${(power * 2).toFixed(2)} D`, `1.50 D`]
    );
    list.push({ ...q, topic: "Optics", subject: "Physics" });
  }

  return list;
}

// Procedural Generator for Chemistry (150 Questions)
function generateChemistryQuestions() {
  const list = [];

  // 1. Mole concepts (15 variants)
  for (let i = 1; i <= 15; i++) {
    const mass = i * 4;
    const moles = (mass / 40).toFixed(2); // NaOH molecular weight ~40
    const q = buildMCQ(
      `Find the number of moles in ${mass} g of Sodium Hydroxide (NaOH, molar mass = 40 g/mol).`,
      `${moles} moles`,
      [`${(moles * 2).toFixed(2)} moles`, `${(moles / 2).toFixed(2)} moles`, `1.00 moles`]
    );
    list.push({ ...q, topic: "Basic Chemistry Concepts", subject: "Chemistry" });
  }

  // 2. pH calculations (15 variants)
  for (let i = 1; i <= 15; i++) {
    const exponent = (i % 5) + 2; // 2,3,4,5,6
    const q = buildMCQ(
      `Find the pH of an aqueous HCl solution with a hydrogen ion concentration [H+] of 1.0 x 10^-${exponent} M.`,
      `${exponent}`,
      [`${14 - exponent}`, `${exponent + 1}`, `${exponent - 1}`]
    );
    list.push({ ...q, topic: "Equilibrium", subject: "Chemistry" });
  }

  // 3. Ideal Gas law (15 variants)
  for (let i = 1; i <= 15; i++) {
    const v = i * 2;
    const n = i;
    const r = 0.0821;
    const t = 300;
    const p = ((n * r * t) / v).toFixed(2);
    const q = buildMCQ(
      `Using the ideal gas equation PV = nRT, find the pressure P of ${n} moles of gas in a ${v} L container at 300 K (R = 0.0821 L·atm/mol·K).`,
      `${p} atm`,
      [`${(p * 2).toFixed(2)} atm`, `${(p / 2).toFixed(2)} atm`, `1.00 atm`]
    );
    list.push({ ...q, topic: "States of Matter", subject: "Chemistry" });
  }

  // 4. Rate constant half-life (15 variants)
  for (let i = 1; i <= 15; i++) {
    const k = (i * 0.05).toFixed(3);
    const t_half = (0.693 / k).toFixed(1);
    const q = buildMCQ(
      `The rate constant for a first-order reaction is ${k} s^-1. Calculate its half-life period.`,
      `${t_half} s`,
      [`${(t_half * 2).toFixed(1)} s`, `${(t_half / 2).toFixed(1)} s`, `10.0 s`]
    );
    list.push({ ...q, topic: "Chemical Kinetics", subject: "Chemistry" });
  }

  // 5. Atomic number shells (15 variants)
  for (let i = 1; i <= 15; i++) {
    const z = i + 10;
    const val_electrons = (z <= 18) ? (z - 10) : (z - 18);
    const q = buildMCQ(
      `Find the number of valence shell electrons in an atom with atomic number Z = ${z}.`,
      `${val_electrons}`,
      [`${val_electrons + 1}`, `${val_electrons - 1}`, `8`]
    );
    list.push({ ...q, topic: "Atomic Structure", subject: "Chemistry" });
  }

  // 6. Faraday's electrolysis (15 variants)
  for (let i = 1; i <= 15; i++) {
    const z = i;
    const oxidation_state = `+${z}`;
    const q = buildMCQ(
      `How many Faradays of electricity are required to reduce 1 mole of M^${z}+ ions to metal M?`,
      `${z} F`,
      [`${z * 2} F`, `1 F`, `${z + 1} F`]
    );
    list.push({ ...q, topic: "Electrochemistry", subject: "Chemistry" });
  }

  // 7. Alkane carbons (15 variants)
  for (let i = 1; i <= 15; i++) {
    const n = i + 2;
    const h = 2 * n + 2;
    const q = buildMCQ(
      `Determine the number of hydrogen atoms in an alkane containing ${n} carbon atoms.`,
      `${h}`,
      [`${2 * n}`, `${2 * n - 2}`, `${n + 2}`]
    );
    list.push({ ...q, topic: "Hydrocarbons", subject: "Chemistry" });
  }

  // 8. Oxidation states (15 variants)
  for (let i = 1; i <= 15; i++) {
    const oxygen = (i % 3) + 2; // 2, 3, 4
    const ox_state = 2 * oxygen - 2;
    const q = buildMCQ(
      `Find the oxidation state of sulfur in H2SO${oxygen}.`,
      `+${ox_state}`,
      [`+${ox_state - 1}`, `+${ox_state + 1}`, `+2`]
    );
    list.push({ ...q, topic: "Redox Reactions", subject: "Chemistry" });
  }

  // 9. Coordination compounds (15 variants)
  for (let i = 1; i <= 15; i++) {
    const coordination_no = (i % 2 === 0) ? 6 : 4;
    const geometry = (coordination_no === 6) ? "Octahedral" : "Tetrahedral / Square Planar";
    const q = buildMCQ(
      `Determine the expected coordination geometry for a complex with a coordination number of ${coordination_no}.`,
      `${geometry}`,
      [`Trigonal Bipyramidal`, `Linear`, `Pentagonal Bipyramidal`]
    );
    list.push({ ...q, topic: "Coordination Compounds", subject: "Chemistry" });
  }

  // 10. Osmotic pressure (15 variants)
  for (let i = 1; i <= 15; i++) {
    const m = (i * 0.1).toFixed(2);
    const r = 0.0821;
    const t = 300;
    const pi = (m * r * t).toFixed(2);
    const q = buildMCQ(
      `Calculate the osmotic pressure of a ${m} M sugar solution at 300 K.`,
      `${pi} atm`,
      [`${(pi * 1.5).toFixed(2)} atm`, `${(pi / 2).toFixed(2)} atm`, `0.00 atm`]
    );
    list.push({ ...q, topic: "Solutions", subject: "Chemistry" });
  }

  return list;
}

async function seed() {
  console.log("Clearing existing JEE Main questions from the database first...");
  const { error: clearError } = await supabase.from("pyq_questions").delete().eq("exam", "JEE Main");
  if (clearError) {
    console.error("Warning: Failed to clear old questions:", clearError.message);
  } else {
    console.log("Old JEE Main questions cleared successfully.");
  }

  console.log("Generating static procedural questions database...");

  const mathQs = generateMathQuestions();
  const physQs = generatePhysicsQuestions();
  const chemQs = generateChemistryQuestions();

  console.log(`Generated counts: Mathematics=${mathQs.length}, Physics=${physQs.length}, Chemistry=${chemQs.length}`);

  const allQuestions = [...mathQs, ...physQs, ...chemQs];

  // Randomize year/shift/question_no for each question
  const formattedQuestions = allQuestions.map((q, idx) => ({
    ...q,
    exam: "JEE Main",
    year: years[idx % years.length],
    shift: shifts[idx % shifts.length],
    question_no: (idx % 15) + 1
  }));

  console.log(`Total questions to insert: ${formattedQuestions.length}`);

  // Insert in batches of 50 to avoid payload size warnings/issues
  const batchSize = 50;
  let inserted = 0;

  for (let i = 0; i < formattedQuestions.length; i += batchSize) {
    const batch = formattedQuestions.slice(i, i + batchSize);
    const { error } = await supabase.from("pyq_questions").insert(batch);
    
    if (error) {
      console.error(`Error inserting batch at offset ${i}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${formattedQuestions.length}...`);
    }
  }

  console.log("Procedural seeding of JEE Main database complete!");
}

seed();
