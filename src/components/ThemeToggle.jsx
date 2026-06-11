import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeToggle() {
  const {
    primaryColor,
    changeColor,
    colors,
    darkMode,
    toggleDarkMode,
    brightness,
    setBrightness,
  } = useContext(ThemeContext);

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg bg-slate-900 w-full overflow-hidden">

      <div className="flex items-center gap-3">
        <span className="text-white text-sm font-semibold">
          Theme:
        </span>

        <div className="flex gap-2 items-center flex-wrap">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() =>
                changeColor(color.name)
              }
              className={`w-6 h-6 rounded-full border-2 transition hover:scale-110 ${
                primaryColor === color.name
                  ? "border-white scale-110 shadow-lg"
                  : "border-slate-600 hover:border-white"
              }`}
              style={{
                backgroundColor:
                  color.hex,
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">

        <div className="flex flex-wrap gap-1 bg-slate-800 p-1 rounded-md">
          <button
            className={`px-2 py-0.5 text-xs rounded ${
              brightness === "muted"
                ? "bg-slate-700 text-white"
                : "text-slate-300"
            }`}
            onClick={() =>
              setBrightness("muted")
            }
          >
            Muted
          </button>

          <button
            className={`px-2 py-0.5 text-xs rounded ${
              brightness === "normal"
                ? "bg-slate-700 text-white"
                : "text-slate-300"
            }`}
            onClick={() =>
              setBrightness("normal")
            }
          >
            Normal
          </button>

          <button
            className={`px-2 py-0.5 text-xs rounded ${
              brightness === "bright"
                ? "bg-slate-700 text-white"
                : "text-slate-300"
            }`}
            onClick={() =>
              setBrightness("bright")
            }
          >
            Bright
          </button>
        </div>

        <button
          onClick={toggleDarkMode}
          className="w-full px-2 py-1 bg-slate-800 text-sm text-white rounded-md border border-slate-700"
        >
          {darkMode
            ? "Dark"
            : "Light"}
        </button>

      </div>
    </div>
  );
}