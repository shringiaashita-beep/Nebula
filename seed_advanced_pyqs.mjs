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

const EXAMS = {
  "JEE Main":     ["Physics", "Chemistry", "Mathematics"],
  "JEE Advanced": ["Physics", "Chemistry", "Mathematics"],
  "NEET":         ["Biology", "Physics", "Chemistry"],
  "UPSC":         ["Political Science", "History", "Geography", "Economics"],
  "RAS":          ["Rajasthan GK", "History", "Geography"],
  "REET":         ["Child Development", "Pedagogy", "Teaching Aptitude"],
  "GATE":         ["Engineering Maths", "Core Subject", "Aptitude"],
  "CAT":          ["Quant", "DILR", "VARC"],
  "CUET":         ["General Test", "English", "Domain Subject"],
};

const years = [2021, 2022, 2023, 2024, 2025];
const shifts = ["January Shift 1", "January Shift 2", "April Shift 1", "April Shift 2", "Morning Shift", "Afternoon Shift"];

// Helper to shuffle options deterministically
function makeMCQ(questionText, correctVal, wrongsList, seedVal) {
  const optionsList = [
    { text: correctVal, isCorrect: true },
    ...wrongsList.map(v => ({ text: v, isCorrect: false }))
  ];
  
  for (let i = optionsList.length - 1; i > 0; i--) {
    const j = Math.abs((seedVal + i * 13) % (i + 1));
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

// DEFINING 10 REALISTIC, HIGH-QUALITY MULTI-VARIANT TEMPLATES FOR EACH OF THE 21 SUBJECTS
const englishTemplates = {
  Physics: [
    (i) => ({
      topic: "Mechanics",
      q: `A particle of mass ${i + 1} kg is moving with a constant velocity of ${i * 2 + 5} m/s. Calculate its linear momentum.`,
      correct: `${(i + 1) * (i * 2 + 5)} kg m/s`,
      wrongs: [`${(i + 1) * (i * 2 + 5) + 10} kg m/s`, `${(i + 1) * (i * 2 + 5) - 5} kg m/s`, "0.0 kg m/s"]
    }),
    (i) => ({
      topic: "Electrostatics",
      q: `Two point charges of ${i} C and ${i * 2} C are kept in vacuum at a distance of 2 meters. Find the Coulomb force.`,
      correct: `${((9 * i * i * 2) / 4).toFixed(1)} x 10^9 N`,
      wrongs: [`${((9 * i * i * 2) / 2).toFixed(1)} x 10^9 N`, `${((9 * i * i) / 4).toFixed(1)} x 10^9 N`, "0 N"]
    }),
    (i) => ({
      topic: "Current Electricity",
      q: `Two resistors of resistance ${i * 2} Ω and ${i * 3} Ω are connected in series. Find the equivalent resistance.`,
      correct: `${i * 5} Ω`,
      wrongs: [`${((i * i * 6) / (i * 5)).toFixed(2)} Ω`, `${i * 5 + 3} Ω`, "1 Ω"]
    }),
    (i) => ({
      topic: "Thermodynamics",
      q: `A Carnot heat engine operates between temperatures ${i * 50 + 400} K and ${i * 10 + 200} K. Calculate its thermal efficiency.`,
      correct: `${((1 - (i * 10 + 200) / (i * 50 + 400)) * 100).toFixed(1)}%`,
      wrongs: [`${((1 - (i * 10 + 250) / (i * 50 + 400)) * 100).toFixed(1)}%`, "50%", "100%"]
    }),
    (i) => ({
      topic: "Optics",
      q: `A convex lens of focal length ${i * 5 + 10} cm forms a real image of an object kept at distance ${i * 10 + 30} cm. Calculate the image distance.`,
      correct: `${(((i * 10 + 30) * (i * 5 + 10)) / (i * 5 + 20)).toFixed(1)} cm`,
      wrongs: [`${(i * 5 + 10).toFixed(1)} cm`, `${(i * 10 + 30).toFixed(1)} cm`, "Infinity"]
    }),
    (i) => ({
      topic: "Kinematics",
      q: `A car starts from rest and accelerates uniformly at ${i + 1} m/s^2 for ${i + 2} seconds. Determine the final velocity.`,
      correct: `${(i + 1) * (i + 2)} m/s`,
      wrongs: [`${((i + 1) * (i + 2)) / 2} m/s`, `${(i + 1) * (i + 2) + 5} m/s`, "0 m/s"]
    }),
    (i) => ({
      topic: "Waves",
      q: `A wave travelling along a string has a frequency of ${i * 10 + 40} Hz and wavelength ${i * 0.1 + 0.3} m. Find its velocity.`,
      correct: `${((i * 10 + 40) * (i * 0.1 + 0.3)).toFixed(1)} m/s`,
      wrongs: [`${(i * 10 + 40).toFixed(1)} m/s`, `${(i * 0.1 + 0.3).toFixed(1)} m/s`, "330 m/s"]
    }),
    (i) => ({
      topic: "Modern Physics",
      q: `The work function of a metallic surface is ${i * 0.2 + 1.8} eV. Find the threshold frequency of light needed to eject photoelectrons.`,
      correct: `${(((i * 0.2 + 1.8) * 1.6 * 10 ** -19) / (6.63 * 10 ** -34)).toExponential(2)} Hz`,
      wrongs: [`${(((i * 0.2 + 1.0) * 1.6 * 10 ** -19) / (6.63 * 10 ** -34)).toExponential(2)} Hz`, "3 x 10^8 Hz", "1.5 x 10^15 Hz"]
    }),
    (i) => ({
      topic: "Gravitation",
      q: `Calculate the gravitational force of attraction between two spheres of mass ${i * 5} kg and ${i * 10} kg separated by 1 meter.`,
      correct: `${(6.67 * 10 ** -11 * i * i * 50).toExponential(2)} N`,
      wrongs: [`${(6.67 * 10 ** -11 * i * 5).toExponential(2)} N`, "9.8 N", "0 N"]
    }),
    (i) => ({
      topic: "Magnetism",
      q: `Find the magnetic field at a distance of ${i * 0.1 + 0.1} m from a long straight wire carrying a current of ${i + 1} A.`,
      correct: `${((2 * 10 ** -7 * (i + 1)) / (i * 0.1 + 0.1)).toExponential(2)} T`,
      wrongs: [`${((4 * 10 ** -7 * (i + 1)) / (i * 0.1 + 0.1)).toExponential(2)} T`, "1 Tesla", "0 Tesla"]
    })
  ],

  Chemistry: [
    (i) => ({
      topic: "Solutions",
      q: `Find the molarity of a solution made by dissolving ${i * 3} moles of NaCl in ${i * 0.5 + 2.0} liters of water.`,
      correct: `${((i * 3) / (i * 0.5 + 2.0)).toFixed(2)} M`,
      wrongs: [`${((i * 3) / (i * 0.5 + 3.0)).toFixed(2)} M`, "1.00 M", "2.00 M"]
    }),
    (i) => ({
      topic: "Atomic Structure",
      q: `For an electron in subshell d (orbital angular momentum l = 2), what is the maximum number of electrons it can hold?`,
      correct: "10",
      wrongs: ["2", "6", "14"]
    }),
    (i) => ({
      topic: "Chemical Kinetics",
      q: `If a first-order chemical reaction has a rate constant k = ${(i * 0.003).toFixed(4)} s^-1, find its half-life period.`,
      correct: `${(0.693 / (i * 0.003)).toFixed(1)} s`,
      wrongs: [`${(0.5 / (i * 0.003)).toFixed(1)} s`, `${(1.0 / (i * 0.003)).toFixed(1)} s`, "100 s"]
    }),
    (i) => ({
      topic: "Equilibrium",
      q: `Determine the pH of a solution containing a strong monoprotic acid at a concentration of ${10 ** -(i % 4 + 2)} M.`,
      correct: `${(i % 4 + 2)}`,
      wrongs: [`${(i % 4 + 3)}`, `${(i % 4 + 1)}`, "7"]
    }),
    (i) => ({
      topic: "Ideal Gases",
      q: `A gas occupies ${i * 4 + 10} liters at ${i * 2 + 2} atm pressure. How many moles are present if temperature is 300 K? (R = 0.0821 L atm/mol K)`,
      correct: `${(((i * 2 + 2) * (i * 4 + 10)) / (0.0821 * 300)).toFixed(2)}`,
      wrongs: [`${(((i * 2 + 2) * (i * 4 + 10)) / 22.4).toFixed(2)}`, "1.00", "5.00"]
    }),
    (i) => ({
      topic: "Electrochemistry",
      q: `How many moles of electrons are transferred when reducing 1 mole of MnO4- ions to Mn2+ in acid medium?`,
      correct: "5",
      wrongs: ["1", "2", "7"]
    }),
    (i) => ({
      topic: "Hydrocarbons",
      q: `What is the correct IUPAC name of the hydrocarbon containing ${i + 3} carbon atoms in a straight chain with a single triple bond at position 1?`,
      correct: `${["butyne", "pentyne", "hexyne", "heptyne", "octyne", "nonyne"][i % 6]}`,
      wrongs: [`${["butane", "pentane", "hexane", "heptane", "octane", "nonane"][i % 6]}`, "acetylene", "ethylene"]
    }),
    (i) => ({
      topic: "Redox Reactions",
      q: `Determine the oxidation state of Chromium (Cr) in the potassium dichromate compound (K2Cr2O7).`,
      correct: "+6",
      wrongs: ["+3", "+4", "+7"]
    }),
    (i) => ({
      topic: "Coordination Compounds",
      q: `Identify the coordination number of Cobalt in the complex ion [Co(NH3)6]3+.`,
      correct: "6",
      wrongs: ["4", "2", "8"]
    }),
    (i) => ({
      topic: "Thermodynamics",
      q: `If the change in enthalpy (ΔH) is ${i * 12} kJ and change in entropy (ΔS) is ${i * 15} J/K at 300 K, calculate the Gibbs free energy (ΔG).`,
      correct: `${i * 12 - (300 * i * 15) / 1000} kJ`,
      wrongs: [`${i * 12 + (300 * i * 15) / 1000} kJ`, `${i * 12} kJ`, "0 kJ"]
    })
  ],

  Mathematics: [
    (i) => ({
      topic: "Algebra",
      q: `Evaluate the roots of the quadratic equation x^2 - ${i * 4 + 4}x + ${i * 3} = 0.`,
      correct: `x = ${i * 4}, x = 1`,
      wrongs: ["x = 2, x = 3", "x = 0, x = -1", "No real roots"]
    }),
    (i) => ({
      topic: "Calculus",
      q: `Calculate the derivative of f(x) = ${i * 3 + 2}x^3 with respect to x.`,
      correct: `${(i * 3 + 2) * 3}x^2`,
      wrongs: [`${(i * 3 + 2) * 2}x`, `${(i * 3 + 2)}x^2`, `${(i * 3 + 2) * 3}x`]
    }),
    (i) => ({
      topic: "Coordinate Geometry",
      q: `Find the slope of the line passing through points (0, 0) and (${i + 2}, ${i * 3 + 6}).`,
      correct: "3",
      wrongs: ["2", `${i + 2}`, `${i * 3 + 6}`]
    }),
    (i) => ({
      topic: "Vectors",
      q: `Calculate the dot product of vectors A = [${i}, 3] and B = [3, ${i * 2}].`,
      correct: `${i * 3 + i * 6}`,
      wrongs: [`${i + i * 2}`, `${i * 3 - i * 6}`, "0"]
    }),
    (i) => ({
      topic: "Trigonometry",
      q: `Find the value of cos(${i * 60}°) in mathematical trigonometry.`,
      correct: `${[1.0, 0.5, -0.5, -1.0, -0.5, 0.5][i % 6]}`,
      wrongs: ["0.0", "0.866", "-0.866"]
    }),
    (i) => ({
      topic: "Probability",
      q: `A bag contains ${i + 3} red balls and ${i + 4} blue balls. Find the probability of drawing a red ball.`,
      correct: `${(i + 3)}/${2 * i + 7}`,
      wrongs: [`${(i + 4)}/${2 * i + 7}`, "1/2", "1/5"]
    }),
    (i) => ({
      topic: "Matrices",
      q: `Find the determinant of the 2x2 matrix [[${i}, 3], [1, ${i + 2}]].`,
      correct: `${i * (i + 2) - 3}`,
      wrongs: [`${i * (i + 2) + 3}`, `${i + 2}`, `${i * 3}`]
    }),
    (i) => ({
      topic: "Limits",
      q: `Evaluate the limit as x approaches ${i + 1}: (x^2 - ${(i + 1) * (i + 1)}) / (x - ${i + 1}).`,
      correct: `${2 * (i + 1)}`,
      wrongs: [`${i + 1}`, "0", "Undefined"]
    }),
    (i) => ({
      topic: "Differential Equations",
      q: `Determine the order of the differential equation: (d^3y/dx^3)^2 + d^2y/dx^2 + y = 0.`,
      correct: "3",
      wrongs: ["2", "1", "0"]
    }),
    (i) => ({
      topic: "AP & GP",
      q: `Find the sum of the first ${i + 1} terms of the arithmetic progression: 2, 4, 6, 8...`,
      correct: `${(i + 1) * (i + 2)}`,
      wrongs: [`${(i + 1) * (i + 1)}`, `${(i + 1) * 2}`, "100"]
    })
  ],

  Biology: [
    (i) => ({
      topic: "Cell Biology",
      q: `Which cell organelle is primarily responsible for protein synthesis in the cell?`,
      correct: "Ribosome",
      wrongs: ["Mitochondria", "Lysosome", "Golgi Apparatus"]
    }),
    (i) => ({
      topic: "Cell Biology",
      q: `Which cell organelle is known as the powerhouse of the cell due to ATP generation?`,
      correct: "Mitochondria",
      wrongs: ["Ribosome", "Lysosome", "Chloroplast"]
    }),
    (i) => ({
      topic: "Cell Biology",
      q: `Which cell organelle is responsible for waste disposal and intracellular digestion?`,
      correct: "Lysosome",
      wrongs: ["Mitochondria", "Ribosome", "Nucleus"]
    }),
    (i) => ({
      topic: "Genetics",
      q: `According to Chargaff's rule, if a double-stranded DNA molecule contains ${i % 15 + 15}% Adenine, what is the percentage of Cytosine?`,
      correct: `${50 - (i % 15 + 15)}%`,
      wrongs: [`${i % 15 + 15}%`, "50%", "25%"]
    }),
    (i) => ({
      topic: "Human Physiology",
      q: `Which pancreatic hormone is primarily responsible for lowering blood glucose levels?`,
      correct: "Insulin",
      wrongs: ["Glucagon", "Adrenaline", "Thyroxine"]
    }),
    (i) => ({
      topic: "Human Physiology",
      q: `Which pancreatic hormone is primarily responsible for raising blood glucose levels?`,
      correct: "Glucagon",
      wrongs: ["Insulin", "Adrenaline", "Thyroxine"]
    }),
    (i) => ({
      topic: "Plant Physiology",
      q: `Which plant hormone is primarily responsible for cell elongation and apical dominance?`,
      correct: "Auxin",
      wrongs: ["Gibberellin", "Abscisic Acid", "Ethylene"]
    }),
    (i) => ({
      topic: "Ecology",
      q: `According to Lindeman's 10% law, if producers have ${i * 1000} J of energy, how much energy is available to primary consumers?`,
      correct: `${i * 100} J`,
      wrongs: [`${i * 10} J`, `${i * 1000} J`, `${i * 50} J`]
    }),
    (i) => ({
      topic: "Health & Disease",
      q: `Which pathogen is the causative agent of malaria in humans?`,
      correct: "Plasmodium protozoan",
      wrongs: ["Mycobacterium tuberculosis", "Vibrio cholerae", "Influenza virus"]
    }),
    (i) => ({
      topic: "Cell Division",
      q: `During which stage of mitosis do sister chromatids separate and move towards opposite poles?`,
      correct: "Anaphase",
      wrongs: ["Prophase", "Metaphase", "Telophase"]
    })
  ],

  "Political Science": [
    (i) => ({
      topic: "Indian Constitution",
      q: `Under which Article of the Indian Constitution is the right to constitutional remedies guaranteed?`,
      correct: "Article 32",
      wrongs: ["Article 14", "Article 19", "Article 21"]
    }),
    (i) => ({
      topic: "Indian Constitution",
      q: `Under which Article of the Indian Constitution is equality before law guaranteed?`,
      correct: "Article 14",
      wrongs: ["Article 32", "Article 19", "Article 21"]
    }),
    (i) => ({
      topic: "Parliament",
      q: `Which bill type is specifically governed by Article 110 of the Indian Constitution?`,
      correct: "Money Bill",
      wrongs: ["Ordinary Bill", "Constitutional Amendment Bill", "Financial Bill"]
    }),
    (i) => ({
      topic: "Judiciary",
      q: `Which power allows the Supreme Court to examine the constitutionality of legislative acts?`,
      correct: "Judicial Review",
      wrongs: ["Advisory Jurisdiction", "Original Jurisdiction", "Appellate Jurisdiction"]
    }),
    (i) => ({
      topic: "Local Government",
      q: `Which constitutional amendment added Part IX (Panchayati Raj Institutions) to the Constitution?`,
      correct: "73rd Amendment",
      wrongs: ["74th Amendment", "42nd Amendment", "44th Amendment"]
    }),
    (i) => ({
      topic: "Executive",
      q: `Who has the power to declare a national emergency under Article 352?`,
      correct: "The President of India",
      wrongs: ["The Prime Minister", "The Chief Justice", "The Parliament"]
    }),
    (i) => ({
      topic: "Federalism",
      q: `Which commission was set up in 1983 to examine Union-State relations in India?`,
      correct: "Sarkaria Commission",
      wrongs: ["Kothari Commission", "Radhakrishnan Commission", "Shah Commission"]
    }),
    (i) => ({
      topic: "Elections",
      q: `Who is responsible for the conduct of free and fair elections for Parliament and State Assemblies?`,
      correct: "Election Commission of India",
      wrongs: ["Ministry of Law", "Supreme Court", "UPSC"]
    }),
    (i) => ({
      topic: "Political Theories",
      q: `Which political ideology advocates for state ownership of the means of production?`,
      correct: "Socialism",
      wrongs: ["Capitalism", "Liberalism", "Fascism"]
    }),
    (i) => ({
      topic: "International Relations",
      q: `Which agreement outlined the Panchsheel principles between India and China in 1954?`,
      correct: "Sino-Indian Agreement",
      wrongs: ["Simla Agreement", "Tashkent Declaration", "Panchsheel Accord"]
    })
  ],

  History: [
    (i) => ({
      topic: "Ancient India",
      q: `Which major Harappan site shows archaeological evidence of a giant dockyard?`,
      correct: "Lothal",
      wrongs: ["Harappa", "Mohenjo-daro", "Kalibangan"]
    }),
    (i) => ({
      topic: "Ancient India",
      q: `Which major Harappan site is famous for the Great Bath and dancing girl bronze statue?`,
      correct: "Mohenjo-daro",
      wrongs: ["Lothal", "Harappa", "Kalibangan"]
    }),
    (i) => ({
      topic: "Mauryan Empire",
      q: `Which Mauryan emperor was famous for adopting Buddhism after the Kalinga war?`,
      correct: "Ashoka the Great",
      wrongs: ["Chandragupta Maurya", "Bindusara", "Brihadratha"]
    }),
    (i) => ({
      topic: "Delhi Sultanate",
      q: `Which Delhi Sultan implemented strict market and price control reforms?`,
      correct: "Alauddin Khalji",
      wrongs: ["Muhammad bin Tughluq", "Iltutmish", "Balban"]
    }),
    (i) => ({
      topic: "Mughal Empire",
      q: `Which Mughal ruler introduced the religious policy of 'Sulh-i-kul' (universal peace)?`,
      correct: "Akbar",
      wrongs: ["Babur", "Humayun", "Shah Jahan"]
    }),
    (i) => ({
      topic: "Maratha Empire",
      q: `What was Shivaji's council of eight ministers called in Maratha administration?`,
      correct: "Ashtapradhan",
      wrongs: ["Ashtadiggajas", "Navaratnas", "Mantri Parishad"]
    }),
    (i) => ({
      topic: "British Rule",
      q: `Who introduced the Permanent Settlement land revenue system in Bengal in 1793?`,
      correct: "Lord Cornwallis",
      wrongs: ["Warren Hastings", "Lord Wellesley", "Lord Dalhousie"]
    }),
    (i) => ({
      topic: "Revolt of 1857",
      q: `Who led the Revolt of 1857 in Jhansi against the British forces?`,
      correct: "Rani Lakshmibhai",
      wrongs: ["Nana Sahib", "Kunwar Singh", "Begum Hazrat Mahal"]
    }),
    (i) => ({
      topic: "Social Reforms",
      q: `Who founded the Brahmo Samaj in 1828 to advocate against social evils like Sati?`,
      correct: "Raja Ram Mohan Roy",
      wrongs: ["Jyotirao Phule", "Swami Vivekananda", "Ishwar Chandra Vidyasagar"]
    }),
    (i) => ({
      topic: "National Movement",
      q: `In which year did Mahatma Gandhi launch the Non-Cooperation Movement?`,
      correct: "1920",
      wrongs: ["1915", "1930", "1942"]
    })
  ],

  Geography: [
    (i) => ({
      topic: "Geomorphology",
      q: `Which geological theory explains the movement of Earth's lithospheric plates?`,
      correct: "Plate Tectonics",
      wrongs: ["Continental Drift", "Sea Floor Spreading", "Isostasy"]
    }),
    (i) => ({
      topic: "Climatology",
      q: `Which atmospheric layer contains the ozone layer and protects Earth from UV rays?`,
      correct: "Stratosphere",
      wrongs: ["Troposphere", "Mesosphere", "Thermosphere"]
    }),
    (i) => ({
      topic: "Oceanography",
      q: `Which warm ocean current flows along the east coast of North America?`,
      correct: "Gulf Stream",
      wrongs: ["Labrador Current", "Canary Current", "California Current"]
    }),
    (i) => ({
      topic: "Physical India",
      q: `What is the highest mountain peak located entirely within India's political territory?`,
      correct: "Kanchenjunga",
      wrongs: ["K2 (Godwin Austen)", "Nanda Devi", "Anamudi"]
    }),
    (i) => ({
      topic: "Rivers of India",
      q: `Which river is known as the 'Dakshin Ganga' (Ganga of the South) due to its length?`,
      correct: "Godavari",
      wrongs: ["Krishna", "Cauvery", "Narmada"]
    }),
    (i) => ({
      topic: "Climate of India",
      q: `Which wind system brings winter rainfall to the northwestern parts of India?`,
      correct: "Western Disturbances",
      wrongs: ["Southwest Monsoon", "Northeast Monsoon", "Loo"]
    }),
    (i) => ({
      topic: "Soils of India",
      q: `Which soil type is most suitable for growing cotton and is also known as Regur soil?`,
      correct: "Black Soil",
      wrongs: ["Alluvial Soil", "Red Soil", "Laterite Soil"]
    }),
    (i) => ({
      topic: "Agriculture",
      q: `Which crop type is sown in winter and harvested in spring (e.g. Wheat, Barley)?`,
      correct: "Rabi Crops",
      wrongs: ["Kharif Crops", "Zaid Crops", "Cash Crops"]
    }),
    (i) => ({
      topic: "Resources",
      q: `Which region in India is the largest producer of lignite coal?`,
      correct: "Neyveli (Tamil Nadu)",
      wrongs: ["Jharia (Jharkhand)", "Raniganj (West Bengal)", "Singareni (Telangana)"]
    }),
    (i) => ({
      topic: "Population",
      q: `According to the Census 2011, which state has the highest population density?`,
      correct: "Bihar",
      wrongs: ["West Bengal", "Uttar Pradesh", "Maharashtra"]
    })
  ],

  Economics: [
    (i) => ({
      topic: "National Income",
      q: `Which aggregate measures the total value of final goods and services produced within a country's boundaries?`,
      correct: "Gross Domestic Product (GDP)",
      wrongs: ["Gross National Product (GNP)", "Net National Product (NNP)", "Personal Income"]
    }),
    (i) => ({
      topic: "Inflation",
      q: `Which economic curve shows the short-run trade-off between inflation and unemployment?`,
      correct: "Phillips Curve",
      wrongs: ["Laffer Curve", "Lorenz Curve", "Kuznets Curve"]
    }),
    (i) => ({
      topic: "Monetary Policy",
      q: `What is the rate at which the RBI lends money to commercial banks for short-term periods?`,
      correct: "Repo Rate",
      wrongs: ["Reverse Repo Rate", "Bank Rate", "CRR"]
    }),
    (i) => ({
      topic: "Fiscal Policy",
      q: `Which account of the Union Budget contains receipts and expenditures that create or reduce financial assets/liabilities?`,
      correct: "Capital Budget",
      wrongs: ["Revenue Budget", "Balanced Budget", "Zero Budget"]
    }),
    (i) => ({
      topic: "Banking",
      q: `What does the term NPA stand for in the Indian commercial banking sector?`,
      correct: "Non-Performing Asset",
      wrongs: ["Net Profit Account", "National Payment Association", "Nominal Public Asset"]
    }),
    (i) => ({
      topic: "Foreign Trade",
      q: `Which system records all economic transactions between residents of a country and the rest of the world?`,
      correct: "Balance of Payments",
      wrongs: ["Balance of Trade", "Capital Account Balance", "Exchange Rate Reserve"]
    }),
    (i) => ({
      topic: "Poverty & Inequality",
      q: `Which mathematical index is widely used to measure income inequality in a population?`,
      correct: "Gini Coefficient",
      wrongs: ["Lorenz Index", "Human Development Index", "Multidimensional Poverty Index"]
    }),
    (i) => ({
      topic: "Planning",
      q: `Which statutory body replaced the Planning Commission of India in January 2015?`,
      correct: "NITI Aayog",
      wrongs: ["National Development Council", "Finance Commission", "Economic Advisory Council"]
    }),
    (i) => ({
      topic: "Agriculture Economics",
      q: `Which pricing mechanism is announced by the Government of India to protect farmers from price crashes?`,
      correct: "Minimum Support Price (MSP)",
      wrongs: ["Fair and Remunerative Price", "Issue Price", "Procurement Price"]
    }),
    (i) => ({
      topic: "International Finance",
      q: `Where is the headquarters of the World Trade Organization (WTO) located?`,
      correct: "Geneva, Switzerland",
      wrongs: ["Washington D.C., USA", "New York, USA", "London, UK"]
    })
  ],

  "Rajasthan GK": [
    (i) => ({
      topic: "History of Rajasthan",
      q: `In Mewar history, which battle did Maharana Pratap fight against the Mughal forces of Akbar in 1576?`,
      correct: "Battle of Haldighati",
      wrongs: ["Battle of Khanwa", "Battle of Dewair", "Battle of Tarain"]
    }),
    (i) => ({
      topic: "Geography of Rajasthan",
      q: `Which geographical range acts as a water divide and runs diagonally across Rajasthan?`,
      correct: "Aravalli Range",
      wrongs: ["Vindhyan Range", "Satpura Range", "Himalayan Range"]
    }),
    (i) => ({
      topic: "Art & Forts",
      q: `Which historical fort in Jodhpur is built on the Chintamani hill and is famous for its intricate carving?`,
      correct: "Mehrangarh Fort",
      wrongs: ["Amer Fort", "Chittorgarh Fort", "Junagarh Fort"]
    }),
    (i) => ({
      topic: "Art & Forts",
      q: `Which historical fort in Chittorgarh is the largest fort complex in India and famous for the Vijay Stambha?`,
      correct: "Chittorgarh Fort",
      wrongs: ["Mehrangarh Fort", "Amer Fort", "Junagarh Fort"]
    }),
    (i) => ({
      topic: "Culture & Festivals",
      q: `Which major fair is held annually in Ajmer district of Rajasthan and is famous for camel trading?`,
      correct: "Pushkar Fair",
      wrongs: ["Karni Mata Fair", "Tejaji Fair", "Baneshwar Fair"]
    }),
    (i) => ({
      topic: "Paintings of Rajasthan",
      q: `Which Kishangarh style painting is widely known as the 'Mona Lisa of India'?`,
      correct: "Bani Thani",
      wrongs: ["Ragadhara", "Rasikpriya", "Gitagovinda"]
    }),
    (i) => ({
      topic: "Freedom Struggle",
      q: `Which peasant movement in Rajasthan lasted for 44 years starting in 1897 and was totally non-violent?`,
      correct: "Bijolia Peasant Movement",
      wrongs: ["Begu Peasant Movement", "Alwar Peasant Movement", "Matrikundia Peasant Movement"]
    }),
    (i) => ({
      topic: "Polity",
      q: `In which district of Rajasthan was the Panchayati Raj System first inaugurated in India in October 1959?`,
      correct: "Nagaur",
      wrongs: ["Jaipur", "Jodhpur", "Udaipur"]
    }),
    (i) => ({
      topic: "Economy",
      q: `Which public entity is responsible for industrial development and investment promotion in Rajasthan?`,
      correct: "RIICO",
      wrongs: ["RAJCON", "RFC", "RSMM"]
    }),
    (i) => ({
      topic: "Wildlife",
      q: `Which National Park in Rajasthan is famous for its bird sanctuary and is also a UNESCO World Heritage site?`,
      correct: "Keoladeo National Park (Bharatpur)",
      wrongs: ["Ranthambore National Park", "Sariska Tiger Reserve", "Desert National Park"]
    })
  ],

  "Child Development": [
    (i) => ({
      topic: "Cognitive Development",
      q: `According to Piaget, during which stage of cognitive development does a child develop object permanence?`,
      correct: "Sensorimotor Stage (0 to 2 years)",
      wrongs: ["Preoperational Stage", "Concrete Operational Stage", "Formal Operational Stage"]
    }),
    (i) => ({
      topic: "Cognitive Development",
      q: `According to Jean Piaget, during which stage does a child start performing logical operations on concrete objects?`,
      correct: "Concrete Operational Stage (7 to 11 years)",
      wrongs: ["Sensorimotor Stage", "Preoperational Stage", "Formal Operational Stage"]
    }),
    (i) => ({
      topic: "Vygotsky's Theory",
      q: `What term does Vygotsky use for the range of tasks that a child can perform with help but not independently?`,
      correct: "Zone of Proximal Development (ZPD)",
      wrongs: ["Scaffolding", "Schema", "Sensorimotor Adaptation"]
    }),
    (i) => ({
      topic: "Vygotsky's Theory",
      q: `What support technique does a teacher use temporarily to guide a child through a task in ZPD?`,
      correct: "Scaffolding",
      wrongs: ["Conditioning", "Reinforcement", "Assimilation"]
    }),
    (i) => ({
      topic: "Kohlberg's Theory",
      q: `In Kohlberg's theory of moral development, which level represents morality based on social laws and duties?`,
      correct: "Conventional Level",
      wrongs: ["Pre-conventional Level", "Post-conventional Level", "Unconventional Level"]
    }),
    (i) => ({
      topic: "Intelligence",
      q: `Who proposed the Theory of Multiple Intelligences including linguistic, logical, and musical intelligence?`,
      correct: "Howard Gardner",
      wrongs: ["Charles Spearman", "Robert Sternberg", "Alfred Binet"]
    }),
    (i) => ({
      topic: "Intelligence",
      q: `Which intelligence factor was proposed by Charles Spearman to explain general cognitive abilities?`,
      correct: "General Factor (g-factor)",
      wrongs: ["Specific Factor (s-factor)", "Triarchic Intelligence", "Emotional Intelligence"]
    }),
    (i) => ({
      topic: "Learning Theories",
      q: `Which learning theory is based on Pavlov's salivation experiment with dogs?`,
      correct: "Classical Conditioning",
      wrongs: ["Operant Conditioning", "Observational Learning", "Insightful Learning"]
    }),
    (i) => ({
      topic: "Learning Theories",
      q: `Which learning theory uses reinforcement and punishment schedules to shape animal or student behavior?`,
      correct: "Operant Conditioning (B.F. Skinner)",
      wrongs: ["Classical Conditioning", "Social Constructivism", "Discovery Learning"]
    }),
    (i) => ({
      topic: "Inclusive Education",
      q: `Which learning disability specifically impacts a student's reading speed, spelling, and phonetic decoding?`,
      correct: "Dyslexia",
      wrongs: ["Dysgraphia", "Dyscalculia", "ADHD"]
    })
  ],

  Pedagogy: [
    (i) => ({
      topic: "Teaching Methods",
      q: `Which educational method was proposed by H. E. Armstrong, encouraging students to act as independent researchers?`,
      correct: "Heuristic Method",
      wrongs: ["Project Method", "Lecture Method", "Discussion Method"]
    }),
    (i) => ({
      topic: "Teaching Methods",
      q: `Which method is based on the pragmatic philosophy of John Dewey and implemented by William Kilpatrick?`,
      correct: "Project Method",
      wrongs: ["Heuristic Method", "Lecture Method", "Demonstration Method"]
    }),
    (i) => ({
      topic: "Lesson Planning",
      q: `Which formatting framework uses the steps: Preparation, Presentation, Association, Generalization, and Application?`,
      correct: "Herbartian Steps",
      wrongs: ["Bloom's Taxonomy", "Morrison Unit Plan", "RCEM System"]
    }),
    (i) => ({
      topic: "Evaluation",
      q: `Which assessment type is conducted continuously during the instructional process to monitor student learning?`,
      correct: "Formative Assessment",
      wrongs: ["Summative Assessment", "Diagnostic Assessment", "Placement Assessment"]
    }),
    (i) => ({
      topic: "Evaluation",
      q: `Which assessment type is conducted at the end of a term or course to assign grades and verify mastery?`,
      correct: "Summative Assessment",
      wrongs: ["Formative Assessment", "Diagnostic Assessment", "Informal Assessment"]
    }),
    (i) => ({
      topic: "Curriculum Design",
      q: `What is the set of unwritten, unofficial values and perspectives that students learn in school called?`,
      correct: "Hidden Curriculum",
      wrongs: ["Explicit Curriculum", "Core Curriculum", "Activity Curriculum"]
    }),
    (i) => ({
      topic: "Action Research",
      q: `What is the correct sequential order of steps followed when conducting classroom action research?`,
      correct: "Plan -> Act -> Observe -> Reflect",
      wrongs: ["Act -> Plan -> Reflect -> Observe", "Observe -> Reflect -> Plan -> Act", "Reflect -> Plan -> Act -> Observe"]
    }),
    (i) => ({
      topic: "Constructivism",
      q: `In a constructivist classroom, what is the primary role of the teacher when facilitating activities?`,
      correct: "Facilitator of learning",
      wrongs: ["Active lecturer", "Strict disciplinarian", "Passive observer"]
    }),
    (i) => ({
      topic: "Teaching Aids",
      q: `Which category of teaching aids includes smart boards, movies, and slides containing audio-visual tracks?`,
      correct: "Audio-Visual Aids",
      wrongs: ["Visual Aids", "Audio Aids", "Projective Aids"]
    }),
    (i) => ({
      topic: "Education Policies",
      q: `Which constitutional act made free and compulsory education a fundamental right for children aged 6 to 14 in India?`,
      correct: "Right to Education (RTE) Act 2009",
      wrongs: ["NEP 1986", "NEP 2020", "Secondary Education Act 1952"]
    })
  ],

  "Teaching Aptitude": [
    (i) => ({
      topic: "Teacher Attributes",
      q: `What is the most critical attribute for a teacher to handle diverse classrooms effectively?`,
      correct: "Empathy and patience",
      wrongs: ["Strict authority", "Complex vocabulary", "Subject isolation"]
    }),
    (i) => ({
      topic: "Counseling",
      q: `How should a teacher deal with a student who exhibits persistent behavior problems in the classroom?`,
      correct: "Talk privately to identify the underlying cause",
      wrongs: ["Expel the student immediately", "Ignore the behavior completely", "Scold the student in front of the class"]
    }),
    (i) => ({
      topic: "Microteaching",
      q: `What is the core objective of microteaching sessions conducted for teacher-trainees?`,
      correct: "Development of specific teaching skills",
      wrongs: ["Completing the syllabus quickly", "Managing large crowds", "Conducting final examinations"]
    }),
    (i) => ({
      topic: "Classroom Communication",
      q: `Which factor is the most common barrier to effective verbal communication in a classroom?`,
      correct: "High environmental noise and distraction",
      wrongs: ["Clear enunciation", "Simplistic language", "Use of visual slides"]
    }),
    (i) => ({
      topic: "Gifted Students",
      q: `How should a teacher modify instruction to engage exceptionally gifted students in the classroom?`,
      correct: "Provide enriched learning materials and challenges",
      wrongs: ["Force them to repeat basic tasks", "Ask them to sit quietly without work", "Assign them physical management chores"]
    }),
    (i) => ({
      topic: "Testing Models",
      q: `Which test type evaluates a student's performance relative to a defined, absolute standard of mastery?`,
      correct: "Criterion-Referenced Test",
      wrongs: ["Norm-Referenced Test", "Diagnostic Test", "Aptitude Test"]
    }),
    (i) => ({
      topic: "Testing Models",
      q: `Which test type evaluates a student's performance relative to the average performance of their peer group?`,
      correct: "Norm-Referenced Test",
      wrongs: ["Criterion-Referenced Test", "Formative Test", "Achievement Test"]
    }),
    (i) => ({
      topic: "Ethics",
      q: `What is a teacher's primary moral obligation in the context of student diversity?`,
      correct: "Treating all students with equal respect and support",
      wrongs: ["Favoring academic high-achievers", "Imposing personal opinions on political issues", "Discouraging question-asking"]
    }),
    (i) => ({
      topic: "Peer Learning",
      q: `What is the primary benefit of peer tutoring in collaborative classroom groups?`,
      correct: "Reinforcement of concepts for both tutor and tutee",
      wrongs: ["Reducing the workload of teachers", "Allowing student cheating", "Eliminating formal grading"]
    }),
    (i) => ({
      topic: "Reflection",
      q: `What is a teacher's systematic review of their own instruction called in professional development?`,
      correct: "Reflective Teaching",
      wrongs: ["Action Plan", "Micro-Planning", "Direct Instruction"]
    })
  ],

  "Engineering Maths": [
    (i) => ({
      topic: "Linear Algebra",
      q: `Find the eigenvalues of the matrix [[${i}, 0], [0, ${i + 3}]].`,
      correct: `λ1 = ${i}, λ2 = ${i + 3}`,
      wrongs: [`λ1 = 0, λ2 = 1`, `λ1 = ${i + 1}, λ2 = ${i + 2}`, `λ1 = -${i}, λ2 = -${i + 3}`]
    }),
    (i) => ({
      topic: "Calculus",
      q: `If a function f(x) is continuous in [a, b] and differentiable in (a, b), which theorem states there exists c in (a, b) such that f'(c) = [f(b)-f(a)]/[b-a]?`,
      correct: "Lagrange's Mean Value Theorem",
      wrongs: ["Rolle's Theorem", "Cauchy's Mean Value Theorem", "Taylor's Theorem"]
    }),
    (i) => ({
      topic: "Differential Equations",
      q: `Find the Laplace transform of the exponential function f(t) = e^(${i}t).`,
      correct: `1 / (s - ${i})`,
      wrongs: [`1 / (s + ${i})`, `s / (s^2 + ${i * i})`, `1 / s`]
    }),
    (i) => ({
      topic: "Complex Variables",
      q: `Which equations represent the necessary conditions for a complex function f(z) = u + iv to be analytic?`,
      correct: "Cauchy-Riemann Equations (ux = vy, uy = -vx)",
      wrongs: ["Euler's Equations", "Laplace's Equations", "Navier-Stokes Equations"]
    }),
    (i) => ({
      topic: "Probability & Stats",
      q: `For a Poisson distribution, if the mean parameter is λ = ${i}, calculate the variance.`,
      correct: `${i}`,
      wrongs: [`${i * i}`, `${Math.sqrt(i).toFixed(2)}`, "0"]
    }),
    (i) => ({
      topic: "Numerical Methods",
      q: `Which numerical integration formula is based on approximating the function in each subinterval by a parabola?`,
      correct: "Simpson's 1/3 Rule",
      wrongs: ["Trapezoidal Rule", "Euler's Method", "Runge-Kutta Method"]
    }),
    (i) => ({
      topic: "Vector Calculus",
      q: `Find the divergence of the vector field F = [${i}x, 2y, z].`,
      correct: `${i + 3}`,
      wrongs: ["0", `${i}`, `${i + 2}`]
    }),
    (i) => ({
      topic: "Fourier Series",
      q: `For an even function f(x) defined in [-L, L], which Fourier coefficients will always be zero?`,
      correct: "bn = 0",
      wrongs: ["an = 0", "a0 = 0", "All coefficients"]
    }),
    (i) => ({
      topic: "PDE",
      q: `Which type of partial differential equation is represented by the 1D heat equation (u_t = α u_xx)?`,
      correct: "Parabolic",
      wrongs: ["Hyperbolic", "Elliptic", "Linear first-order"]
    }),
    (i) => ({
      topic: "PDE",
      q: `Which type of partial differential equation is represented by the 1D wave equation (u_tt = c^2 u_xx)?`,
      correct: "Hyperbolic",
      wrongs: ["Parabolic", "Elliptic", "Linear first-order"]
    })
  ],

  "Core Subject": [
    (i) => ({
      topic: "Systems Design",
      q: `Which thermodynamic power cycle operates with two isothermal and two isentropic processes, setting the maximum thermal limit?`,
      correct: "Carnot Cycle",
      wrongs: ["Rankine Cycle", "Otto Cycle", "Diesel Cycle"]
    }),
    (i) => ({
      topic: "Systems Design",
      q: `Which thermodynamic cycle is used as the standard reference cycle for steam power plants?`,
      correct: "Rankine Cycle",
      wrongs: ["Carnot Cycle", "Otto Cycle", "Diesel Cycle"]
    }),
    (i) => ({
      topic: "Fluid Mechanics",
      q: `Which conservation principle is the foundation for Bernoulli's equation in fluid mechanics?`,
      correct: "Conservation of Energy",
      wrongs: ["Conservation of Mass", "Conservation of Momentum", "Second Law of Thermodynamics"]
    }),
    (i) => ({
      topic: "Control Systems",
      q: `In a feedback control system, what mathematical function is defined as the ratio of Laplace transform of output to input?`,
      correct: "Transfer Function",
      wrongs: ["State Space Model", "Block Diagram", "Characteristic Equation"]
    }),
    (i) => ({
      topic: "Electric Circuits",
      q: `Which circuit theorem allows any linear two-terminal network to be replaced by a single voltage source in series with a resistor?`,
      correct: "Thevenin's Theorem",
      wrongs: ["Norton's Theorem", "Superposition Theorem", "Maximum Power Transfer Theorem"]
    }),
    (i) => ({
      topic: "Data Structures",
      q: `Which linear data structure follows the Last-In-First-Out (LIFO) access principle?`,
      correct: "Stack",
      wrongs: ["Queue", "Linked List", "Binary Tree"]
    }),
    (i) => ({
      topic: "Data Structures",
      q: `Which linear data structure follows the First-In-First-Out (FIFO) access principle?`,
      correct: "Queue",
      wrongs: ["Stack", "Linked List", "Binary Tree"]
    }),
    (i) => ({
      topic: "Databases",
      q: `Which property of database transactions guarantees that either all operations of a transaction succeed, or none do?`,
      correct: "Atomicity",
      wrongs: ["Consistency", "Isolation", "Durability"]
    }),
    (i) => ({
      topic: "Databases",
      q: `Which property of database transactions guarantees that modifications are persisted even in case of system failure?`,
      correct: "Durability",
      wrongs: ["Atomicity", "Consistency", "Isolation"]
    }),
    (i) => ({
      topic: "Communication Systems",
      q: `Which modulation technique varies the frequency of a high-frequency carrier wave in accordance with the message signal?`,
      correct: "Frequency Modulation (FM)",
      wrongs: ["Amplitude Modulation (AM)", "Phase Modulation (PM)", "Pulse Code Modulation"]
    })
  ],

  Aptitude: [
    (i) => ({
      topic: "Quantitative Ability",
      q: `A seller buys a product for ₹${i * 100} and sells it at a ${20}% profit. Calculate the selling price.`,
      correct: `₹${i * 120}`,
      wrongs: [`₹${i * 100 + 20}`, `₹${i * 100 - 20}`, `₹${i * 150}`]
    }),
    (i) => ({
      topic: "Quantitative Ability",
      q: `A seller buys a product for ₹${i * 100} and sells it at a ${10}% loss. Calculate the selling price.`,
      correct: `₹${i * 90}`,
      wrongs: [`₹${i * 100}`, `₹${i * 100 - 10}`, `₹${i * 80}`]
    }),
    (i) => ({
      topic: "Time & Work",
      q: `If A can complete a piece of work in ${i * 4} days and B can do it in ${i * 12} days, how many days will they take working together?`,
      correct: `${i * 3} days`,
      wrongs: [`${i * 8} days`, `${i * 16} days`, `${i * 4} days`]
    }),
    (i) => ({
      topic: "Time & Work",
      q: `If A can complete a piece of work in ${i * 2} days and B can do it in ${i * 2} days, how many days will they take working together?`,
      correct: `${i} days`,
      wrongs: [`${i * 2} days`, `${i * 4} days`, `${i * 1.5} days`]
    }),
    (i) => ({
      topic: "Speed & Distance",
      q: `A train travels at a speed of ${i * 10 + 40} km/h. How many hours will it take to cover a distance of ${i * 20 + 80} km?`,
      correct: "2 hours",
      wrongs: ["1 hour", "4 hours", "3 hours"]
    }),
    (i) => ({
      topic: "Simple Interest",
      q: `Calculate the simple interest on a principal of ₹${i * 1000} at an annual interest rate of 5% for 2 years.`,
      correct: `₹${i * 100}`,
      wrongs: [`₹${i * 200}`, `₹${i * 50}`, `₹${i * 1000}`]
    }),
    (i) => ({
      topic: "Compound Interest",
      q: `Calculate the amount on a principal of ₹1000 compounded annually at an interest rate of ${i % 5 + 5}% for 1 year.`,
      correct: `₹${1000 * (1 + (i % 5 + 5) / 100)}`,
      wrongs: ["₹1000", `₹${1000 * (1 + (i % 5 + 10) / 100)}`, "₹1100"]
    }),
    (i) => ({
      topic: "Geometry",
      q: `Find the area of a right-angled triangle with a base of ${i * 2} cm and a height of ${i * 3} cm.`,
      correct: `${i * i * 3} cm^2`,
      wrongs: `${i * i * 6} cm^2`,
      wrongs: [`${i * i * 6} cm^2`, `${i * 5} cm^2`, `${i * i * 2} cm^2`]
    }),
    (i) => ({
      topic: "Averages",
      q: `Find the average of the sequence of integers: ${i}, ${i + 2}, ${i + 4}.`,
      correct: `${i + 2}`,
      wrongs: [`${i}`, `${i + 4}`, `${i * 3}`]
    }),
    (i) => ({
      topic: "Number System",
      q: `Determine the least common multiple (LCM) of ${i + 1} and ${i * 2 + 2}.`,
      correct: `${i * 2 + 2}`,
      wrongs: [`${i + 1}`, `${(i + 1) * (i * 2 + 2)}`, "1"]
    })
  ]
};

// Map identical structural templates to remain 18 subjects to ensure 100% realistic content
const remainingSubjectsList = ["Quant", "DILR", "VARC", "General Test", "English", "Domain Subject"];

// Fill remaining subjects using copy reference
remainingSubjectsList.forEach(subject => {
  if (subject === "Quant") {
    englishTemplates["Quant"] = englishTemplates["Aptitude"];
  } else if (subject === "English") {
    englishTemplates["English"] = englishTemplates["VARC"] = [
      (i) => ({
        topic: "Grammar",
        q: `Identify the word that is a synonym of the term 'ephemeral'.`,
        correct: "transient",
        wrongs: ["permanent", "eternal", "constant"]
      }),
      (i) => ({
        topic: "Grammar",
        q: `Identify the word that is an antonym of the term 'benevolent'.`,
        correct: "malevolent",
        wrongs: ["kind", "generous", "friendly"]
      }),
      (i) => ({
        topic: "Sentence Correction",
        q: `Choose the grammatically correct sentence structure.`,
        correct: "Either of the two candidates is qualified.",
        wrongs: ["Either of the two candidates are qualified.", "Either of the two candidate is qualified.", "Neither candidate are qualified."]
      }),
      (i) => ({
        topic: "Vocabulary",
        q: `What is the correct definition of the idiom 'spill the beans'?`,
        correct: "To reveal a secret accidentally",
        wrongs: ["To cook food", "To waste energy", "To win a race"]
      }),
      (i) => ({
        topic: "Vocabulary",
        q: `What is the correct definition of the idiom 'burn the midnight oil'?`,
        correct: "To work late into the night",
        wrongs: ["To sleep early", "To waste oil", "To start a fire"]
      }),
      (i) => ({
        topic: "Reading Comprehension",
        q: `If an author uses an 'ironic' tone in a passage, how is the message conveyed?`,
        correct: "By stating the opposite of what is meant",
        wrongs: ["By stating arguments directly", "By using statistical tables", "By praising the subject repeatedly"]
      }),
      (i) => ({
        topic: "Grammar",
        q: `Identify the passive voice version of: 'The chef prepared a delicious meal.'`,
        correct: "A delicious meal was prepared by the chef.",
        wrongs: ["The chef was preparing a delicious meal.", "A delicious meal had prepared by the chef.", "A delicious meal was prepare by chef."]
      }),
      (i) => ({
        topic: "Grammar",
        q: `Identify the direct speech version of: 'He said that he was leaving.'`,
        correct: `He said, "I am leaving."`,
        wrongs: [`He said, "He is leaving."`, `He said, "I was leaving."`, `He said, "He leaves."`]
      }),
      (i) => ({
        topic: "Grammar",
        q: `Identify the correct plural form of the word 'criterion'.`,
        correct: "criteria",
        wrongs: ["criterions", "criterias", "criteriones"]
      }),
      (i) => ({
        topic: "Grammar",
        q: `Identify the correct plural form of the word 'phenomenon'.`,
        correct: "phenomena",
        wrongs: ["phenomenons", "phenomenas", "phenomenones"]
      })
    ];
  } else if (subject === "VARC") {
    englishTemplates["VARC"] = englishTemplates["English"];
  } else if (subject === "DILR") {
    englishTemplates["DILR"] = [
      (i) => ({
        topic: "Blood Relations",
        q: `Introducing a woman, a man said: "She is the only daughter-in-law of my mother's husband." How is the woman related to the man?`,
        correct: "Wife",
        wrongs: ["Sister", "Mother", "Daughter"]
      }),
      (i) => ({
        topic: "Direction Sense",
        q: `A man walks ${i * 5 + 10} meters North, turns right and walks ${i * 5 + 10} meters. Find his displacement from the start point.`,
        correct: `${((i * 5 + 10) * Math.sqrt(2)).toFixed(2)} meters`,
        wrongs: [`${i * 10 + 20} meters`, "0 meters", "10 meters"]
      }),
      (i) => ({
        topic: "Syllogisms",
        q: `Statements: Some A are B. All B are C. Which conclusion is definitely true?`,
        correct: "Some A are C",
        wrongs: ["All A are C", "No A are C", "Some B are not C"]
      }),
      (i) => ({
        topic: "Clocks",
        q: `What is the angle between the hour hand and minute hand of a clock at ${i % 12 + 1}:00?`,
        correct: `${(i % 12 + 1) * 30}°`,
        wrongs: [`${(i % 12 + 1) * 15}°`, `${(i % 12 + 1) * 45}°`, "180°"]
      }),
      (i) => ({
        topic: "Calendars",
        q: `If the 1st of January of a non-leap year is a Monday, what day of the week is the 31st of December of the same year?`,
        correct: "Monday",
        wrongs: ["Tuesday", "Sunday", "Saturday"]
      }),
      (i) => ({
        topic: "Calendars",
        q: `If the 1st of January of a leap year is a Monday, what day of the week is the 31st of December of the same year?`,
        correct: "Tuesday",
        wrongs: ["Monday", "Wednesday", "Sunday"]
      }),
      (i) => ({
        topic: "Arrangements",
        q: `If 5 people are seated in a straight line, in how many ways can they be arranged?`,
        correct: "120",
        wrongs: ["24", "720", "60"]
      }),
      (i) => ({
        topic: "Logical Matching",
        q: `In a coded language, RED is written as 27. How is BLUE coded in the same language?`,
        correct: "40",
        wrongs: ["36", "48", "30"]
      }),
      (i) => ({
        topic: "Series",
        q: `Find the next number in the logical series: 2, 4, 8, 16, ...`,
        correct: "32",
        wrongs: ["24", "64", "48"]
      }),
      (i) => ({
        topic: "Series",
        q: `Find the next number in the logical series: 1, 4, 9, 16, 25, ...`,
        correct: "36",
        wrongs: ["49", "30", "40"]
      })
    ];
  } else if (subject === "General Test") {
    englishTemplates["General Test"] = [
      (i) => ({
        topic: "Geography",
        q: `Which Indian state is famous for the Kaziranga National Park, home of the one-horned rhinoceros?`,
        correct: "Assam",
        wrongs: ["West Bengal", "Gujarat", "Uttarakhand"]
      }),
      (i) => ({
        topic: "Geography",
        q: `Which Indian state is famous for the Gir Forest National Park, home of the Asiatic Lion?`,
        correct: "Gujarat",
        wrongs: ["Assam", "Madhya Pradesh", "Rajasthan"]
      }),
      (i) => ({
        topic: "General Science",
        q: `Which vitamin is synthesized in the human skin upon exposure to sunlight?`,
        correct: "Vitamin D",
        wrongs: ["Vitamin A", "Vitamin C", "Vitamin B12"]
      }),
      (i) => ({
        topic: "Indian Polity",
        q: `Who was the first President of the constituent assembly of India?`,
        correct: "Dr. Rajendra Prasad",
        wrongs: ["Dr. B.R. Ambedkar", "Jawaharlal Nehru", "Sardar Patel"]
      }),
      (i) => ({
        topic: "Awards",
        q: `What is the highest civilian award in the Republic of India?`,
        correct: "Bharat Ratna",
        wrongs: ["Padma Vibhushan", "Param Vir Chakra", "Dronacharya Award"]
      }),
      (i) => ({
        topic: "History",
        q: `In which year did the partition of Bengal take place under Lord Curzon?`,
        correct: "1905",
        wrongs: ["1911", "1919", "1909"]
      }),
      (i) => ({
        topic: "Geography",
        q: `Which river is the longest river in the world?`,
        correct: "Nile River",
        wrongs: ["Amazon River", "Yangtze River", "Mississippi River"]
      }),
      (i) => ({
        topic: "Geography",
        q: `Which river has the largest volume of water flow in the world?`,
        correct: "Amazon River",
        wrongs: ["Nile River", "Yangtze River", "Mississippi River"]
      }),
      (i) => ({
        topic: "Science",
        q: `What is the chemical formula of common salt used in household cooking?`,
        correct: "NaCl",
        wrongs: ["NaHCO3", "Na2CO3", "KCl"]
      }),
      (i) => ({
        topic: "Science",
        q: `What is the chemical formula of baking soda used in baking?`,
        correct: "NaHCO3",
        wrongs: ["NaCl", "Na2CO3", "KOH"]
      })
    ];
  } else if (subject === "Domain Subject") {
    englishTemplates["Domain Subject"] = [
      (i) => ({
        topic: "Scientific Method",
        q: `What is a tentative, testable explanation for an observed phenomenon in research called?`,
        correct: "Hypothesis",
        wrongs: ["Theory", "Law", "Fact"]
      }),
      (i) => ({
        topic: "Ethics",
        q: `What is the practice of presenting someone else's work or ideas as your own without credit called?`,
        correct: "Plagiarism",
        wrongs: ["Fabrication", "Falsification", "Copyright"]
      }),
      (i) => ({
        topic: "Data Analysis",
        q: `Which statistical test is used to compare the means of two independent groups?`,
        correct: "t-test",
        wrongs: ["Chi-square test", "ANOVA", "Pearson Correlation"]
      }),
      (i) => ({
        topic: "Data Analysis",
        q: `Which statistical test is used to compare the means of three or more independent groups?`,
        correct: "ANOVA",
        wrongs: ["t-test", "Chi-square test", "Pearson Correlation"]
      }),
      (i) => ({
        topic: "Data Analysis",
        q: `Which statistical test is used to determine relationship significance between two categorical variables?`,
        correct: "Chi-square test",
        wrongs: ["t-test", "ANOVA", "Pearson Correlation"]
      }),
      (i) => ({
        topic: "Research Design",
        q: `What is a research study that follows the same group of subjects over a long time period called?`,
        correct: "Longitudinal Study",
        wrongs: ["Cross-Sectional Study", "Experimental Study", "Case Study"]
      }),
      (i) => ({
        topic: "Measurement Scales",
        q: `Which scale level offers an absolute zero point in addition to equal measurement intervals (e.g. Kelvin temperature, height)?`,
        correct: "Ratio Scale",
        wrongs: ["Interval Scale", "Nominal Scale", "Ordinal Scale"]
      }),
      (i) => ({
        topic: "Sampling",
        q: `Which sampling technique selects subjects based on pre-defined, non-random proportions?`,
        correct: "Quota Sampling",
        wrongs: ["Simple Random Sampling", "Stratified Random Sampling", "Cluster Sampling"]
      }),
      (i) => ({
        topic: "Validity",
        q: `Which validity type refers to the extent to which a test measures the theoretical construct it claims to measure?`,
        correct: "Construct Validity",
        wrongs: ["Content Validity", "Criterion Validity", "Face Validity"]
      }),
      (i) => ({
        topic: "Referencing",
        q: `In APA referencing style, what does the abbreviation 'et al.' stand for?`,
        correct: "and others",
        wrongs: ["and all", "for example", "that is"]
      })
    ];
  }
});

// Translate advanced templates to Hindi dynamically
const hindiTemplates = {};
Object.keys(englishTemplates).forEach(subject => {
  hindiTemplates[subject] = englishTemplates[subject].map(engGen => {
    return (i) => {
      const eng = engGen(i);
      let hindiQ = ``;
      
      // Map specific question string templates to Hindi equivalents
      if (eng.q.includes("linear momentum")) {
        hindiQ = `एक कण जिसका द्रव्यमान ${i + 1} kg है, ${i * 2 + 5} m/s के निरंतर वेग से चल रहा है। इसके रैखिक संवेग की गणना कीजिए।`;
      } else if (eng.q.includes("Coulomb force")) {
        hindiQ = `${i} C और ${i * 2} C के दो बिंदु आवेशों को निर्वात में 2 मीटर की दूरी पर रखा गया है। उनके बीच कूलॉम बल ज्ञात कीजिए।`;
      } else if (eng.q.includes("equivalent resistance")) {
        hindiQ = `${i * 2} Ω और ${i * 3} Ω प्रतिरोध वाले दो प्रतिरोधक श्रेणीक्रम में जुड़े हैं। इस संयोजन का समतुल्य प्रतिरोध ज्ञात कीजिए।`;
      } else if (eng.q.includes("Carnot heat engine")) {
        hindiQ = `एक कार्नोट इंजन तापमान ${i * 50 + 400} K और ${i * 10 + 200} K के बीच कार्य करता है। इसकी ऊष्मीय दक्षता ज्ञात कीजिए।`;
      } else if (eng.q.includes("convex lens")) {
        hindiQ = `एक उत्तल लेंस जिसकी फोकस दूरी ${i * 5 + 10} सेमी है, वस्तु से ${i * 10 + 30} सेमी दूर रखी वस्तु का वास्तविक प्रतिबिंब बनाता है। प्रतिबिंब की दूरी ज्ञात करें।`;
      } else if (eng.q.includes("car starts from rest")) {
        hindiQ = `एक कार स्थिर अवस्था से शुरू होती है और ${i + 1} m/s^2 की दर से ${i + 2} सेकंड तक त्वरित होती है। अंतिम वेग ज्ञात करें।`;
      } else if (eng.q.includes("molarity of a solution")) {
        hindiQ = `${i * 3} मोल NaCl को ${i * 0.5 + 2.0} लीटर पानी में घोलने पर बनने वाले विलयन की मोलरता की गणना कीजिए।`;
      } else if (eng.q.includes("maximum number of electrons")) {
        hindiQ = `उपकोश d (कक्षीय कोणीय संवेग l = 2) में अधिकतम कितने इलेक्ट्रॉन आ सकते हैं?`;
      } else if (eng.q.includes("half-life period")) {
        hindiQ = `यदि प्रथम कोटि की अभिक्रिया का दर स्थिरांक k = ${(i * 0.003).toFixed(4)} s^-1 है, तो इसकी अर्ध-आयु ज्ञात कीजिए।`;
      } else if (eng.q.includes("pH of a solution")) {
        hindiQ = `एक विलयन जिसमें एक प्रबल अम्ल की सांद्रता ${10 ** -(i % 4 + 2)} M है, उसका pH मान ज्ञात कीजिए।`;
      } else if (eng.q.includes("roots of the quadratic")) {
        hindiQ = `द्विघात समीकरण x^2 - ${i * 4 + 4}x + ${i * 3} = 0 के मूल ज्ञात कीजिए।`;
      } else if (eng.q.includes("derivative of f(x)")) {
        hindiQ = `फलन f(x) = ${i * 3 + 2}x^3 का x के सापेक्ष अवकलन ज्ञात कीजिए।`;
      } else if (eng.q.includes("slope of the line")) {
        hindiQ = `बिंदुओं (0, 0) और (${i + 2}, ${i * 3 + 6}) से गुजरने वाली सरल रेखा की ढाल (प्रवणता) ज्ञात कीजिए।`;
      } else if (eng.q.includes("dot product")) {
        hindiQ = `सदिशों A = [${i}, 3] और B = [3, ${i * 2}] का अदिश गुणनफल (डॉट प्रोडक्ट) ज्ञात कीजिए।`;
      } else if (eng.q.includes("Battle of Haldighati")) {
        hindiQ = `मेवाड़ के इतिहास में, महाराणा प्रताप ने 1576 में अकबर की मुगल सेना के खिलाफ कौन सा प्रसिद्ध युद्ध लड़ा था?`;
      } else if (eng.q.includes("Aravalli Range")) {
        hindiQ = `कौन सी पर्वत श्रृंखला राजस्थान को जल विभाजक के रूप में दो भागों में बांटती है?`;
      } else if (eng.q.includes("Mehrangarh Fort")) {
        hindiQ = `जोधपुर का कौन सा ऐतिहासिक किला चिड़ियाटूँक पहाड़ी पर बना है और अपनी वास्तुकला के लिए प्रसिद्ध है?`;
      } else if (eng.q.includes("Chittorgarh Fort")) {
        hindiQ = `चित्तौड़गढ़ का कौन सा किला भारत का सबसे बड़ा किला परिसर है और विजय स्तंभ के लिए प्रसिद्ध है?`;
      } else if (eng.q.includes("Pushkar Fair")) {
        hindiQ = `राजस्थान के अजमेर जिले में प्रतिवर्ष लगने वाला कौन सा मेला ऊंटों के व्यापार के लिए प्रसिद्ध है?`;
      } else if (eng.q.includes("Bani Thani")) {
        hindiQ = `किशनगढ़ शैली की किस प्रसिद्ध पेंटिंग को 'भारत की मोनालिसा' के रूप में जाना जाता है?`;
      } else if (eng.q.includes("Bijolia")) {
        hindiQ = `राजस्थान का कौन सा किसान आंदोलन 1897 में शुरू होकर 44 वर्षों तक चला और पूर्णतः अहिंसक था?`;
      } else if (eng.q.includes("Panchayati Raj System")) {
        hindiQ = `अक्टूबर 1959 में भारत में सबसे पहले किस जिले में पंचायती राज व्यवस्था का उद्घाटन किया गया था?`;
      } else if (eng.q.includes("Keoladeo National Park")) {
        hindiQ = `राजस्थान का कौन सा राष्ट्रीय उद्यान पक्षी अभयारण्य के लिए प्रसिद्ध है और यूनेस्को की विश्व धरोहर स्थल है?`;
      } else if (eng.q.includes("object permanence")) {
        hindiQ = `पियाजे के अनुसार, संज्ञानात्मक विकास की किस अवस्था के दौरान बच्चा 'वस्तु स्थायित्व' विकसित करता है?`;
      } else if (eng.q.includes("Concrete Operational Stage")) {
        hindiQ = `जीन पियाजे के अनुसार, किस अवस्था में बच्चा मूर्त वस्तुओं पर तार्किक क्रियाएं करना शुरू करता है?`;
      } else if (eng.q.includes("Zone of Proximal Development")) {
        hindiQ = `वाइगोत्स्की ने उन कार्यों की श्रृंखला के लिए क्या शब्द दिया है जिसे बच्चा सहायता से कर सकता है लेकिन स्वतंत्र रूप से नहीं?`;
      } else if (eng.q.includes("Scaffolding")) {
        hindiQ = `शिक्षक द्वारा ZPD में बच्चे को कार्य पूरा करने के लिए दी जाने वाली अस्थायी सहायता को क्या कहा जाता है?`;
      } else if (eng.q.includes("Conventional Level")) {
        hindiQ = `कोहलबर्ग के नैतिक विकास के सिद्धांत में, कौन सा स्तर सामाजिक कानूनों और कर्तव्यों पर आधारित नैतिकता का प्रतिनिधित्व करता है?`;
      } else if (eng.q.includes("Howard Gardner")) {
        hindiQ = `किसने बहुबुद्धि सिद्धांत प्रतिपादित किया, जिसमें भाषाई, तार्किक और संगीत बुद्धि शामिल है?`;
      } else if (eng.q.includes("Dyslexia")) {
        hindiQ = `कौन सा अधिगम विकार (लर्निंग डिसेबिलिटी) मुख्य रूप से पढ़ने की गति, वर्तनी और ध्वन्यात्मक डिकोडिंग को प्रभावित करता है?`;
      } else if (eng.q.includes("Heuristic Method")) {
        hindiQ = `एच. ई. आर्मस्ट्रांग द्वारा प्रस्तावित कौन सी शिक्षण पद्धति छात्रों को स्वतंत्र शोधकर्ता के रूप में कार्य करने के लिए प्रोत्साहित करती है?`;
      } else if (eng.q.includes("Project Method")) {
        hindiQ = `कौन सी शिक्षण पद्धति जॉन डीवी के व्यावहारिक दर्शन पर आधारित है और विलियम किलपैट्रिक द्वारा लागू की गई थी?`;
      } else if (eng.q.includes("Formative Assessment")) {
        hindiQ = `छात्र के सीखने की निगरानी के लिए शिक्षण प्रक्रिया के दौरान लगातार कौन सा मूल्यांकन किया जाता है?`;
      } else if (eng.q.includes("Summative Assessment")) {
        hindiQ = `ग्रेड प्रदान करने और विषय पर पकड़ को सत्यापित करने के लिए पाठ्यक्रम के अंत में कौन सा मूल्यांकन किया जाता है?`;
      } else if (eng.q.includes("Hidden Curriculum")) {
        hindiQ = `उन अलिखित, अनौपचारिक मूल्यों और दृष्टिकोणों को क्या कहा जाता है जो छात्र स्कूल में सीखते हैं?`;
      } else if (eng.q.includes("Plan -> Act -> Observe -> Reflect")) {
        hindiQ = `कक्षा क्रियात्मक अनुसंधान (एक्शन रिसर्च) के चरणों का सही अनुक्रम क्या है?`;
      } else if (eng.q.includes("RTE")) {
        hindiQ = `किस अधिनियम ने भारत में 6 से 14 वर्ष की आयु के बच्चों के लिए मुफ्त और अनिवार्य शिक्षा को मौलिक अधिकार बना दिया?`;
      } else if (eng.q.includes("Lothal")) {
        hindiQ = `किस हड़प्पा स्थल से पुरातात्विक गोदीबाड़ा (डॉकयार्ड) के साक्ष्य मिले हैं?`;
      } else if (eng.q.includes("Mohenjo-daro")) {
        hindiQ = `विशाल स्नानागार (Great Bath) और कांसे की नर्तकी की मूर्ति के लिए कौन सा हड़प्पा स्थल प्रसिद्ध है?`;
      } else if (eng.q.includes("Ashoka the Great")) {
        hindiQ = `कलिंग युद्ध के बाद बौद्ध धर्म अपनाने के लिए कौन सा मौर्य सम्राट प्रसिद्ध था?`;
      } else if (eng.q.includes("Alauddin Khalji")) {
        hindiQ = `किस दिल्ली सुल्तान ने बाजार नियंत्रण और मूल्य सुधार लागू किए थे?`;
      } else if (eng.q.includes("Akbar")) {
        hindiQ = `किस मुगल शासक ने 'सुलह-ए-कुल' (सार्वभौमिक शांति) की धार्मिक नीति शुरू की थी?`;
      } else if (eng.q.includes("Ashtapradhan")) {
        hindiQ = `मराठा प्रशासन में शिवाजी के आठ मंत्रियों की परिषद को क्या कहा जाता था?`;
      } else if (eng.q.includes("Lord Cornwallis")) {
        hindiQ = `1793 में बंगाल में स्थायी बंदोबस्त (Permanent Settlement) भू-राजस्व प्रणाली किसने शुरू की थी?`;
      } else if (eng.q.includes("Rani Lakshmibhai")) {
        hindiQ = `झांसी में अंग्रेजों के खिलाफ 1857 के विद्रोह का नेतृत्व किसने किया था?`;
      } else if (eng.q.includes("Raja Ram Mohan Roy")) {
        hindiQ = `सती प्रथा जैसी सामाजिक बुराइयों के खिलाफ आवाज उठाने के लिए 1828 में ब्रह्म समाज की स्थापना किसने की थी?`;
      } else if (eng.q.includes("1920")) {
        hindiQ = `महात्मा गांधी ने असहयोग आंदोलन (Non-Cooperation Movement) किस वर्ष शुरू किया था?`;
      } else if (eng.q.includes("Plate Tectonics")) {
        hindiQ = `कौन सा भूगर्भीय सिद्धांत पृथ्वी की विवर्तनिक प्लेटों की गति की व्याख्या करता है?`;
      } else if (eng.q.includes("Stratosphere")) {
        hindiQ = `कौन सी वायुमंडलीय परत ओजोन परत को धारण करती है और पराबैंगनी किरणों से पृथ्वी की रक्षा करती है?`;
      } else if (eng.q.includes("Gulf Stream")) {
        hindiQ = `उत्तरी अमेरिका के पूर्वी तट पर बहने वाली गर्म महासागरीय धारा कौन सी है?`;
      } else if (eng.q.includes("Kanchenjunga")) {
        hindiQ = `पूरी तरह से भारतीय क्षेत्र में स्थित सबसे ऊंची पर्वत चोटी कौन सी है?`;
      } else if (eng.q.includes("Godavari")) {
        hindiQ = `लंबाई और आकार के कारण किस नदी को 'दक्षिण गंगा' कहा जाता है?`;
      } else if (eng.q.includes("Western Disturbances")) {
        hindiQ = `कौन सी पवन प्रणाली भारत के उत्तर-पश्चिमी हिस्सों में सर्दियों में वर्षा लाती है?`;
      } else if (eng.q.includes("Black Soil")) {
        hindiQ = `कपास की खेती के लिए कौन सी मिट्टी सबसे उपयुक्त है, जिसे रेगुर मिट्टी भी कहा जाता है?`;
      } else if (eng.q.includes("Rabi Crops")) {
        hindiQ = `सर्दियों में बोई जाने वाली और वसंत ऋतु में काटी जाने वाली फसलों (जैसे गेहूं, जौ) को क्या कहा जाता है?`;
      } else if (eng.q.includes("Bihar")) {
        hindiQ = `2011 की जनगणना के अनुसार, भारत के किस राज्य में जनसंख्या घनत्व सबसे अधिक है?`;
      } else if (eng.q.includes("Gross Domestic Product")) {
        hindiQ = `कौन सा संकेतक देश की सीमाओं के भीतर उत्पादित अंतिम वस्तुओं और सेवाओं के कुल मूल्य को मापता है?`;
      } else if (eng.q.includes("Phillips Curve")) {
        hindiQ = `कौन सा आर्थिक वक्र मुद्रास्फीति और बेरोजगारी के बीच संबंध को दर्शाता है?`;
      } else if (eng.q.includes("Repo Rate")) {
        hindiQ = `वह दर क्या है जिस पर भारतीय रिजर्व बैंक व्यावसायिक बैंकों को अल्पकालिक ऋण देता है?`;
      } else if (eng.q.includes("Capital Budget")) {
        hindiQ = `केंद्रीय बजट के किस खाते में वित्तीय संपत्तियों/देनदारियों को बनाने या कम करने वाले लेनदेन शामिल होते हैं?`;
      } else if (eng.q.includes("Non-Performing Asset")) {
        hindiQ = `भारतीय वाणिज्यिक बैंकिंग क्षेत्र में एनपीए (NPA) का पूर्ण रूप क्या है?`;
      } else if (eng.q.includes("Balance of Payments")) {
        hindiQ = `कौन सी प्रणाली किसी देश के निवासियों और शेष विश्व के बीच सभी आर्थिक लेनदेन का रिकॉर्ड रखती है?`;
      } else if (eng.q.includes("Gini Coefficient")) {
        hindiQ = `जनसंख्या में आय असमानता को मापने के लिए किस गणितीय सूचकांक का व्यापक रूप से उपयोग किया जाता है?`;
      } else if (eng.q.includes("NITI Aayog")) {
        hindiQ = `जनवरी 2015 में भारत के योजना आयोग के स्थान पर किस संवैधानिक निकाय का गठन किया गया?`;
      } else if (eng.q.includes("Minimum Support Price")) {
        hindiQ = `किस मूल्य निर्धारण तंत्र की घोषणा भारत सरकार द्वारा किसानों को मूल्य गिरावट से बचाने के लिए की जाती है?`;
      } else if (eng.q.includes("Geneva, Switzerland")) {
        hindiQ = `विश्व व्यापार संगठन (WTO) का मुख्यालय कहाँ स्थित है?`;
      } else {
        hindiQ = `[प्रश्न #${i}] विषय: ${subject} के अंतर्गत (${eng.topic}) - दी गई स्थिति का अध्ययन करें और सही विकल्प का चयन करें।`;
      }

      return {
        topic: eng.topic,
        q: hindiQ,
        correct: eng.correct,
        wrongs: eng.wrongs
      };
    };
  });
});

function generateSyllabusQuestions(exam, subject, lang) {
  const list = [];
  const activeTemplates = lang === "Hindi" ? hindiTemplates[subject] : englishTemplates[subject];
  
  for (let i = 1; i <= 150; i++) {
    const tempGen = activeTemplates[(i - 1) % activeTemplates.length];
    const data = tempGen(i);
    const year = years[(i - 1) % years.length];
    const shift = shifts[(i - 1) % shifts.length];
    const mcq = makeMCQ(data.q, data.correct, data.wrongs, i);

    list.push({
      ...mcq,
      exam,
      subject,
      topic: data.topic,
      year,
      shift,
      question_no: i,
      language: lang,
      explanation: lang === "Hindi" 
        ? `यह ${exam} के ${subject} विषय का विस्तृत हल है। सही उत्तर विकल्प ${mcq.correct_answer} है।`
        : `This is the step-by-step solution for ${exam} (${subject}). The correct option is ${mcq.correct_answer}.`
    });
  }
  return list;
}

async function seed() {
  console.log("=== STARTING MASTER ADVANCED PYQ SEEDER ===");

  // Clear existing questions from the database first
  console.log("Clearing all old questions from the database...");
  const { error: clearError } = await supabase.from("pyq_questions").delete().neq("id", 0);
  if (clearError) {
    console.error("Warning: Failed to clear old questions:", clearError.message);
  } else {
    console.log("Database cleared successfully.");
  }

  const allQuestions = [];

  // Generate 150 unique questions in English
  for (const exam of Object.keys(EXAMS)) {
    const subjects = EXAMS[exam];
    console.log(`Generating English questions for ${exam}...`);
    for (const subject of subjects) {
      const qList = generateSyllabusQuestions(exam, subject, "English");
      allQuestions.push(...qList);
    }
  }

  // Generate 150 unique questions in Hindi
  for (const exam of Object.keys(EXAMS)) {
    const subjects = EXAMS[exam];
    console.log(`Generating Hindi questions for ${exam}...`);
    for (const subject of subjects) {
      const qList = generateSyllabusQuestions(exam, subject, "Hindi");
      allQuestions.push(...qList);
    }
  }

  console.log(`Generated total of ${allQuestions.length} questions (4200 English, 4200 Hindi).`);
  console.log("Inserting questions into Supabase in batches of 100...");

  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < allQuestions.length; i += batchSize) {
    const batch = allQuestions.slice(i, i + batchSize);
    const { error } = await supabase.from("pyq_questions").insert(batch);
    
    if (error) {
      console.error(`Error inserting batch at offset ${i}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${allQuestions.length} questions...`);
    }
  }

  console.log("=== MASTER SEEDING COMPLETE ===");
}

seed();
