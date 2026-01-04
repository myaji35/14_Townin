/**
 * Townin Design System - Card Component
 *
 * 전단지, 통계 등 다양한 콘텐츠를 표시하는 카드 컴포넌트
 */

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlighted' | 'flat';
  hover?: boolean;
  onClick?: () => void;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', variant = 'default', hover = false, onClick }, ref) => {
    const baseStyles = 'rounded-xl overflow-hidden transition-all duration-300';

    const variantStyles = {
      default: 'bg-[#1d3632] border border-[#23483f]',
      highlighted: 'bg-[#1d3632] border border-[#13ecb6]/40',
      flat: 'bg-[#11221e] border border-[#23483f]',
    };

    const hoverStyles = hover
      ? 'hover:border-[#13ecb6] hover:shadow-[0_10px_30px_-10px_rgba(19,236,182,0.15)] hover:-translate-y-1 cursor-pointer'
      : '';

    const clickableStyles = onClick ? 'cursor-pointer' : '';

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${clickableStyles} ${className}`}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyPress={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
