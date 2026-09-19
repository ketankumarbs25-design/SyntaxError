"use client";

/**
 * @author: @kokonut-labs
 * @description: Slide Text Button with animated vertical text transition
 * @version: 1.0.0
 * @date: 2025-11-02
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export interface SlideTextButtonProps {
  text?: string;
  hoverText?: string;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  className?: string;
  variant?: "default" | "ghost" | "cyan";
  disabled?: boolean;
}

export default function SlideTextButton({
  text = "Browse Components",
  hoverText,
  href,
  onClick,
  className,
  variant = "default",
  disabled,
  ...props
}: SlideTextButtonProps) {
  const slideText = hoverText ?? text;
  const variantStyles =
    variant === "ghost"
      ? "border border-slate-700/60 text-slate-300 hover:bg-slate-800/60 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
      : variant === "cyan"
      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 hover:text-white border border-cyan-500/40 shadow-sm"
      : "bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-700/60 dark:bg-white dark:text-black dark:hover:bg-white/90";

  const content = (
    <span className="relative inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
      <span className="flex items-center justify-center gap-2 opacity-100 transition-opacity duration-300 group-hover:opacity-0">
        <span className="font-semibold">{text}</span>
      </span>
      <span className="absolute top-full left-0 right-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="font-semibold">{slideText}</span>
      </span>
    </span>
  );

  const sharedClassName = cn(
    "group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-xl px-6 font-medium text-sm tracking-tight transition-all duration-300 w-full select-none cursor-pointer",
    variantStyles,
    disabled && "opacity-50 pointer-events-none cursor-not-allowed",
    className
  );

  return (
    <motion.div
      animate={{ x: 0, opacity: 1, transition: { duration: 0.2 } }}
      className="relative w-full"
      initial={{ x: 20, opacity: 0 }}
    >
      {href ? (
        <a
          className={sharedClassName}
          href={href}
          onClick={onClick}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      ) : (
        <button
          type="button"
          disabled={disabled}
          className={sharedClassName}
          onClick={onClick}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
      )}
    </motion.div>
  );
}

export { SlideTextButton };
