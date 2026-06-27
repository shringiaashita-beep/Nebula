/** @type {import('tailwindcss').Config} */

import typography from "@tailwindcss/typography";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // ── Legacy dynamic primary (ThemeContext compat) ──
        primary: {
          50:  "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
        },

        // ── Arclight Design System ──
        arc: {
          base:     "var(--arc-bg-base)",
          surface:  "var(--arc-bg-surface)",
          elevated: "var(--arc-bg-elevated)",
          gold: {
            400: "var(--arc-gold-400)",
            500: "var(--arc-gold-500)",
            600: "var(--arc-gold-600)",
          },
          text: {
            hero:      "var(--arc-text-hero)",
            primary:   "var(--arc-text-primary)",
            secondary: "var(--arc-text-secondary)",
            muted:     "var(--arc-text-muted)",
          },
          success: "var(--arc-success)",
          error:   "var(--arc-error)",
        },
      },

      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans:    ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        "arc-gold": "0 0 20px rgba(212, 175, 55, 0.15)",
        "arc-gold-lg": "0 0 40px rgba(212, 175, 55, 0.25)",
        "arc-card": "0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        "arc-inset": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },

      backgroundImage: {
        "arc-gold-gradient": "linear-gradient(135deg, var(--arc-gold-500), var(--arc-gold-600))",
        "arc-gold-text":     "linear-gradient(135deg, var(--arc-gold-400), var(--arc-gold-600))",
        "arc-hero-text":     "linear-gradient(to bottom, #FFFFFF, #94A3B8)",
      },

      animation: {
        "pulse-gold": "pulseGold 3s ease-in-out infinite",
        "fade-in":    "fadeIn 0.4s ease-out forwards",
        "slide-up":   "slideUp 0.4s ease-out forwards",
      },

      keyframes: {
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.15)" },
          "50%":      { boxShadow: "0 0 40px rgba(212, 175, 55, 0.30)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },

  plugins: [typography],
};