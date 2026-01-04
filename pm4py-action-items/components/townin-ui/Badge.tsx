/**
 * Townin Design System - Badge Component
 *
 * AI 추천, 카테고리 등을 표시하는 뱃지 컴포넌트
 */

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'category' | 'status';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'category', className = '' }) => {
  const baseStyles = 'inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold';

  const variantStyles = {
    accent: 'bg-[#13ecb6] text-[#11221e] shadow-[0_0_15px_rgba(19,236,182,0.4)]',
    category: 'bg-[#23483f] text-[#13ecb6] border border-[#13ecb6]/30',
    status: 'bg-[#1d3632] text-[#92c9bb] border border-[#23483f]',
  };

  return <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>{children}</span>;
};

export default Badge;
