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

    // Check query parameter in search or hash to force replay (?intro=true, #/?intro=true, or #intro)
    const searchParams = new URLSearchParams(window.location.search);
    const hashPart = window.location.hash || '';
    const hashQueryIdx = hashPart.indexOf('?');
    const hashParams = hashQueryIdx !== -1 ? new URLSearchParams(hashPart.slice(hashQueryIdx)) : null;
    const forceReplay =
      searchParams.get('intro') === 'true' ||
      (hashParams && hashParams.get('intro') === 'true') ||
      hashPart.includes('intro');

    if (forceReplay) {
      return true;
    }

    // Check prefers-reduced-motion: if set, skip straight to 2D view (unless forced replay)
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return false;
    }

    // Check sessionStorage: only play once per session
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
        return false;
      }
    } catch {}

    return true;
  });

  // Distinguish whether opened via user action or initial auto-intro
  const [isManualMode, setIsManualMode] = useState(false);

  // Check device WebGL support: only fallback to static CSS globe if WebGL is unavailable
  const [isLowPerf] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return true;
    } catch {
      return true;
    }
    return false;
  });

  // Replay event listener for manual trigger from UI / Menu Drawer / Map
  useEffect(() => {
    const handleReplay = () => {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
      setIsManualMode(true);
      setIsFadingOut(false);
      setShouldRender(true);
    };

    window.addEventListener('fs-replay-intro', handleReplay);
    return () => window.removeEventListener('fs-replay-intro', handleReplay);
  }, []);

  // Crossfade opacity state
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleFinish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {}

    setIsFadingOut(true);

    // Crossfade duration: 500ms smooth fade into the 2D view
    setTimeout(() => {
      setShouldRender(false);
      setIsManualMode(false);
      onComplete?.();
    }, 500);
  }, [onComplete]);

  // When initial zoom finishes: if manual mode, keep orbiting! If auto intro, stay in orbit or let user click
  const handleZoomComplete = useCallback(() => {
    if (!isManualMode) {
      // Allow user 4 seconds of ambient orbit before smooth auto-finish
      setTimeout(() => {
        handleFinish();
      }, 4000);
    }
  }, [isManualMode, handleFinish]);

  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  // Keyboard shortcut: ESC to skip intro / exit 3D
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
      className={`fixed inset-0 z-[99999] bg-[#0B1F33] flex items-center justify-center pointer-events-auto transition-opacity duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="3D Satellite Earth Globe View"
      role="dialog"
    >
      {/* 3D or Static Globe Layer */}
      <div className="absolute inset-0 w-full h-full">
        {isLowPerf ? (
          <GlobeStaticFallback onZoomComplete={handleZoomComplete} />
        ) : (
          <Suspense fallback={<GlobeStaticFallback onZoomComplete={handleZoomComplete} />}>
            <Globe3DView onZoomComplete={handleZoomComplete} />
          </Suspense>
        )}
      </div>

      {/* Top Bar with Brand Badge and Exit/Skip Button */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#12304A]/90 backdrop-blur-md border border-[#2F4B63] text-xs text-[#F3F7FA] shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#22B8CF] animate-pulse" />
          <span className="font-semibold tracking-wide text-[11px] uppercase">
            FlowShield • 3D Satellite Earth • India
          </span>
        </div>

        {/* Exit / Skip button visible from start */}
        <button
          type="button"
          onClick={handleSkip}
          className="group flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#12304A]/90 hover:bg-[#1E3A52] text-[#F3F7FA] text-xs font-semibold backdrop-blur-md border border-[#2F4B63] shadow-lg cursor-pointer transition-all active:scale-95"
          title="Exit 3D View (Esc)"
        >
          <span>{isManualMode ? 'Exit 3D View' : 'Explore 2D Map'}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[var(--live)] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Coordinates & Navigation Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#12304A]/90 backdrop-blur-md border border-[#2F4B63] text-[11px] font-mono text-[#B8C7D6] shadow-xl">
          <span className="text-[#22B8CF] font-bold">ORBIT:</span>
          <span>Survey of India Boundary (22.8° N, 79.5° E)</span>
          <span className="hidden sm:inline text-xs text-[#5B7085]">|</span>
          <span className="hidden sm:inline text-[10px] text-[#B8C7D6]">Press Esc or click Exit to return</span>
        </div>
      </div>
    </div>
  );
};

export default GlobeIntroOverlay;
