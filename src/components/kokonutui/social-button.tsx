"use client";

/**
 * @author: @dorianbaffier
 * @description: Social Button
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Link, Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

type IconComponent = React.ComponentType<{ className?: string }>;

export interface ShareItem {
  icon: IconComponent;
  label: string;
}

export interface SocialButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  items?: ShareItem[];
  onShare?: (index: number, item: ShareItem) => void;
  className?: string;
}

const TwitterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
  </svg>
);

const DEFAULT_SHARE_ITEMS: ShareItem[] = [
  { icon: TwitterIcon, label: "Share on X / Twitter" },
  { icon: InstagramIcon, label: "Share on Instagram" },
  { icon: LinkedinIcon, label: "Share on LinkedIn" },
  { icon: Link, label: "Copy link" },
];

export default function SocialButton({
  label = "Share",
  items = DEFAULT_SHARE_ITEMS,
  onShare,
  className,
  ...props
}: SocialButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = (index: number) => {
    setActiveIndex(index);
    if (onShare) {
      onShare(index, items[index]);
    } else {
      const url = typeof window !== 'undefined' ? window.location.href : 'https://flowshield.io';
      const text = 'FlowShield — Real-time Cellular Hydrodynamic Flood Simulation Engine';
      const item = items[index];
      if (item.label.toLowerCase().includes('twitter')) {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      } else if (item.label.toLowerCase().includes('linkedin')) {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      } else if (item.label.toLowerCase().includes('instagram')) {
        window.open('https://instagram.com', '_blank');
      } else if (item.label.toLowerCase().includes('copy') || item.label.toLowerCase().includes('link')) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    }
    setTimeout(() => setActiveIndex(null), 300);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <motion.div
        animate={{
          opacity: isVisible ? 0 : 1,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
      >
        <Button
          className={cn(
            "relative min-w-36 h-9",
            "bg-slate-900/90 hover:bg-slate-800",
            "text-slate-200 hover:text-white",
            "border border-slate-700/60 shadow-sm",
            "transition-colors duration-200",
            className
          )}
          {...props}
        >
          <span className="flex items-center gap-2 text-xs font-semibold">
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Link className="h-3.5 w-3.5 text-cyan-400" />
            )}
            {copied ? "Link Copied!" : label}
          </span>
        </Button>
      </motion.div>

      <motion.div
        animate={{
          width: isVisible ? "auto" : 0,
        }}
        className="absolute top-0 left-0 flex h-9 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950/95 shadow-xl backdrop-blur-md z-30"
        transition={{
          duration: 0.3,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        {items.map((button, i) => (
          <motion.button
            animate={{
              opacity: isVisible ? 1 : 0,
              x: isVisible ? 0 : -20,
            }}
            aria-label={button.label}
            title={button.label}
            className={cn(
              "h-9",
              "w-9",
              "flex items-center justify-center",
              "bg-slate-900 hover:bg-cyan-500/20",
              "text-slate-300 hover:text-cyan-300",
              i === 0 && "rounded-l-xl",
              i === items.length - 1 && "rounded-r-xl",
              "border-r border-slate-800 last:border-r-0",
              "outline-none cursor-pointer",
              "relative overflow-hidden",
              "transition-colors duration-200"
            )}
            key={`share-${button.label}`}
            onClick={() => handleShare(i)}
            transition={{
              duration: 0.3,
              ease: [0.23, 1, 0.32, 1],
              delay: isVisible ? i * 0.05 : 0,
            }}
            type="button"
          >
            <motion.div
              animate={{
                scale: activeIndex === i ? 0.85 : 1,
              }}
              className="relative z-10"
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            >
              <button.icon className="h-4 w-4" />
            </motion.div>
            <motion.div
              animate={{
                opacity: activeIndex === i ? 0.25 : 0,
              }}
              className="absolute inset-0 bg-cyan-400"
              initial={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

export { SocialButton };
