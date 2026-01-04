/**
 * Townin Design System - Button Component
 *
 * 재사용 가능한 버튼 컴포넌트
 * 접근성 준수 (WCAG 2.1 Level AA)
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-bold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#13ecb6] focus:ring-offset-2 focus:ring-offset-[#11221e] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

    const variantStyles = {
      primary: 'bg-[#13ecb6] hover:bg-[#10cfa0] text-[#11221e] shadow-[0_4px_14px_rgba(19,236,182,0.2)] hover:shadow-[0_6px_20px_rgba(19,236,182,0.3)] active:scale-[0.98]',
      secondary: 'bg-[#23483f] hover:bg-[#2d5a4f] text-white border border-[#13ecb6]/30',
      outline: 'border-2 border-[#23483f] hover:border-[#13ecb6] text-[#92c9bb] hover:text-white bg-transparent',
      ghost: 'text-[#92c9bb] hover:text-white hover:bg-[#1d3632]',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!isLoading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
