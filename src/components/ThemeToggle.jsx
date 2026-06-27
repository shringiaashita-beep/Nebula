import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

export default function ThemeToggle() {
  const {
    primaryColor,
    changeColor,
    colors,
  } = useContext(ThemeContext);

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg bg-slate-900 w-full overflow-hidden">

      <div className="flex items-center gap-3">
        <span className="text-white text-sm font-semibold">
          🎨 Theme
        </span>

        <div className="flex gap-2 items-center flex-wrap">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() =>
                changeColor(color.name)
              }
              className={`w-8 h-8 rounded-full border-2 transition-all duration-300 hover:scale-110 cursor-pointer ${
                primaryColor === color.name
                  ? "border-white scale-110 shadow-lg"
                  : "border-slate-600 hover:border-white"
              }`}
              style={{
                backgroundColor: color.hex,
              }}
              title={color.name}
            />
          ))}
        </div>
      </div>

    </div>
  );
}