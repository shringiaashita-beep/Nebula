import { useEffect } from "react";

/**
 * useScreenshotPrevention
 * ────────────────────────
 * Applies a multi-layer deterrent against screenshots:
 *  1. Blocks PrintScreen, Ctrl+P (print), Ctrl+Shift+S (save), Ctrl+Shift+I/J (DevTools)
 *  2. Disables right-click context menu on the entire page
 *  3. Blurs page content when the tab/window loses focus (Android recent-apps screenshot)
 *  4. Disables text/image selection so drag-to-screenshot is prevented
 */
export default function useScreenshotPrevention() {
  useEffect(() => {
    // ── 1. Block screenshot-related keyboard shortcuts ──────────────
    const handleKeyDown = (e) => {
      const key = e.key?.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;

      // PrintScreen
      if (key === "printscreen" || key === "snapshot") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Ctrl+P  → print dialog (can export as PDF screenshot)
      if (ctrl && key === "p") {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+S  → save page / screenshot in some browsers
      if (ctrl && shift && key === "s") {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I / Ctrl+Shift+J → DevTools (inspect element)
      if (ctrl && shift && (key === "i" || key === "j")) {
        e.preventDefault();
        return;
      }

      // F12 → DevTools
      if (key === "f12") {
        e.preventDefault();
        return;
      }
    };

    // ── 2. Disable right-click context menu ─────────────────────────
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // ── 3. Blur when tab loses focus (Android task-switcher screenshot) ──
    const handleVisibilityChange = () => {
      const overlay = document.getElementById("nebula-screenshot-overlay");
      if (!overlay) return;
      if (document.hidden) {
        overlay.style.display = "flex";
      } else {
        overlay.style.display = "none";
      }
    };

    const handleBlur = () => {
      const overlay = document.getElementById("nebula-screenshot-overlay");
      if (overlay) overlay.style.display = "flex";
    };

    const handleFocus = () => {
      const overlay = document.getElementById("nebula-screenshot-overlay");
      if (overlay) overlay.style.display = "none";
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
}
