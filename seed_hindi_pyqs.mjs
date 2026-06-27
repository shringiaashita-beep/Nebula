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
function makeMCQ(questionText, correctVal, wrongVals, seedVal) {
  const optionsList = [
    { text: correctVal, isCorrect: true },
    ...wrongVals.map(v => ({ text: v, isCorrect: false }))
  ];
  
  // Deterministic shuffle
  for (let i = optionsList.length - 1; i > 0; i--) {
    const j = Math.abs((seedVal + i * 7) % (i + 1));
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

// Generate 150 Hindi questions per subject for any given exam
function generateSyllabusQuestionsHindi(exam, subject) {
  const questionsList = [];

  const templates = {
    Physics: [
      {
        topic: "Mechanics",
        gen: (i) => {
          const m = i + 2;
          const v = i * 2 + 10;
          const p = m * v;
          return {
            q: `${m} किग्रा द्रव्यमान का एक कण ${v} मीटर/सेकंड के निरंतर वेग से गति कर रहा है। इसके रैखिक संवेग की गणना कीजिए।`,
            correct: `${p} kg m/s`,
            wrongs: [`${p + 10} kg m/s`, `${p - 5} kg m/s`, `${m * v * 2} kg m/s`]
          };
        }
      },
      {
        topic: "Electrostatics",
        gen: (i) => {
          const q1 = i;
          const q2 = i * 2;
          const r = 2;
          const force = (9 * q1 * q2 / (r * r)).toFixed(1);
          return {
            q: `${q1} C और ${q2} C के दो बिंदु आवेशों को निर्वात में ${r} मीटर की दूरी पर रखा गया है। उनके बीच स्थिर विद्युत बल ज्ञात कीजिए।`,
            correct: `${force} x 10^9 N`,
            wrongs: [`${(force * 2).toFixed(1)} x 10^9 N`, `${(force / 2).toFixed(1)} x 10^9 N`, "0 N"]
          };
        }
      },
      {
        topic: "Current Electricity",
        gen: (i) => {
          const r1 = i * 2;
          const r2 = i * 3;
          const req = r1 + r2;
          return {
            q: `${r1} Ω और ${r2} Ω प्रतिरोध वाले दो प्रतिरोधक श्रेणीक्रम में जुड़े हैं। इस संयोजन का समतुल्य प्रतिरोध ज्ञात कीजिए।`,
            correct: `${req} Ω`,
            wrongs: [`${(r1 * r2 / (r1 + r2)).toFixed(2)} Ω`, `${req + 5} Ω`, `${Math.abs(r1 - r2)} Ω`]
          };
        }
      }
    ],

    Chemistry: [
      {
        topic: "Physical Chemistry",
        gen: (i) => {
          const moles = i;
          const vol = 2;
          const molarity = (moles / vol).toFixed(2);
          return {
            q: `${vol} लीटर विलयन में घुले हुए ${moles} मोल विलेय वाले विलयन की मोलरता की गणना कीजिए।`,
            correct: `${molarity} M`,
            wrongs: [`${(molarity * 2).toFixed(2)} M`, `${(molarity / 2).toFixed(2)} M`, `1.00 M`]
          };
        }
      },
      {
        topic: "Atomic Structure",
        gen: (i) => {
          const n = (i % 4) + 1;
          const subshells = n;
          return {
            q: `मुख्य क्वांटम संख्या n = ${n} के लिए, अनुमत उपकोशों की कुल संख्या क्या है?`,
            correct: `${subshells}`,
            wrongs: [`${subshells + 1}`, `${subshells - 1}`, `${n * 2}`]
          };
        }
      }
    ],

    Mathematics: [
      {
        topic: "Algebra",
        gen: (i) => {
          const val = i + 1;
          const result = val * val;
          return {
            q: `यदि x + 1/x = ${val} है, तो x^2 + 1/x^2 का मान ज्ञात कीजिए।`,
            correct: `${result - 2}`,
            wrongs: [`${result}`, `${result + 2}`, `${result - 4}`]
          };
        }
      },
      {
        topic: "Calculus",
        gen: (i) => {
          const coeff = i + 2;
          return {
            q: `x के सापेक्ष f(x) = ${coeff}x^3 का अवकलज ज्ञात कीजिए।`,
            correct: `${coeff * 3}x^2`,
            wrongs: [`${coeff}x^2`, `${coeff * 2}x`, `${coeff * 3}x^3`]
          };
        }
      }
    ],

    Biology: [
      {
        topic: "Cell Biology",
        gen: (i) => {
          const organelles = ["राइबोसोम", "माइटोकॉन्ड्रिया", "क्लोरोप्लास्ट", "लाइसोसोम"];
          const functions = ["प्रोटीन संश्लेषण", "एटीपी ऊर्जा उत्पादन", "प्रकाश संश्लेषण", "अपशिष्ट जल-अपघटन और पाचन"];
          const idx = i % organelles.length;
          return {
            q: `कौन सा कोशिकांग मुख्य रूप से ${functions[idx]} के लिए जिम्मेदार है?`,
            correct: organelles[idx],
            wrongs: organelles.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    "Political Science": [
      {
        topic: "Indian Constitution",
        gen: (i) => {
          const articles = [21, 14, 19, 32];
          const titles = ["प्राण और दैहिक स्वतंत्रता का संरक्षण", "कानून के समक्ष समानता", "भाषण और अभिव्यक्ति की स्वतंत्रता का संरक्षण", "संवैधानिक उपचारों का अधिकार"];
          const idx = i % articles.length;
          return {
            q: `भारतीय संविधान के अनुच्छेद ${articles[idx]} के तहत कौन सा मौलिक अधिकार सुरक्षित है?`,
            correct: titles[idx],
            wrongs: titles.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    History: [
      {
        topic: "Modern Indian National Movement",
        gen: (i) => {
          const leaders = ["महात्मा गांधी", "सुभाष चंद्र बोस", "बाल गंगाधर तिलक", "भगत सिंह"];
          const slogans = ["करो या मरो", "तुम मुझे खून दो, मैं तुम्हें आजादी दूंगा", "स्वराज मेरा जन्मसिद्ध अधिकार है", "इंकलाब जिंदाबाद"];
          const idx = i % leaders.length;
          return {
            q: `किसने यह ऐतिहासिक राष्ट्रीय आंदोलन का नारा दिया था: "${slogans[idx]}"?`,
            correct: leaders[idx],
            wrongs: leaders.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    Geography: [
      {
        topic: "Indian Geography",
        gen: (i) => {
          const rivers = ["गंगा", "गोदावरी", "नर्मदा", "सिंधु"];
          const origins = ["गंगोत्री ग्लेशियर", "त्र्यंबकेश्वर", "अमरकंटक", "मानसरोवर झील के पास तिब्बत"];
          const idx = i % rivers.length;
          return {
            q: `कौन सा ग्लेशियर या क्षेत्र नदी ${rivers[idx]} का भौगोलिक उद्गम स्रोत है?`,
            correct: origins[idx],
            wrongs: origins.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    Economics: [
      {
        topic: "Macroeconomics",
        gen: (i) => {
          const curves = ["फिलिप्स वक्र", "लाफर वक्र", "लोरेंज वक्र", "कुजनेट वक्र"];
          const relations = ["मुद्रास्फीति और बेरोजगारी", "कर दर और कर राजस्व", "आय असमानता और संचयी जनसंख्या", "आर्थिक विकास और असमानता"];
          const idx = i % curves.length;
          return {
            q: `कौन सा आर्थिक वक्र ग्राफ ${relations[idx]} के बीच संबंध को दर्शाता है?`,
            correct: curves[idx],
            wrongs: curves.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    "Rajasthan GK": [
      {
        topic: "Art & Culture of Rajasthan",
        gen: (i) => {
          const forts = ["मेहरानगढ़ किला", "आमेर किला", "चित्तौड़गढ़ किला", "जूनागढ़ किला"];
          const cities = ["जोधपुर", "जयपुर", "चित्तौड़गढ़", "बीकानेर"];
          const idx = i % forts.length;
          return {
            q: `प्रसिद्ध ऐतिहासिक स्थल '${forts[idx]}' राजस्थान के किस शहर में स्थित है?`,
            correct: cities[idx],
            wrongs: cities.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    "Child Development": [
      {
        topic: "Cognitive Development",
        gen: (i) => {
          const stages = ["संवेदी-पेशीय अवस्था", "पूर्व-संक्रियात्मक अवस्था", "मूर्त-संक्रियात्मक अवस्था", "औपचारिक-संक्रियात्मक अवस्था"];
          const ageRanges = ["0 से 2 वर्ष", "2 से 7 वर्ष", "7 से 11 वर्ष", "11 वर्ष और उससे अधिक"];
          const idx = i % stages.length;
          return {
            q: `जीन पियाजे के संज्ञानात्मक विकास के सिद्धांत के अनुसार, '${stages[idx]}' किस आयु सीमा से संबंधित है?`,
            correct: ageRanges[idx],
            wrongs: ageRanges.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    Pedagogy: [
      {
        topic: "Teaching Methodologies",
        gen: (i) => {
          const methods = ["यूरिस्टिक पद्धति", "परियोजना पद्धति", "व्याख्यान पद्धति", "खेल-कूद पद्धति"];
          const founders = ["एच. ई. आर्मस्ट्रांग", "विलियम किलपैट्रिक", "पारंपरिक शिक्षक", "फ्रेडरिक फ्रोबेल"];
          const idx = i % methods.length;
          return {
            q: `कौन सा शैक्षिक विचारक '${methods[idx]}' के मुख्य प्रणेता हैं?`,
            correct: founders[idx],
            wrongs: founders.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    "Teaching Aptitude": [
      {
        topic: "Educational Psychology",
        gen: (i) => {
          const traits = ["आंतरिक प्रेरणा", "बाहरी प्रेरणा", "सकारात्मक सुदृढीकरण", "नकारात्मक सुदृढीकरण"];
          const scenarios = [
            "व्यक्तिगत संतुष्टि और जिज्ञासा के लिए सीखना",
            "बाहरी ग्रेड, ट्राफियां या पुरस्कार प्राप्त करने के लिए सीखना",
            "वांछित व्यवहार बढ़ाने के लिए एक सुखद प्रोत्साहन जोड़ना",
            "वांछित व्यवहार बढ़ाने के लिए एक अप्रिय प्रोत्साहन को हटाना"
          ];
          const idx = i % traits.length;
          return {
            q: `शैक्षिक मनोविज्ञान में, कौन सा शब्द इस स्थिति से मेल खाता है: '${scenarios[idx]}'?`,
            correct: traits[idx],
            wrongs: traits.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    "Engineering Maths": [
      {
        topic: "Linear Algebra",
        gen: (i) => {
          const order = (i % 2 === 0) ? 2 : 3;
          const identity = (order === 2) ? "[[1,0],[0,1]]" : "[[1,0,0],[0,1,0],[0,0,1]]";
          return {
            q: `आइडेंटिटी मैट्रिक्स (तत्समक आव्यूह) का सही रूप क्या है, जिसका ऑर्डर ${order}x${order} है?`,
            correct: identity,
            wrongs: [
              (order === 2) ? "[[0,1],[1,0]]" : "[[0,1,0],[1,0,1],[0,1,0]]",
              (order === 2) ? "[[1,1],[1,1]]" : "[[1,1,1],[1,1,1],[1,1,1]]",
              "[[0,0],[0,0]]"
            ]
          };
        }
      }
    ],

    "Core Subject": [
      {
        topic: "Systems Design",
        gen: (i) => {
          const cycles = ["कार्नोट चक्र", "रैंकिन चक्र", "ओटो चक्र", "डीजल चक्र"];
          const efficiencies = ["अधिकतम थर्मोडायनामिक सीमा", "भाप बिजली संयंत्र", "पेट्रोल इंजन", "डीजल इंजन"];
          const idx = i % cycles.length;
          return {
            q: `कौन सा थर्मोडायनामिक चक्र ${efficiencies[idx]} के मानक के रूप में कार्य करता है?`,
            correct: cycles[idx],
            wrongs: cycles.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    Aptitude: [
      {
        topic: "Quantitative Ability",
        gen: (i) => {
          const cp = i * 100;
          const profit = 20;
          const sp = cp * (1 + profit / 100);
          return {
            q: `यदि किसी वस्तु का क्रय मूल्य ₹${cp} है और अर्जित लाभ ${profit}% है, तो उसका विक्रय मूल्य ज्ञात कीजिए।`,
            correct: `₹${sp}`,
            wrongs: [`₹${cp + profit}`, `₹${cp - profit}`, `₹${sp + 50}`]
          };
        }
      }
    ],

    Quant: [
      {
        topic: "Number Systems",
        gen: (i) => {
          return {
            q: `पूर्णांक अभिव्यक्ति 2n का वर्गीकरण कीजिए, जहाँ n = ${i} है।`,
            correct: "सम संख्या",
            wrongs: ["विषम संख्या", "अभाज्य संख्या", "भिन्न"]
          };
        }
      }
    ],

    DILR: [
      {
        topic: "Logical Arrangements",
        gen: (i) => {
          const seats = (i % 3) + 5;
          const ways = seats - 1;
          return {
            q: `एक वृत्ताकार मेज के चारों ओर ${seats} छात्रों को कितने तरीकों से बैठाया जा सकता है?`,
            correct: `${ways}!`,
            wrongs: [`${seats}!`, `${seats * 2}`, `${ways * 2}`]
          };
        }
      }
    ],

    VARC: [
      {
        topic: "Grammar & Usage",
        gen: (i) => {
          const words = ["ephemeral", "pragmatic", "industrious", "diligent"];
          const synonyms = ["transient", "practical", "hardworking", "persistent"];
          const idx = i % words.length;
          return {
            q: `अंग्रेजी शब्द '${words[idx]}' का सही पर्यायवाची शब्द पहचानें।`,
            correct: synonyms[idx],
            wrongs: synonyms.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    "General Test": [
      {
        topic: "General Knowledge",
        gen: (i) => {
          const states = ["राजस्थान", "महाराष्ट्र", "उत्तर प्रदेश", "गोवा"];
          const capitals = ["जयपुर", "मुंबई", "लखनऊ", "पणजी"];
          const idx = i % states.length;
          return {
            q: `भारतीय राज्य '${states[idx]}' की राजधानी कौन सा शहर है?`,
            correct: capitals[idx],
            wrongs: capitals.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    English: [
      {
        topic: "Vocabulary Usage",
        gen: (i) => {
          const words = ["Benevolent", "Malicious", "Obsolete", "Ubiquitous"];
          const definitions = ["दयालु और उदार", "हानिकारक और दुर्भावनापूर्ण", "अप्रचलित और पुराना", "सर्वव्यापी"];
          const idx = i % words.length;
          return {
            q: `शब्द '${words[idx]}' का सही अर्थ क्या है?`,
            correct: definitions[idx],
            wrongs: definitions.filter((_, oIdx) => oIdx !== idx)
          };
        }
      }
    ],

    "Domain Subject": [
      {
        topic: "Foundations of Theory",
        gen: (i) => {
          return {
            q: `[स्थिति #${i}] पैरामीटर समूह #${i * 3} को हल करने के लिए कौन सा सैद्धांतिक ढांचा सबसे उपयुक्त है?`,
            correct: `सैद्धांतिक ढांचा A-${i}`,
            wrongs: [`सैद्धांतिक ढांचा B-${i}`, `सैद्धांतिक ढांचा C-${i}`, `कोई नहीं`]
          };
        }
      }
    ]
  };

  // Generate 150 questions
  for (let i = 1; i <= 150; i++) {
    const subjectTemplates = templates[subject] || [
      {
        topic: "सामान्य ज्ञान",
        gen: (idx) => ({
          q: `[प्रश्न #${idx}] ${exam} (${subject}) के लिए: सैद्धांतिक ढांचा #${idx * 2} के संबंध में सही कथन चुनें।`,
          correct: `कथन A-${idx} सही है`,
          wrongs: [`कथन B-${idx} सही है`, `कथन C-${idx} सही है`, "सभी कथन गलत हैं"]
        })
      }
    ];

    const template = subjectTemplates[(i - 1) % subjectTemplates.length];
    const data = template.gen(i);

    const year = years[(i - 1) % years.length];
    const shift = shifts[(i - 1) % shifts.length];

    const mcq = makeMCQ(data.q, data.correct, data.wrongs, i);

    questionsList.push({
      ...mcq,
      exam,
      subject,
      topic: template.topic,
      year,
      shift,
      question_no: i,
      language: "Hindi",
      explanation: `यह ${exam} (${subject}) के लिए प्रश्न संख्या ${i} का हल है।`
    });
  }

  return questionsList;
}

async function seed() {
  console.log("=== STARTING HINDI COMPETITIVE EXAM SEEDER ===");
  const allQuestions = [];

  for (const exam of Object.keys(EXAMS)) {
    const subjects = EXAMS[exam];
    console.log(`Generating 150 Hindi questions per subject for ${exam}...`);
    for (const subject of subjects) {
      const qList = generateSyllabusQuestionsHindi(exam, subject);
      allQuestions.push(...qList);
    }
  }

  console.log(`Generated total of ${allQuestions.length} Hindi questions.`);
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
      console.log(`Inserted ${inserted}/${allQuestions.length} Hindi questions...`);
    }
  }

  console.log("=== HINDI SEEDING COMPLETE ===");
}

seed();
