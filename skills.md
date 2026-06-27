# Development Skills for Nebula

This document defines core development skills and recipes for building and modifying components in the Nebula Study Command Center project.

---

## 🔑 Skill 1: Safe Gemini Prompting & JSON Parsing
Use this skill when designing a new Gemini AI feature that requires structured data output.

### Prompt Template
```javascript
const prompt = `
  Generate [Items] for [Subject/Topic].
  Return ONLY valid JSON. Do not include markdown formatting or explanation text.
  
  Format:
  [
    {
      "field1": "value",
      "field2": "value"
    }
  ]
`;
```

### Parsing Pipeline
```javascript
const parseJsonResponse = (text) => {
  try {
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (error) {
    // Fallback parsing regex here...
    throw new Error("AI returned invalid JSON. Please try again.");
  }
};
```

---

## 💾 Skill 2: Supabase Fetching and Mutating Checklist
Use this skill when reading/writing data from Supabase tables (e.g. `profiles`, `topics`, `pyq_questions`).

### Checklist
- Ensure `user_id` is fetched first using `supabase.auth.getUser()`.
- Add loading states (`loading`, `setLoading`) to prevent rendering empty elements.
- Implement empty state UI components so that screens do not remain blank or appear broken when tables have no rows.
- Ensure all mutations are followed by local state updates or a re-fetch to keep the screen in sync.

---

## 🎨 Skill 3: High-Quality UI & Animation Styling
Use this skill when developing or editing visual React components.

### Best Practices
- **Variables**: Prefer utilizing Tailwind classes combined with CSS variables (e.g. `var(--color-primary-50)`) for theme flexibility.
- **Glassmorphism**: Use backdrop filters: `bg-slate-900/90 backdrop-blur-lg border border-primary-500/20` for futuristic themes.
- **Framer Motion**: Add entrance and hover animations:
  ```jsx
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    {/* card content */}
  </motion.div>
  ```
