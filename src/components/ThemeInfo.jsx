import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export default function ThemeInfo() {
  const {
    primaryColor,
    currentColor,
    brightness,
    darkMode,
    applyGlobally,
    setApplyGlobally,
    applyShades,
  } = useContext(ThemeContext);

  // helper to read computed vars safely
  const readVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '—';

  return (
    <div className="p-3 bg-slate-800 text-white rounded-md text-sm">
      <div className="mb-2 font-semibold">Theme info</div>
      <div className="grid gap-1 text-xs">
        <div>Primary name: <span className="font-medium">{primaryColor}</span></div>
        <div>Primary hex: <span className="font-medium">{readVar('--color-primary-500') || currentColor.hex}</span></div>
        <div>Sidebar accent: <span className="font-medium">{readVar('--sidebar-accent')}</span></div>
        <div>Brightness: <span className="font-medium">{brightness}</span></div>
        <div>Dark mode: <span className="font-medium">{darkMode ? 'on' : 'off'}</span></div>
        <label className="mt-2 flex items-center gap-2">
          <input type="checkbox" checked={applyGlobally} onChange={(e)=>setApplyGlobally(e.target.checked)} />
          <span className="text-xs">Apply globally</span>
        </label>
      </div>
    </div>
  );
}
