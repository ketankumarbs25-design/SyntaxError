// @ts-nocheck
'use client';
import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

// Accept any motion props via index signature
interface LiquidGlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  // Allow any additional props (e.g., motion animation props)
  [key: string]: any;
}

export const LiquidWeatherGlass: React.FC<LiquidGlassCardProps> = ({
  children,
  className = '',
  style = {},
  ...motionProps
}) => {
  const glassStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: `1px solid var(--border-subtle)`,
    borderRadius: '1rem',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    ...style,
  };
  return (
    <motion.div
      {...motionProps}
      className={cn('backdrop-blur-xl shadow-sm', className)}
      style={glassStyle}
    >
      {children}
    </motion.div>
  );
};
