import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import { GlobeStaticFallback } from './GlobeStaticFallback';

// Lazy-load the heavy 3D globe component so Three.js and react-globe.gl stay in a separate chunk
const Globe3DView = React.lazy(() => import('./Globe3DView'));

const STORAGE_KEY = 'fs_globe_intro_seen';

interface GlobeIntroOverlayProps {
  onComplete?: () => void;
}

export const GlobeIntroOverlay: React.FC<GlobeIntroOverlayProps> = ({ onComplete }) => {
  // Check if already seen in current browser session
  const [shouldRender, setShouldRender] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    // Check query parameter or hash to force replay for testing/review (?intro=true or #intro)
    const urlParams = new URLSearchParams(window.location.search);
    const forceReplay = urlParams.get('intro') === 'true' || window.location.hash.includes('intro');

    // Check prefers-reduced-motion: if set, skip straight to 2D view (unless forced)
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !forceReplay) {
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } catch {}
      return false;
    }

    if (forceReplay) {
      return true;
    }

    // Check sessionStorage: only play once per session
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
        return false;
      }
    } catch {}

    return true;
  });

  // Check device WebGL support: only fallback to static CSS globe if WebGL is unavailable
  const [isLowPerf] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return true;
    } catch {
      return true;
    }
    return false;
  });

  // Crossfade opacity state
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleFinish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {}

    setIsFadingOut(true);

    // Crossfade duration: 600ms smooth fade into the 2D view
    setTimeout(() => {
      setShouldRender(false);
      onComplete?.();
    }, 600);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  // Keyboard shortcut: ESC to skip intro
  useEffect(() => {
    if (!shouldRender) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shouldRender, handleSkip]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#0D0E15] flex items-center justify-center pointer-events-auto transition-opacity duration-600 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="3D Globe Intro Animation"
      role="dialog"
    >
      {/* 3D or Static Globe Layer */}
      <div className="absolute inset-0 w-full h-full">
        {isLowPerf ? (
          <GlobeStaticFallback onZoomComplete={handleFinish} />
        ) : (
          <Suspense fallback={<GlobeStaticFallback onZoomComplete={handleFinish} />}>
            <Globe3DView onZoomComplete={handleFinish} />
          </Suspense>
        )}
      </div>

      {/* Top Bar with Brand Badge and Skip Button */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#171924]/85 backdrop-blur-md border border-[#1F2135] text-xs">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="font-semibold text-slate-200 tracking-wide text-[11px] uppercase">
            FlowShield • Satellite View • India
          </span>
        </div>

        {/* Skip button visible from start of animation */}
        <button
          type="button"
          onClick={handleSkip}
          className="group flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md border border-slate-700/80 shadow-lg cursor-pointer transition-all active:scale-95"
          title="Skip intro animation (Esc)"
        >
          <span>Skip</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Coordinates & Centering Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#171924]/80 backdrop-blur-md border border-[#1F2135] text-[11px] font-mono text-slate-300">
          <span className="text-sky-400 font-bold">ORBIT:</span>
          <span>Survey of India Boundary (20.59° N, 78.96° E)</span>
        </div>
      </div>
    </div>
  );
};

export default GlobeIntroOverlay;
