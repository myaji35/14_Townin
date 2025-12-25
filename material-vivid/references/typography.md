# M3 Typography System

## 폰트 선택 가이드

### 금지 폰트

```
❌ Roboto (기본 400) - 너무 평범
❌ Noto Sans (기본) - 개성 없음
❌ 굴림, 돋움 - 시스템 기본
❌ Arial, Helvetica - 웹 기본
```

### 용도별 권장 폰트

| 용도 | 영문 | 한글 |
|-----|------|------|
| **앱 UI** | Inter, Roboto Flex | Pretendard, SUIT |
| **에디토리얼** | Playfair Display, Lora | Noto Serif KR |
| **코드/기술** | JetBrains Mono, Fira Code | - |
| **마케팅** | Manrope, DM Sans | Wanted Sans |

## Google Fonts 설정

### HTML Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Flex:opsz,wght@8..144,400;8..144,500;8..144,600&display=swap" rel="stylesheet">
```

### CSS Import

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Flex:opsz,wght@8..144,400;8..144,500;8..144,600&display=swap');
```

### 한글 폰트 (CDN)

```html
<!-- Pretendard -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">

<!-- SUIT -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/static/woff2/SUIT.css">
```

## 타입 스케일 (M3)

### CSS Variables

```css
:root {
  /* Font Families */
  --font-display: 'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Roboto Flex', 'Pretendard', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Display */
  --text-display-large: 57px;
  --text-display-medium: 45px;
  --text-display-small: 36px;

  /* Headline */
  --text-headline-large: 32px;
  --text-headline-medium: 28px;
  --text-headline-small: 24px;

  /* Title */
  --text-title-large: 22px;
  --text-title-medium: 16px;
  --text-title-small: 14px;

  /* Body */
  --text-body-large: 16px;
  --text-body-medium: 14px;
  --text-body-small: 12px;

  /* Label */
  --text-label-large: 14px;
  --text-label-medium: 12px;
  --text-label-small: 11px;

  /* Line Heights */
  --leading-display: 1.1;
  --leading-headline: 1.25;
  --leading-body: 1.5;
  --leading-relaxed: 1.65;

  /* Letter Spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
}
```

### Tailwind 확장

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'Pretendard', 'sans-serif'],
        body: ['Roboto Flex', 'Pretendard', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-lg': ['57px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['45px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['36px', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'headline-lg': ['32px', { lineHeight: '1.25' }],
        'headline-md': ['28px', { lineHeight: '1.25' }],
        'headline-sm': ['24px', { lineHeight: '1.3' }],
        'title-lg': ['22px', { lineHeight: '1.4', fontWeight: '500' }],
        'title-md': ['16px', { lineHeight: '1.5', fontWeight: '500' }],
        'title-sm': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '1.65' }],
        'body-md': ['14px', { lineHeight: '1.65' }],
        'body-sm': ['12px', { lineHeight: '1.5' }],
        'label-lg': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '1.4', fontWeight: '500' }],
      },
    },
  },
};
```

## 사용 예시

### Display (Hero, 랜딩)

```tsx
<h1 className="font-display text-display-lg font-bold tracking-tight">
  Welcome
</h1>
```

### Headline (섹션 제목)

```tsx
<h2 className="font-display text-headline-md font-semibold">
  This Week's Recommendations
</h2>
```

### Title (카드 제목)

```tsx
<h3 className="font-display text-title-lg font-medium">
  30% OFF Organic Salad
</h3>
```

### Body (본문)

```tsx
<p className="font-body text-body-md leading-relaxed text-[var(--color-text-secondary)]">
  Exclusive discount based on your recent activity tracking.
</p>
```

### Label (버튼, 태그)

```tsx
<span className="font-display text-label-md uppercase tracking-wide">
  Fresh Greens Market
</span>
```

## Variable Font 활용

### Roboto Flex 설정

```css
.text-roboto-flex {
  font-family: 'Roboto Flex', sans-serif;
  font-variation-settings: 
    'wght' 450,  /* Weight: 100-1000 */
    'wdth' 100,  /* Width: 25-151 */
    'opsz' 14;   /* Optical Size: 8-144 */
}

/* 강조 */
.text-emphasis {
  font-variation-settings: 'wght' 600, 'wdth' 100;
}

/* 좁은 공간 */
.text-condensed {
  font-variation-settings: 'wght' 450, 'wdth' 75;
}
```

### Inter Variable

```css
.text-inter {
  font-family: 'Inter', sans-serif;
  font-feature-settings: 
    'liga' 1,    /* Ligatures */
    'calt' 1,    /* Contextual Alternates */
    'ss01' 1;    /* Stylistic Set 01 */
}
```
