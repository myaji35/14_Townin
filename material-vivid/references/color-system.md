# M3 Color System

## 동적 색상 생성 원칙

사용자 테마(배경화면, 시스템 설정)에서 색상 추출 → 5가지 키 컬러 생성:
- Primary, Secondary, Tertiary, Neutral, Error

## 색상 토큰 매핑

### Light Theme

```css
:root {
  /* Primary */
  --color-primary: #6750A4;
  --color-primary-rgb: 103, 80, 164;
  --color-on-primary: #FFFFFF;
  --color-primary-container: #EADDFF;
  --color-on-primary-container: #21005D;

  /* Secondary */
  --color-secondary: #625B71;
  --color-on-secondary: #FFFFFF;
  --color-secondary-container: #E8DEF8;
  --color-on-secondary-container: #1D192B;

  /* Tertiary */
  --color-tertiary: #7D5260;
  --color-on-tertiary: #FFFFFF;

  /* Surface & Background */
  --color-bg-base: #FFFBFE;
  --color-bg-container: #F3EDF7;
  --color-surface-variant: #E7E0EC;
  --color-on-surface-variant: #49454E;

  /* Text */
  --color-text-primary: #1D1B20;
  --color-text-secondary: #49454E;
  --color-text-disabled: rgba(29, 27, 32, 0.38);

  /* Outline */
  --color-outline: #79747E;
  --color-outline-variant: #CAC4D0;

  /* Error */
  --color-error: #B3261E;
  --color-on-error: #FFFFFF;
}
```

### Dark Theme

```css
.dark {
  /* Primary */
  --color-primary: #D0BCFF;
  --color-primary-rgb: 208, 188, 255;
  --color-on-primary: #381E72;
  --color-primary-container: #4F378B;
  --color-on-primary-container: #EADDFF;

  /* Secondary */
  --color-secondary: #CCC2DC;
  --color-on-secondary: #332D41;
  --color-secondary-container: #4A4458;

  /* Surface & Background */
  --color-bg-base: #1D1B20;
  --color-bg-container: #2B2930;
  --color-surface-variant: #49454E;
  --color-on-surface-variant: #CAC4D0;

  /* Text */
  --color-text-primary: #E6E1E5;
  --color-text-secondary: #CAC4D0;
  --color-text-disabled: rgba(230, 225, 229, 0.38);

  /* Outline */
  --color-outline: #938F99;
  --color-outline-variant: #49454E;
}
```

## Surface Tint Levels

고도(elevation)에 따라 primary 색상의 틴트가 오버레이됨:

| Level | Tint Opacity | 사용처 |
|-------|-------------|--------|
| 0 | 0% | 기본 배경 |
| 1 | 5% | 카드, 컨테이너 |
| 2 | 8% | FAB, 버튼 |
| 3 | 11% | 네비게이션 드로어 |
| 4 | 12% | 앱바 |
| 5 | 14% | 다이얼로그, 모달 |

```css
.surface-tint-1 {
  background-color: var(--color-bg-base);
  background-image: linear-gradient(
    rgba(var(--color-primary-rgb), 0.05),
    rgba(var(--color-primary-rgb), 0.05)
  );
}
```

## 커스텀 테마 팔레트 예시

### Teal/Mint (Townin OS 스타일)

```css
:root {
  --color-primary: #13ECB6;
  --color-primary-rgb: 19, 236, 182;
  --color-on-primary: #003829;
  --color-bg-base-dark: #11221E;
  --color-bg-container-dark: #1D3632;
  --color-surface-active: #23483F;
  --color-text-secondary-dark: #92C9BB;
}
```

### Blue/Purple (기본 M3)

```css
:root {
  --color-primary: #6750A4;
  --color-primary-rgb: 103, 80, 164;
}
```

## 접근성 대비율

- 텍스트: 최소 4.5:1 (WCAG AA)
- 대형 텍스트: 최소 3:1
- UI 컴포넌트: 최소 3:1

```js
// 대비율 체크 함수
function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
```
