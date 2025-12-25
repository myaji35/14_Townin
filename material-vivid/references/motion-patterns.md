# M3 Motion System

## 핵심 원칙

모션은 3가지 역할:
1. **유용함** - 공간 관계와 기능 전달
2. **반응성** - 사용자 입력에 즉각 반응
3. **표현성** - 브랜드 개성 전달

## 이징 커브

### Framer Motion 설정

```tsx
export const easings = {
  // Standard: 일반적인 전환
  standard: [0.2, 0, 0, 1],
  
  // Emphasized: 중요한 전환 (더 긴 duration과 함께)
  emphasized: [0.2, 0, 0, 1],
  
  // Decelerate: 화면 진입 (빠르게 시작, 천천히 끝)
  decelerate: [0, 0, 0, 1],
  
  // Accelerate: 화면 퇴장 (천천히 시작, 빠르게 끝)
  accelerate: [0.3, 0, 1, 1],
};

// Duration
export const durations = {
  short1: 50,   // ms
  short2: 100,
  short3: 150,
  short4: 200,
  medium1: 250,
  medium2: 300,
  medium3: 350,
  medium4: 400,
  long1: 450,
  long2: 500,
  long3: 550,
  long4: 600,
};
```

## 필수 패턴

### 1. State Layer (호버/탭 피드백)

Ripple 대신 State Layer 사용:

```tsx
import { motion } from 'framer-motion';

export function Button({ children }) {
  return (
    <motion.button
      className="relative isolate overflow-hidden px-6 py-3 rounded-full"
      style={{ backgroundColor: 'var(--color-primary)' }}
      whileHover={{ "--state-opacity": 0.08 }}
      whileTap={{ "--state-opacity": 0.12, scale: 0.98 }}
    >
      {/* State Layer */}
      <motion.span
        className="absolute inset-0 bg-white -z-10"
        style={{ opacity: "var(--state-opacity, 0)" }}
        transition={{ duration: 0.15 }}
      />
      <span style={{ color: 'var(--color-on-primary)' }}>
        {children}
      </span>
    </motion.button>
  );
}
```

### 2. Shared Element Transition (화면 전환)

```tsx
// List Page
<motion.div layoutId={`card-${item.id}`}>
  <img src={item.image} />
</motion.div>

// Detail Page
<motion.div layoutId={`card-${item.id}`}>
  <img src={item.image} />
  <h1>{item.title}</h1>
</motion.div>
```

### 3. Container Transform (확장/축소)

```tsx
const cardVariants = {
  collapsed: { 
    height: 80,
    borderRadius: 16 
  },
  expanded: { 
    height: 'auto',
    borderRadius: 28 
  },
};

<motion.div
  variants={cardVariants}
  initial="collapsed"
  animate={isOpen ? "expanded" : "collapsed"}
  transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
/>
```

### 4. Staggered List Animation

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0, 0, 0, 1] }
  }
};

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.content}
    </motion.li>
  ))}
</motion.ul>
```

### 5. Scroll-Linked Animation

```tsx
import { useScroll, useTransform, motion } from 'framer-motion';

function Header() {
  const { scrollY } = useScroll();
  
  const height = useTransform(scrollY, [0, 100], [120, 64]);
  const opacity = useTransform(scrollY, [50, 100], [0, 1]);
  const blur = useTransform(scrollY, [0, 100], [0, 20]);

  return (
    <motion.header 
      style={{ 
        height,
        backdropFilter: useTransform(blur, v => `blur(${v}px)`)
      }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <motion.h1 style={{ opacity }}>
        Collapsed Title
      </motion.h1>
    </motion.header>
  );
}
```

### 6. Card Hover Effect

```tsx
<motion.div
  className="card"
  whileHover={{ 
    y: -4,
    boxShadow: '0 10px 30px -10px rgba(var(--color-primary-rgb), 0.15)'
  }}
  transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
>
  {/* Card Content */}
</motion.div>
```

### 7. Page Transition (Next.js)

```tsx
// _app.tsx or layout.tsx
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2, ease: [0.3, 0, 1, 1] }
  }
};

<AnimatePresence mode="wait">
  <motion.div
    key={router.pathname}
    variants={pageVariants}
    initial="initial"
    animate="enter"
    exit="exit"
  >
    {children}
  </motion.div>
</AnimatePresence>
```

## 성능 최적화

### CSS Transform 우선

```css
/* ✅ 좋음 - GPU 가속 */
.animate {
  transform: translateY(-4px);
  opacity: 0.8;
}

/* ❌ 나쁨 - 레이아웃 재계산 */
.animate {
  top: -4px;
  margin-top: -4px;
}
```

### will-change 사용

```css
.card-hover {
  will-change: transform, box-shadow;
}
```

### Reduced Motion 지원

```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedCard() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={{ y: shouldReduceMotion ? 0 : -4 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
    />
  );
}
```

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
