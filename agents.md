# Agent Profiles for Nebula Development

This document defines agent instructions and guidelines for developers and AI agents working on the Nebula Study Command Center project.

---

## 🎨 Agent Role: UI/UX Front-End Designer
- **Objective**: Maintain a premium, glassmorphic, responsive, and beautiful dark-themed dashboard.
- **Rules**:
  1. Use standard CSS custom variables for themes defined in `index.css`.
  2. Implement micro-animations using `framer-motion` for interaction feedback (buttons, cards, page transitions).
  3. Ensure fully responsive layouts (using responsive flexbox/grid classes from Tailwind).
  4. Never use plain native alert boxes (`alert()`) for user alerts; design integrated modal dialogs or use toast messages.

## 💾 Agent Role: Database & Supabase Engineer
- **Objective**: Handle secure database transactions, auth state changes, and robust queries.
- **Rules**:
  1. Validate the active user session via `supabase.auth.getUser()` before attempting any mutations.
  2. Always wrap Supabase fetches and mutations in `try-catch` blocks and log failures gracefully using `console.error`.
  3. Avoid memory leaks by cleaning up active listeners/subscriptions inside `useEffect` return statements.
  4. Ensure proper loading and empty states are represented in components (no eternal loaders).

## 🧠 Agent Role: AI & Prompt Engineer
- **Objective**: Interface with Google Generative AI APIs, crafting safe prompts and robust parser handlers.
- **Rules**:
  1. Keep prompt JSON schemas strict. Ask Gemini to return only raw JSON without markdown wrappers (e.g. ```json).
  2. Implement fallback JSON parsing (e.g. `parseJsonResponse`) to scrub markdown backticks and handle formatting anomalies safely.
  3. Prevent blocking operations (e.g. do not execute alerts or heavy synchronous transformations in API response utility functions).
  4. Gracefully parse Gemini quota limit errors and inform the user with friendly messaging rather than crashing components.
