import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const COLORS = [
  { name: "cyan", hex: "#06B6D4" },
  { name: "blue", hex: "#3B82F6" },
  { name: "purple", hex: "#A855F7" },
  { name: "pink", hex: "#EC4899" },
  { name: "orange", hex: "#F97316" },
  { name: "green", hex: "#10B981" },
];

export function ThemeProvider({ children }) {
  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem("primaryColor") || "cyan";
  });

  const [darkMode, setDarkMode] = useState(() => {
    const v = localStorage.getItem("darkMode");
    return v === "true";
  });

  const [brightness, setBrightness] = useState(() => {
    return localStorage.getItem("brightness") || "normal";
  });

  const [applyGlobally, setApplyGlobally] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "primaryColor",
      primaryColor
    );
  }, [primaryColor]);

  useEffect(() => {
    localStorage.setItem(
      "darkMode",
      darkMode
    );

    if (darkMode) {
      document.documentElement.classList.add(
        "dark"
      );
    } else {
      document.documentElement.classList.remove(
        "dark"
      );
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(
      "brightness",
      brightness
    );
  }, [brightness]);

  const hexToHsl = (hex) => {
    let r = 0,
      g = 0,
      b = 0;

    if (hex.length === 7) {
      r = parseInt(
        hex.substring(1, 3),
        16
      );
      g = parseInt(
        hex.substring(3, 5),
        16
      );
      b = parseInt(
        hex.substring(5, 7),
        16
      );
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;

      s =
        l > 0.5
          ? d / (2 - max - min)
          : d / (max + min);

      switch (max) {
        case r:
          h =
            (g - b) / d +
            (g < b ? 6 : 0);
          break;

        case g:
          h =
            (b - r) / d + 2;
          break;

        default:
          h =
            (r - g) / d + 4;
      }

      h /= 6;
    }

    return {
      h: h * 360,
      s: s * 100,
      l: l * 100,
    };
  };

  const hslToHex = ({
    h,
    s,
    l,
  }) => {
    s /= 100;
    l /= 100;

    const k = (n) =>
      (n + h / 30) % 12;

    const a =
      s *
      Math.min(l, 1 - l);

    const f = (n) => {
      const color =
        l -
        a *
          Math.max(
            Math.min(
              k(n) - 3,
              9 - k(n),
              1
            ),
            -1
          );

      return Math.round(
        255 * color
      )
        .toString(16)
        .padStart(2, "0");
    };

    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generateShades = (
    hex,
    brightnessMode = "normal"
  ) => {
    const base =
      hexToHsl(hex);

    const satFactor =
      brightnessMode === "bright"
        ? 1.12
        : brightnessMode ===
          "muted"
        ? 0.86
        : 1;

    const hsl = {
      h: base.h,
      s: Math.min(
        100,
        base.s * satFactor
      ),
      l: base.l,
    };

    const shades = {};

    const levels = {
      50: 96,
      100: 92,
      200: 78,
      300: 64,
      400: 50,
      500: hsl.l,
      600: hsl.l - 8,
      700: hsl.l - 16,
      800: hsl.l - 24,
      900: hsl.l - 32,
    };

    Object.keys(levels).forEach(
      (key) => {
        shades[key] =
          hslToHex({
            h: hsl.h,
            s: hsl.s,
            l: Math.max(
              0,
              levels[key]
            ),
          });
      }
    );

    return shades;
  };

  const applyShades = (
    colorName = primaryColor,
    brightnessMode = brightness
  ) => {
    const color =
      COLORS.find(
        (c) =>
          c.name === colorName
      ) || COLORS[0];

    const shades =
      generateShades(
        color.hex,
        brightnessMode
      );

    document.documentElement.style.setProperty(
      "--sidebar-accent",
      shades[500]
    );

    Object.entries(shades).forEach(
      ([key, value]) => {
        document.documentElement.style.setProperty(
          `--color-primary-${key}`,
          value
        );
      }
    );

    document.documentElement.style.setProperty(
      "--color-primary",
      shades[500]
    );

    return shades[500];
  };

  useEffect(() => {
    applyShades(
      primaryColor,
      brightness
    );
  }, [
    primaryColor,
    brightness,
  ]);

  const changeColor = (
    colorName
  ) => {
    setPrimaryColor(colorName);
  };

  const currentColor =
    COLORS.find(
      (c) =>
        c.name === primaryColor
    ) || COLORS[0];

  return (
    <ThemeContext.Provider
      value={{
        primaryColor,
        changeColor,
        colors: COLORS,
        currentColor,
        darkMode,
        toggleDarkMode: () =>
          setDarkMode(
            (prev) => !prev
          ),
        brightness,
        setBrightness,
        applyGlobally,
        setApplyGlobally,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}