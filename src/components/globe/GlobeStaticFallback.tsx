import React, { useEffect } from 'react';
import { INDIA_OFFICIAL_SVG_PATH } from './indiaSvgPath';

interface GlobeStaticFallbackProps {
  onZoomComplete: () => void;
}

export const GlobeStaticFallback: React.FC<GlobeStaticFallbackProps> = ({ onZoomComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onZoomComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onZoomComplete]);

  return (
    <div className="w-full h-full relative flex items-center justify-center bg-[#0D0E15] overflow-hidden">
      {/* Satellite Earth globe with smooth CSS zoom animation */}
      <div className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] rounded-full border border-sky-400/40 shadow-[0_0_90px_rgba(56,189,248,0.3)] flex items-center justify-center animate-scaleUp">
        {/* Satellite Earth Surface */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden border border-sky-300/30"
          style={{
            backgroundImage: "url('/earth_satellite.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: '68% 45%',
          }}
        >
          {/* Atmospheric limb glow overlay */}
          <div className="absolute inset-0 rounded-full bg-radial from-transparent via-transparent to-black/60 shadow-[inset_0_0_60px_rgba(56,189,248,0.35)]" />
        </div>

        {/* Orbit radar scan & Official Survey of India boundary (including Jammu & Kashmir, Ladakh & PoK) */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full absolute inset-0 pointer-events-none"
        >
          {/* Orbital rings */}
          <ellipse cx="200" cy="200" rx="195" ry="195" className="stroke-sky-400/40 fill-none stroke-[1.2]" />
          <ellipse cx="200" cy="200" rx="195" ry="135" strokeDasharray="4 4" className="stroke-sky-400/30 fill-none stroke-[1.2] origin-center animate-globeOrbit" />

          {/* Authentic Official Survey of India boundary including PoK, Gilgit-Baltistan and Ladakh */}
          <path
            d={INDIA_OFFICIAL_SVG_PATH}
            className="stroke-sky-400 fill-sky-400/15 stroke-[1.4] filter drop-shadow-[0_0_6px_rgba(56,189,248,0.8)]"
          />

          {/* Radar target lock centered on India */}
          <circle cx="215" cy="190" r="18" className="stroke-sky-300 stroke-1 fill-sky-500/10 animate-pulse" />
          <circle cx="215" cy="190" r="8" className="stroke-sky-200 stroke-[1.5] fill-sky-400/30 animate-ping" />
          <circle cx="215" cy="190" r="2.5" className="stroke-none fill-white" />
        </svg>

        {/* Center telemetry label */}
        <div className="relative z-10 text-center pointer-events-none mt-40">
          <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-sky-400/40 text-[10px] font-mono tracking-widest text-sky-300 uppercase shadow-lg">
            Satellite View • India (Survey of India)
          </span>
        </div>
      </div>
    </div>
  );
};

export default GlobeStaticFallback;
