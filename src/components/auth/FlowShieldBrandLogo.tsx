/**
 * FLOWSHIELD — Primary Brand Logo
 * 
 * Visual concept: Protective Shield silhouette seamlessly enclosing
 * a dynamic Water Droplet and fluid wave contour.
 */

import React from 'react';

interface FlowShieldBrandLogoProps {
  className?: string;
  size?: number;
  withPulse?: boolean;
}

export const FlowShieldBrandLogo: React.FC<FlowShieldBrandLogoProps> = ({
  className = '',
  size = 48,
  withPulse = false,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Subtle pulse halo if requested */}
      {withPulse && (
        <span className="absolute inset-0 rounded-2xl bg-blue-400/20 animate-ping duration-1000 -z-10" />
      )}

      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
      >
        <defs>
          {/* Shield Outer Gradient */}
          <linearGradient id="shieldGrad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Droplet Gradient */}
          <linearGradient id="dropletGrad" x1="32" y1="14" x2="32" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="70%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>

          {/* Water Wave Gradient */}
          <linearGradient id="waveGrad" x1="20" y1="36" x2="44" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Shield Container */}
        <path
          d="M32 4L12 12V28C12 42.4 20.5 55.6 32 60C43.5 55.6 52 42.4 52 28V12L32 4Z"
          fill="url(#shieldGrad)"
          stroke="#2563eb"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Soft Inner Shield Stroke */}
        <path
          d="M32 8L16 14.5V28C16 39.8 22.8 50.8 32 54.8C41.2 50.8 48 39.8 48 28V14.5L32 8Z"
          stroke="#60a5fa"
          strokeOpacity="0.4"
          strokeWidth="1"
        />

        {/* Water Droplet nested in Shield Center */}
        <path
          d="M32 16C32 16 22 28 22 36C22 41.5228 26.4772 46 32 46C37.5228 46 42 41.5228 42 36C42 28 32 16 32 16Z"
          fill="url(#dropletGrad)"
          fillOpacity="0.95"
        />

        {/* Dynamic Wave Reflection in Droplet */}
        <path
          d="M25 36C27 34 30 34 32 36C34 38 37 38 39 36C38 41 35 43 32 43C29 43 26 41 25 36Z"
          fill="url(#waveGrad)"
          opacity="0.8"
        />

        {/* Top-Right Droplet Light Glint */}
        <circle cx="36" cy="27" r="2" fill="#ffffff" opacity="0.9" />
      </svg>
    </div>
  );
};
