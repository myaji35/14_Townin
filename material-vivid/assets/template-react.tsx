'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode, useState } from 'react';

// ============================================
// M3 Design Tokens
// ============================================

export const colors = {
  light: {
    primary: '#6750A4',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EADDFF',
    secondary: '#625B71',
    bgBase: '#FFFBFE',
    bgContainer: '#F3EDF7',
    textPrimary: '#1D1B20',
    textSecondary: '#49454E',
    outline: '#79747E',
  },
  dark: {
    primary: '#D0BCFF',
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    secondary: '#CCC2DC',
    bgBase: '#1D1B20',
    bgContainer: '#2B2930',
    textPrimary: '#E6E1E5',
    textSecondary: '#CAC4D0',
    outline: '#938F99',
  },
};

export const easings = {
  standard: [0.2, 0, 0, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
  decelerate: [0, 0, 0, 1] as const,
  accelerate: [0.3, 0, 1, 1] as const,
};

export const durations = {
  short: 150,
  medium: 300,
  long: 500,
};

// ============================================
// State Layer Button
// ============================================

interface ButtonProps {
  children: ReactNode;
  variant?: 'filled' | 'outlined' | 'text';
  onClick?: () => void;
  className?: string;
}

export function M3Button({ 
  children, 
  variant = 'filled', 
  onClick,
  className = '' 
}: ButtonProps) {
  const baseStyles = 'relative isolate overflow-hidden px-6 py-3 rounded-full font-medium transition-all';
  
  const variants = {
    filled: 'bg-[var(--color-primary)] text-[var(--color-on-primary)]',
    outlined: 'border border-[var(--color-outline)] text-[var(--color-primary)] hover:border-[var(--color-primary)]',
    text: 'text-[var(--color-primary)]',
  };

  return (
    <motion.button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      onClick={onClick}
      whileHover={{ '--state-opacity': 0.08 } as any}
      whileTap={{ '--state-opacity': 0.12, scale: 0.98 } as any}
    >
      {/* State Layer */}
      <motion.span
        className="absolute inset-0 -z-10"
        style={{ 
          backgroundColor: variant === 'filled' ? 'white' : 'var(--color-primary)',
          opacity: 'var(--state-opacity, 0)',
        }}
        transition={{ duration: 0.15 }}
      />
      {children}
    </motion.button>
  );
}

// ============================================
// Surface Card with Tint
// ============================================

interface CardProps {
  children: ReactNode;
  level?: 0 | 1 | 2 | 3;
  className?: string;
  hover?: boolean;
}

export function M3Card({ 
  children, 
  level = 1, 
  className = '',
  hover = true 
}: CardProps) {
  const tintOpacity = [0, 0.05, 0.08, 0.11][level];

  return (
    <motion.div
      className={`rounded-2xl border border-[var(--color-outline)]/20 overflow-hidden ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-container)',
        backgroundImage: `linear-gradient(
          rgba(var(--color-primary-rgb), ${tintOpacity}),
          rgba(var(--color-primary-rgb), ${tintOpacity})
        )`,
      }}
      whileHover={hover ? { 
        y: -4,
        boxShadow: '0 10px 30px -10px rgba(var(--color-primary-rgb), 0.15)'
      } : undefined}
      transition={{ duration: 0.2, ease: easings.standard }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Animated List
// ============================================

interface AnimatedListProps {
  children: ReactNode[];
  className?: string;
}

export function AnimatedList({ children, className = '' }: AnimatedListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: easings.decelerate },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================
// Scroll-Linked Header
// ============================================

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export function M3Header({ title, children }: HeaderProps) {
  const { scrollY } = useScroll();
  
  const height = useTransform(scrollY, [0, 100], [80, 64]);
  const titleOpacity = useTransform(scrollY, [50, 100], [0, 1]);
  const backdropBlur = useTransform(scrollY, [0, 50], [0, 20]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-outline)]/20"
      style={{
        height,
        backgroundColor: 'var(--color-bg-container)',
        backdropFilter: useTransform(backdropBlur, (v) => `blur(${v}px)`),
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <motion.h1
          className="font-display font-semibold text-lg"
          style={{ opacity: titleOpacity }}
        >
          {title}
        </motion.h1>
        {children}
      </div>
    </motion.header>
  );
}

// ============================================
// Page Transition Wrapper
// ============================================

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        enter: { duration: 0.4, ease: easings.decelerate },
        exit: { duration: 0.2, ease: easings.accelerate },
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Glass Panel
// ============================================

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
}

export function M3GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div
      className={`backdrop-blur-[40px] border border-white/10 rounded-2xl ${className}`}
      style={{
        background: 'rgba(var(--color-bg-container-rgb), 0.85)',
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// Example Usage Component
// ============================================

export default function MaterialVividDemo() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div 
        className="min-h-screen transition-colors"
        style={{ 
          backgroundColor: 'var(--color-bg-base)',
          color: 'var(--color-text-primary)',
        }}
      >
        {/* Header */}
        <M3Header title="Material Vivid">
          <M3Button variant="filled" onClick={() => setIsDark(!isDark)}>
            Toggle Theme
          </M3Button>
        </M3Header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 pt-24 pb-8">
          <PageTransition>
            {/* Hero */}
            <M3Card level={1} className="p-8 mb-8" hover={false}>
              <h1 
                className="font-display text-4xl font-bold mb-4"
                style={{ color: 'var(--color-primary)' }}
              >
                Welcome to Material Vivid
              </h1>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                Dynamic, adaptive interfaces built with M3 design principles.
              </p>
            </M3Card>

            {/* Card Grid */}
            <AnimatedList className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <M3Card key={i} level={1} className="p-5">
                  <span 
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Category
                  </span>
                  <h3 className="font-display text-xl font-semibold mt-1 mb-2">
                    Card Title {i}
                  </h3>
                  <p 
                    className="text-sm mb-4"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Description text with dynamic theming support.
                  </p>
                  <M3Button variant="outlined" className="w-full">
                    Action
                  </M3Button>
                </M3Card>
              ))}
            </AnimatedList>
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
