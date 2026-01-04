/**
 * Material Vivid M3 Button with State Layer
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { easings, stateLayerOpacity } from '@/lib/material-vivid';

interface M3ButtonProps {
  children: ReactNode;
  variant?: 'filled' | 'outlined' | 'text' | 'tonal';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function M3Button({
  children,
  variant = 'filled',
  onClick,
  className = '',
  disabled = false,
}: M3ButtonProps) {
  const baseStyles =
    'relative isolate overflow-hidden px-6 py-3 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    filled:
      'bg-[#13ecb6] text-[#11221e] shadow-[0_4px_14px_rgba(19,236,182,0.2)] hover:shadow-[0_6px_20px_rgba(19,236,182,0.3)]',
    tonal: 'bg-[#23483f] text-[#13ecb6]',
    outlined:
      'border border-[#13ecb6] text-[#13ecb6] hover:border-[#10cfa0]',
    text: 'text-[#13ecb6]',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        !disabled
          ? ({ '--state-opacity': stateLayerOpacity.hover } as any)
          : undefined
      }
      whileTap={
        !disabled
          ? ({ '--state-opacity': stateLayerOpacity.press, scale: 0.98 } as any)
          : undefined
      }
      transition={{ duration: 0.15, ease: easings.standard }}
    >
      {/* State Layer */}
      <motion.span
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundColor:
            variant === 'filled' ? 'white' : 'var(--color-primary, #13ecb6)',
          opacity: 'var(--state-opacity, 0)',
        }}
        transition={{ duration: 0.15 }}
      />
      {children}
    </motion.button>
  );
}
