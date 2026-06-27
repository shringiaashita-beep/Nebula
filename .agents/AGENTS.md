# Workspace Rules: Nebula Development

These rules apply automatically to Antigravity agents working in the Nebula workspace.

## Code Style & Best Practices
- **Framework & Libraries**: Build React components using Vite, Tailwind CSS, and Framer Motion.
- **Supabase Integration**:
  - Always verify user session validity before executing database actions.
  - Implement try/catch blocks on all queries and log details properly.
- **Gemini Integration**:
  - Always clean up markdown wrappers (` ```json `) before parsing JSON response payloads.
  - Avoid any blocking functions (e.g. `alert()`) inside API utility functions.
- **Component UX & Cleanliness**:
  - Disable buttons once an action is triggered to prevent duplicate submission.
  - Add loaders and empty states instead of showing raw/unfinished content.
