import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface SmoothThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const SmoothThemeToggle: React.FC<SmoothThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { resolvedDark, toggleTheme } = useTheme();

  const isSmall = size === 'sm';
  const width = isSmall ? 'w-16' : 'w-20 sm:w-22';
  const height = isSmall ? 'h-8' : 'h-9 sm:h-10';
  const knobSize = isSmall ? 'w-6 h-6' : 'w-7 h-7 sm:w-8 sm:h-8';
  const iconSize = isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={resolvedDark}
      aria-label={`Switch to ${resolvedDark ? 'Light' : 'Dark'} Mode`}
      onClick={toggleTheme}
      className={`relative inline-flex items-center select-none cursor-pointer rounded-full p-1 border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${width} ${height} ${
        resolvedDark
          ? 'bg-slate-900/90 border-slate-700/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
          : 'bg-amber-100/80 border-amber-300/80 shadow-[inset_0_2px_4px_rgba(217,119,6,0.15)]'
      } ${className}`}
      title={`Currently in ${resolvedDark ? 'Dark' : 'Light'} Mode. Click for smooth switch.`}
    >
      {/* Background Star Sparkles for Dark Mode */}
      <div
        className={`absolute inset-0 rounded-full overflow-hidden pointer-events-none transition-opacity duration-300 ${
          resolvedDark ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="absolute top-2 left-3 w-1 h-1 rounded-full bg-blue-300/60 animate-pulse" />
        <span className="absolute bottom-2 left-6 w-0.5 h-0.5 rounded-full bg-sky-200/80" />
        <span className="absolute top-2.5 right-7 w-1 h-1 rounded-full bg-indigo-300/50" />
      </div>

      {/* Stationary Sun Silhouette on Left */}
      <div
        className={`absolute left-2.5 flex items-center justify-center transition-all duration-300 pointer-events-none ${
          resolvedDark ? 'opacity-30 scale-90 text-slate-500' : 'opacity-0 scale-75 text-amber-500'
        }`}
      >
        <Sun className={iconSize} />
      </div>

      {/* Stationary Moon Silhouette on Right */}
      <div
        className={`absolute right-2.5 flex items-center justify-center transition-all duration-300 pointer-events-none ${
          resolvedDark ? 'opacity-0 scale-75 text-blue-400' : 'opacity-35 scale-90 text-amber-700/60'
        }`}
      >
        <Moon className={iconSize} />
      </div>

      {/* Sliding Glowing Thumb / Knob */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 28,
        }}
        className={`flex items-center justify-center rounded-full shadow-md z-10 transition-colors duration-300 ${knobSize} ${
          resolvedDark
            ? 'ml-auto bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.4)]'
            : 'mr-auto bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-amber-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
        }`}
      >
        <motion.div
          key={resolvedDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {resolvedDark ? (
            <Moon className={`${iconSize} fill-white/80`} />
          ) : (
            <Sun className={`${iconSize} fill-amber-950/80`} />
          )}
        </motion.div>
      </motion.div>
    </button>
  );
};

export default SmoothThemeToggle;
