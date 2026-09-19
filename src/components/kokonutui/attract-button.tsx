"use client";

/**
 * @author: @dorianbaffier
 * @description: Attract Button
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import React, { useCallback, useEffect, useState } from "react";
import { Magnet } from "lucide-react";
import { motion, useAnimation } from "motion/react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export interface AttractButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  particleCount?: number;
  attractRadius?: number;
  label?: string;
  attractLabel?: string;
  colorVariant?: "violet" | "cyan" | "emerald" | "amber" | "rose";
  icon?: React.ReactNode;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

export function AttractButton({
  className,
  particleCount = 12,
  attractRadius = 50,
  label = "Hover me",
  attractLabel = "Attracting",
  colorVariant = "violet",
  icon,
  children,
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onTouchEnd,
  ...props
}: AttractButtonProps) {
  const [isAttracting, setIsAttracting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesControl = useAnimation();

  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: (Math.random() * 2 - 1) * (attractRadius * 1.8),
      y: (Math.random() * 2 - 1) * (attractRadius * 1.8),
    }));
    setParticles(newParticles);
  }, [particleCount, attractRadius]);

  const handleInteractionStart = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      setIsAttracting(true);
      if (onMouseEnter && "clientX" in e) onMouseEnter(e as React.MouseEvent<HTMLButtonElement>);
      if (onTouchStart && "touches" in e) onTouchStart(e as React.TouchEvent<HTMLButtonElement>);

      await particlesControl.start({
        x: 0,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 50,
          damping: 10,
        },
      });
    },
    [particlesControl, onMouseEnter, onTouchStart]
  );

  const handleInteractionEnd = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
      setIsAttracting(false);
      if (onMouseLeave && "clientX" in e) onMouseLeave(e as React.MouseEvent<HTMLButtonElement>);
      if (onTouchEnd && "touches" in e) onTouchEnd(e as React.TouchEvent<HTMLButtonElement>);

      await particlesControl.start((i) => ({
        x: particles[i]?.x ?? 0,
        y: particles[i]?.y ?? 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
        },
      }));
    },
    [particlesControl, particles, onMouseLeave, onTouchEnd]
  );

  const colorStyles = {
    violet: {
      btn: "bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border-violet-500/30 hover:border-violet-500/50 shadow-violet-500/10",
      particle: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]",
    },
    cyan: {
      btn: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:border-cyan-500/50 shadow-cyan-500/10",
      particle: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]",
    },
    emerald: {
      btn: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/10",
      particle: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
    },
    amber: {
      btn: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 hover:border-amber-500/50 shadow-amber-500/10",
      particle: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
    },
    rose: {
      btn: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30 hover:border-rose-500/50 shadow-rose-500/10",
      particle: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
    },
  }[colorVariant];

  return (
    <Button
      className={cn(
        "relative min-w-40 touch-none overflow-visible backdrop-blur-md transition-all duration-300",
        colorStyles.btn,
        className
      )}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchEnd={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      {...props}
    >
      {particles.map((particle, index) => (
        <motion.div
          key={particle.id}
          animate={particlesControl}
          custom={index}
          initial={{ x: particle.x, y: particle.y }}
          className={cn(
            "pointer-events-none absolute h-1.5 w-1.5 rounded-full",
            colorStyles.particle,
            "transition-opacity duration-300",
            isAttracting ? "opacity-100 scale-125" : "opacity-40 scale-100"
          )}
        />
      ))}
      <span className="relative z-10 flex w-full items-center justify-center gap-2">
        {icon !== undefined ? (
          icon
        ) : (
          <Magnet
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              isAttracting && "scale-125 rotate-12"
            )}
          />
        )}
        {children ?? (isAttracting ? attractLabel : label)}
      </span>
    </Button>
  );
}

export default AttractButton;
