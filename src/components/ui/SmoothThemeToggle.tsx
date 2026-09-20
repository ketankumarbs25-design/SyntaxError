import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface SmoothThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const SmoothThemeToggle: React.FC<SmoothThemeToggleProps> = ({
  className = '',
}) => {
  const { resolvedDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={resolvedDark}
      aria-label={`Switch to ${resolvedDark ? 'Light' : 'Dark'} Mode`}
      onClick={toggleTheme}
      className={`group relative inline-flex items-center h-8 w-[68px] rounded-full p-0.5 border cursor-pointer select-none transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 shrink-0 ${
        resolvedDark
          ? 'bg-slate-900 border-slate-700/80 shadow-inner'
          : 'bg-amber-100 border-amber-300/90 shadow-inner'
      } ${className}`}
      title={`Switch to ${resolvedDark ? 'Light' : 'Dark'} Mode`}
    >
      {/* Track Icons */}
      <span className="absolute left-2 text-amber-500/80 pointer-events-none flex items-center justify-center">
        <Sun className="w-3.5 h-3.5" />
      </span>
      <span className="absolute right-2 text-blue-400/80 pointer-events-none flex items-center justify-center">
        <Moon className="w-3.5 h-3.5" />
      </span>

      {/* GPU Accelerated Sliding Thumb - zero layout reflow, pure compositor transform */}
      <span
        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full shadow-md transition-transform duration-200 ease-out will-change-transform ${
          resolvedDark
            ? 'translate-x-[36px] bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-500/40'
            : 'translate-x-0 bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 shadow-amber-500/40'
        }`}
      >
        {resolvedDark ? (
          <Moon className="w-3.5 h-3.5 fill-white" />
        ) : (
          <Sun className="w-3.5 h-3.5 fill-amber-950" />
        )}
      </span>
    </button>
  );
};

export default SmoothThemeToggle;
