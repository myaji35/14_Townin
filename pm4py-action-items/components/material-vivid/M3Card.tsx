/**
 * Material Vivid M3 Card with Surface Tint
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { easings, surfaceTint } from '@/lib/material-vivid';

interface M3CardProps {
  children: ReactNode;
  level?: 0 | 1 | 2 | 3 | 4 | 5;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function M3Card({
  children,
  level = 1,
  className = '',
  hover = true,
  onClick,
}: M3CardProps) {
  const tintOpacity = surfaceTint[`level${level}`];

  return (
    <motion.div
      className={`rounded-2xl border border-[#23483f]/40 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{
        backgroundColor: '#1d3632',
        backgroundImage: `linear-gradient(
          rgba(19, 236, 182, ${tintOpacity}),
          rgba(19, 236, 182, ${tintOpacity})
        )`,
      }}
      onClick={onClick}
      whileHover={
        hover
          ? {
              y: -4,
              boxShadow: '0 10px 30px -10px rgba(19, 236, 182, 0.15)',
              borderColor: 'rgba(19, 236, 182, 0.6)',
            }
          : undefined
      }
      transition={{ duration: 0.3, ease: easings.standard }}
    >
      {children}
    </motion.div>
  );
}
