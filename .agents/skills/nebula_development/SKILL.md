---
name: nebula_development
description: Guidelines and code snippets for developing features in the Nebula React + Supabase + Gemini app.
---

# Nebula Development Guidelines

Use this skill when developing features or fixing bugs in the Nebula Study Command Center project.

## 1. Safe Gemini Parsing
Ensure all Gemini responses are processed through `parseJsonResponse` to remove markdown JSON backticks and avoid JSON parse exceptions.
For example:
```javascript
const cleaned = text
  .replace(/```json/gi, "")
  .replace(/```/g, "")
  .trim();
```

## 2. Supabase Entity Mutations
Always secure mutations using the user's ID:
```javascript
const { data: { user } } = await supabase.auth.getUser();
if (!user) return;
```

## 3. UI Component Integrity
- Disable choice buttons once selected in quizzes.
- Always provide feedback indicators (spinners/messages) during async calls.
