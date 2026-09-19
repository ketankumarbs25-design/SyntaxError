"use client";

/**
 * @author: @kokonut-labs
 * @description: Enhanced Monochrome / Cyan Concentric Loader
 * @version: 1.0.0
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

export default function Loader({
  title = "Calculating hydrodynamic flow...",
  subtitle = "Evaluating 2D cellular water dispersion lattice",
  size = "md",
  className,
  ...props
}: LoaderProps) {
  const sizeConfig = {
    sm: {
      container: "size-16",
      titleClass: "text-xs/tight font-medium",
      subtitleClass: "text-[10px]/relaxed",
      spacing: "space-y-1.5",
      maxWidth: "max-w-44",
    },
    md: {
      container: "size-28",
      titleClass: "text-sm/snug font-medium",
      subtitleClass: "text-xs/relaxed",
      spacing: "space-y-2.5",
      maxWidth: "max-w-56",
    },
    lg: {
      container: "size-36",
      titleClass: "text-base/tight font-semibold",
      subtitleClass: "text-sm/relaxed",
      spacing: "space-y-3",
      maxWidth: "max-w-64",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-4 select-none",
        className
      )}
      {...props}
    >
      {/* Enhanced Multi-ring Concentric Loader */}
      <motion.div
        animate={{
          scale: [1, 1.02, 1],
        }}
        className={cn("relative", config.container)}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: [0.4, 0, 0.6, 1],
        }}
      >
        {/* Outer elegant ring with shimmer (cyan / white blend) */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(6, 182, 212) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            opacity: 0.85,
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {/* Primary animated ring with gradient */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(14, 165, 233) 120deg, rgba(6, 182, 212, 0.4) 240deg, transparent 360deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            opacity: 0.9,
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Secondary elegant ring - counter rotation */}
        <motion.div
          animate={{
            rotate: [0, -360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0deg, rgba(56, 189, 248, 0.6) 45deg, transparent 90deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            opacity: 0.45,
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: [0.4, 0, 0.6, 1],
          }}
        />

        {/* Accent particles */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 270deg, transparent 0deg, rgba(255, 255, 255, 0.8) 20deg, transparent 40deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            opacity: 0.6,
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Enhanced Typography with Breathing Animation */}
      {(title || subtitle) && (
        <motion.div
          animate={{
            opacity: 1,
            y: 0,
          }}
          className={cn("text-center", config.spacing, config.maxWidth)}
          initial={{ opacity: 0, y: 8 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {title && (
            <motion.h3
              animate={{
                opacity: 1,
                y: 0,
              }}
              className={cn(
                config.titleClass,
                "font-medium text-slate-100 leading-[1.2] tracking-[-0.01em] antialiased"
              )}
              initial={{ opacity: 0, y: 6 }}
              transition={{
                delay: 0.3,
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <motion.span
                animate={{
                  opacity: [0.95, 0.7, 0.95],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: [0.4, 0, 0.6, 1],
                }}
              >
                {title}
              </motion.span>
            </motion.h3>
          )}

          {subtitle && (
            <motion.p
              animate={{
                opacity: 1,
                y: 0,
              }}
              className={cn(
                config.subtitleClass,
                "font-normal text-slate-400 leading-[1.4] tracking-[-0.01em] antialiased"
              )}
              initial={{ opacity: 0, y: 4 }}
              transition={{
                delay: 0.4,
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <motion.span
                animate={{
                  opacity: [0.7, 0.45, 0.7],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: [0.4, 0, 0.6, 1],
                }}
              >
                {subtitle}
              </motion.span>
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  );
}

export { Loader };
