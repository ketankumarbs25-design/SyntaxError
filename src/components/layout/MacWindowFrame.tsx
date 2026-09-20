import React from 'react';

interface MacWindowFrameProps {
  children: React.ReactNode;
}

export const MacWindowFrame: React.FC<MacWindowFrameProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full py-4 sm:py-8 px-2 sm:px-6 flex items-center justify-center relative bg-cover bg-center bg-no-repeat transition-colors"
      style={{
        backgroundImage: `url('/sky_clouds_bg.jpg')`,
      }}
    >
      {/* Light atmospheric overlay for sky background */}
      <div className="absolute inset-0 bg-blue-500/10 dark:bg-slate-950/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Mac OS Window Shell (matching the user screenshots) */}
      <div className="relative z-10 w-full max-w-[1240px] rounded-[1.75rem] sm:rounded-[2.25rem] bg-white/95 dark:bg-[#0D0F18]/95 backdrop-blur-xl shadow-2xl border border-white/60 dark:border-slate-800/80 overflow-hidden flex flex-col transition-all">
        {/* macOS Window Titlebar with 🔴 🟡 🟢 dots */}
        <div className="h-9 px-4 sm:px-6 bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 shadow-xs cursor-pointer hover:opacity-80" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 shadow-xs cursor-pointer hover:opacity-80" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 shadow-xs cursor-pointer hover:opacity-80" />
          </div>

          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wider">
            FlowShield • Bengaluru Urban Telemetry
          </div>

          {/* Titlebar right controls: cloud/minimize icon & close icon */}
          <div className="flex items-center gap-2 text-slate-400">
            <svg className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
            </svg>
            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-500">
              <span className="text-[9px] text-slate-400 font-bold leading-none">×</span>
            </div>
          </div>
        </div>

        {/* Window Body */}
        <div className="w-full flex-1 flex flex-col bg-[#F8FAFD]/90 dark:bg-[#0D0F18]/95 min-h-[580px]">
          {children}
        </div>

        {/* Window Footer (exact match from Screenshot 1) */}
        <div className="px-6 py-3 bg-white/90 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 select-none">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-semibold text-slate-600 dark:text-slate-300">FlowShield v2.4</span>
            <span>|</span>
            <span>Bengaluru Urban Flood Monitoring</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
            <span className="text-emerald-500 text-sm">🍃</span>
            <span className="font-medium text-[11px] sm:text-xs">A Safer, Smarter, Greener Bengaluru</span>
            <span className="text-[10px] text-slate-400">⌵</span>
          </div>
        </div>
      </div>
    </div>
  );
};
