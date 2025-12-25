---
name: material-vivid
description: "Google Stitch / Material You 3(M3) 디자인 시스템 기반 프론트엔드 생성 스킬. 동적 색상, 유동적 모션, 개인화 UI/UX를 구현합니다. 사용 시점 - (1) 웹/모바일 대시보드, (2) SaaS 인터페이스, (3) 앱 UI 컴포넌트, (4) 다크모드 지원 인터페이스, (5) 모션이 적용된 인터랙티브 UI 생성 요청 시. Tailwind CSS, Framer Motion, React/Next.js 환경에 최적화."
---

# Material Vivid Design Protocol

**핵심 철학**: 정적임은 적. 사용자 맞춤형 '살아있는' 인터페이스 구축.

## Quick Start

### 1. 기술 스택 선택

| 요청 유형 | 출력 형식 |
|----------|----------|
| 단일 페이지/프로토타입 | HTML + Tailwind + Vanilla JS |
| React 컴포넌트 | TSX + Framer Motion |
| 전체 앱 | Next.js + Tailwind + Framer Motion |

### 2. 필수 체크리스트

모든 결과물에 포함:
- [ ] CSS Custom Properties 기반 M3 색상 시스템
- [ ] 동적 다크모드 (`prefers-color-scheme` + `class` 토글)
- [ ] Surface Tint (고도별 primary 색상 오버레이)
- [ ] State Layer 인터랙션 (hover/press 피드백)
- [ ] 모바일 우선 반응형
- [ ] Google Fonts (Inter, Roboto Flex 권장)

### 3. 금지 사항

```
❌ 순수 흰색 배경 (#FFFFFF)
❌ 순수 검정 텍스트 (#000000)
❌ 하드코딩된 고정 색상
❌ Roboto 400 기본값, Noto Sans 기본
❌ 단조로운 flat 디자인
❌ 정적인 hover 효과 (배경색만 변경)
```

## 색상 시스템

상세: [references/color-system.md](references/color-system.md)

```css
:root {
  --color-primary: #6750A4;
  --color-on-primary: #FFFFFF;
  --color-bg-base: #FFFBFE;
  --color-bg-container: #F3EDF7;
  --color-text-primary: #1D1B20;
  --color-text-secondary: #49454E;
}

.dark {
  --color-primary: #D0BCFF;
  --color-on-primary: #381E72;
  --color-bg-base: #1D1B20;
  --color-bg-container: #2B2930;
  --color-text-primary: #E6E1E5;
  --color-text-secondary: #CAC4D0;
}
```

## 모션 시스템

상세: [references/motion-patterns.md](references/motion-patterns.md)

### 핵심 이징

```js
const easings = {
  standard: [0.2, 0, 0, 1],      // 일반 전환
  emphasized: [0.2, 0, 0, 1],    // 강조 (duration 400-500ms)
  decelerate: [0, 0, 0, 1],      // 진입 애니메이션
  accelerate: [0.3, 0, 1, 1],    // 퇴장 애니메이션
};
```

### State Layer 패턴 (필수)

```tsx
<motion.button
  className="relative isolate overflow-hidden"
  whileHover={{ "--state-opacity": 0.08 }}
  whileTap={{ "--state-opacity": 0.12 }}
>
  <span 
    className="absolute inset-0 bg-[var(--color-primary)] -z-10"
    style={{ opacity: "var(--state-opacity, 0)", transition: "opacity 150ms" }}
  />
  Button Text
</motion.button>
```

## 타이포그래피

상세: [references/typography.md](references/typography.md)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Flex:wght@400;500;600&display=swap');

:root {
  --font-display: 'Inter', -apple-system, sans-serif;
  --font-body: 'Roboto Flex', sans-serif;
}
```

## 레이아웃 패턴

### 대시보드 구조 (3-Column)

```
┌─────────────────────────────────────────────────┐
│ Header (64px, sticky, glass blur)               │
├────────┬────────────────────────────────────────┤
│        │                                        │
│ Side   │  Main Content                          │
│ (280px)│  - Hero/Status Card                    │
│        │  - Grid Cards (responsive)             │
│        │  - Action Buttons                      │
│        │                                        │
├────────┴─────────────────────────┬──────────────┤
│                                  │ Detail Panel │
│                                  │ (320-400px)  │
└──────────────────────────────────┴──────────────┘
```

### Surface Elevation (Surface Tint)

```css
.surface-level-0 { background: var(--color-bg-base); }
.surface-level-1 { 
  background: var(--color-bg-container);
  background-image: linear-gradient(
    rgba(var(--color-primary-rgb), 0.05),
    rgba(var(--color-primary-rgb), 0.05)
  );
}
.surface-level-2 { /* 8% tint */ }
.surface-level-3 { /* 11% tint - dialogs, modals */ }
```

### Glassmorphism (M3 스타일)

```css
.m3-glass {
  background: rgba(var(--color-bg-container-rgb), 0.85);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## 템플릿 사용

- HTML 보일러플레이트: [assets/template.html](assets/template.html)
- React 컴포넌트: [assets/template-react.tsx](assets/template-react.tsx)

## Before/After 예시

### ❌ Before (고전 Material)

```html
<div style="background: #FFFFFF; box-shadow: 0 2px 4px #AAA">
  <h1 style="color: #1A73E8">Title</h1>
</div>
```

### ✅ After (Material Vivid)

```tsx
<motion.div
  className="surface-level-1 p-6 rounded-3xl"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
>
  <h1 style={{ color: 'var(--color-primary)' }}>
    Dynamic Title
  </h1>
</motion.div>
```
