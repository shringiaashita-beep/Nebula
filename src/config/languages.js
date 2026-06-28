export const LANGUAGES = [
  {
    id: "english",
    label: "English",
    promptInstruction: "Generate content in fluent, professional English."
  },
  {
    id: "hindi",
    label: "हिन्दी",
    promptInstruction: "Generate content completely in Hindi using the Devanagari script. Do NOT use Roman letters."
  },
  {
    id: "hinglish",
    label: "Hinglish",
    promptInstruction: "Generate content in Roman Hindi (Hindi written using English letters). Example: 'Newton ka pehla niyam kehta hai ki...'. Do NOT mix Devanagari with Hinglish. Use only English letters."
  }
];

export const getLanguageConfig = (id) => {
  return LANGUAGES.find(lang => lang.id === id) || LANGUAGES[0];
};
