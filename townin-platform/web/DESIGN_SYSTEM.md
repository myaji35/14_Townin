# Townin Design System

Based on the approved dark theme design (2024-12-24)

## Color Palette

### Dark Theme
```css
--bg-primary: #0A1520;      /* Main background */
--bg-secondary: #1A2332;    /* Card backgrounds */
--bg-tertiary: #2A3342;     /* Elevated surfaces */

--accent-primary: #00D9B0;  /* Mint green - primary accent */
--accent-secondary: #00BFA6; /* Teal - CTAs and buttons */
--accent-tertiary: #1DE9B6; /* Light mint - highlights */

--text-primary: #FFFFFF;    /* Main text */
--text-secondary: #B0B8C1;  /* Secondary text */
--text-tertiary: #6B7280;   /* Disabled/placeholder text */

--border-color: #2A3342;    /* Borders and dividers */
--shadow: rgba(0, 0, 0, 0.3); /* Shadows */
```

### Status Colors
```css
--success: #00D9B0;
--warning: #FFA726;
--error: #EF5350;
--info: #42A5F5;
```

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Sizes
- **Display**: 32px (2rem)
- **Heading 1**: 28px (1.75rem)
- **Heading 2**: 24px (1.5rem)
- **Heading 3**: 20px (1.25rem)
- **Body Large**: 16px (1rem)
- **Body**: 14px (0.875rem)
- **Caption**: 12px (0.75rem)
- **Small**: 11px (0.6875rem)

### Font Weights
- **Bold**: 700
- **Semibold**: 600
- **Medium**: 500
- **Regular**: 400

## Layout

### Grid System
- **Container Max Width**: 1920px
- **Column Gap**: 24px
- **Row Gap**: 24px

### 3-Column Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│  Sidebar (240px) │ Main Content │  Map (400px) │
└─────────────────────────────────────────────────┘
```

- **Sidebar Width**: 240px (fixed)
- **Map Width**: 400px (fixed)
- **Main Content**: Fluid (fills remaining space)

### Spacing Scale
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
```

## Components

### Button Styles

#### Primary Button
```css
background: linear-gradient(135deg, #00D9B0 0%, #00BFA6 100%);
color: #FFFFFF;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(0, 217, 176, 0.3);
```

#### Secondary Button
```css
background: transparent;
border: 1px solid #00D9B0;
color: #00D9B0;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
```

### Card Styles

#### Standard Card
```css
background: #1A2332;
border-radius: 12px;
padding: 20px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
```

#### Flyer Card
```css
background: #1A2332;
border-radius: 16px;
overflow: hidden;
transition: transform 0.3s ease, box-shadow 0.3s ease;

/* Hover state */
:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
```

### Badge Styles

#### NEW Badge
```css
background: #00D9B0;
color: #0A1520;
padding: 4px 12px;
border-radius: 12px;
font-size: 11px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.5px;
```

#### Points Badge
```css
background: linear-gradient(135deg, #00D9B0 0%, #00BFA6 100%);
color: #FFFFFF;
padding: 8px 16px;
border-radius: 20px;
font-size: 14px;
font-weight: 700;
```

## Icons

### Icon Sizes
- **Small**: 16px
- **Medium**: 20px
- **Large**: 24px
- **XLarge**: 32px

### Icon Colors
- **Primary**: #00D9B0
- **Secondary**: #B0B8C1
- **Disabled**: #6B7280

## Elevation (Shadows)

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.5);
```

## Border Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

## Transitions

```css
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
--transition-slow: 500ms ease;
```

## Responsive Breakpoints

```css
--mobile: 640px;
--tablet: 768px;
--laptop: 1024px;
--desktop: 1280px;
--wide: 1920px;
```

## Usage Guidelines

### Do's ✅
- Always use CSS variables for colors
- Maintain consistent spacing using the spacing scale
- Use the defined shadow levels for elevation
- Follow the 3-column layout for desktop dashboards
- Ensure sufficient contrast for accessibility (WCAG AA minimum)

### Don'ts ❌
- Don't use hard-coded color values
- Don't create custom spacing values outside the scale
- Don't mix light and dark theme colors
- Don't ignore responsive breakpoints
- Don't use pure black (#000000) - use --bg-primary instead

## Accessibility

### Color Contrast
- Ensure text has minimum 4.5:1 contrast ratio against background
- Use `--text-primary` for important content
- Use `--text-secondary` for supporting content
- Never use color alone to convey information

### Focus States
```css
:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

### Interactive Elements
- Minimum touch target: 44x44px
- Clear hover and focus states
- Keyboard navigable

## Component Catalog

### 1. Sidebar Navigation
- Logo placement
- Navigation menu with icons
- Points counter display
- Filter categories section

### 2. AI GraphRAG Banner
- Green gradient background
- NEW badge
- Description text
- Icon/illustration

### 3. Flyer Card
- Image (aspect ratio 4:3)
- Merchant badge
- Title and description
- CTA button (Earn Points)
- Hover effects

### 4. Map Component
- Dark theme styling
- Green pin markers
- Zoom controls
- Legend/info panel

---

**Version**: 1.0
**Last Updated**: 2024-12-24
**Designer**: User-provided design screenshot
**Implementer**: Sally (UX Expert)
