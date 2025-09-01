import { css } from 'styled-components';

const variables = css`
  :root {
    /* Legacy theme variables (for backward compatibility) */
    --dark-navy: #0d0404;
    --navy: #1a0a0a;
    --light-navy: #2b1111;
    --lightest-navy: #3d1f1f;
    --navy-shadow: rgba(13, 4, 4, 0.7);
    --dark-slate: #6b4c4c;
    --slate: #b09999;
    --light-slate: #d1b8b8;
    --lightest-slate: #f6cccc;
    --white: #ffe6e6;
    --green: #ff3333;
    --green-tint: rgba(255, 51, 51, 0.1);
    --pink: #ff5757;
    --blue: #ff7d7d;

    /* Dual-theme system variables */
    /* These will be dynamically updated by the ThemeProvider */
    
    /* Background colors */
    --color-backgrounds-primary: #0d0404;
    --color-backgrounds-secondary: #1a0a0a;
    --color-backgrounds-tertiary: #2b1111;
    --color-backgrounds-elevated: #1f1f1f;
    --color-backgrounds-overlay: rgba(13, 4, 4, 0.9);

    /* Text colors */
    --color-text-primary: #ffe6e6;
    --color-text-secondary: #d1b8b8;
    --color-text-tertiary: #b09999;
    --color-text-muted: #6b4c4c;
    --color-text-inverse: #0d0404;

    /* Accent colors */
    --color-accents-primary: #ff3333;
    --color-accents-secondary: #ff5757;
    --color-accents-success: #4caf50;
    --color-accents-warning: #ff9800;
    --color-accents-error: #f44336;
    --color-accents-info: #2196f3;

    /* Border colors */
    --color-borders-default: #3d1f1f;
    --color-borders-hover: #2b1111;
    --color-borders-focus: #ff3333;
    --color-borders-subtle: #1a0a0a;

    /* Shadow colors */
    --color-shadows-default: rgba(13, 4, 4, 0.7);
    --color-shadows-elevated: rgba(0, 0, 0, 0.5);
    --color-shadows-focus: rgba(255, 51, 51, 0.3);

    /* State colors */
    --color-states-hover: rgba(255, 255, 255, 0.04);
    --color-states-active: rgba(255, 255, 255, 0.08);
    --color-states-selected: rgba(255, 51, 51, 0.2);
    --color-states-disabled: rgba(255, 255, 255, 0.12);

    /* Typography */
    --font-sans: 'Calibre', 'Inter', 'San Francisco', 'SF Pro Text', -apple-system, system-ui,
      sans-serif;
    --font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;

    --fz-xxs: 12px;
    --fz-xs: 13px;
    --fz-sm: 14px;
    --fz-md: 16px;
    --fz-lg: 18px;
    --fz-xl: 20px;
    --fz-xxl: 22px;
    --fz-heading: 32px;

    /* Layout */
    --border-radius: 4px;
    --nav-height: 100px;
    --nav-scroll-height: 70px;
    --tab-height: 42px;
    --tab-width: 120px;
    --hamburger-width: 30px;

    /* Animations */
    --easing: cubic-bezier(0.645, 0.045, 0.355, 1);
    --transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);
    --animation-duration: 0.25s;

    /* Hamburger menu animations */
    --ham-before: top 0.1s ease-in 0.25s, opacity 0.1s ease-in;
    --ham-before-active: top 0.1s ease-out, opacity 0.1s ease-out 0.12s;
    --ham-after: bottom 0.1s ease-in 0.25s, transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19);
    --ham-after-active: bottom 0.1s ease-out,
      transform 0.22s cubic-bezier(0.215, 0.61, 0.355, 1) 0.12s;

    /* Theme-aware semantic variables */
    --bg-primary: var(--color-backgrounds-primary);
    --bg-secondary: var(--color-backgrounds-secondary);
    --bg-elevated: var(--color-backgrounds-elevated);
    --text-primary: var(--color-text-primary);
    --text-secondary: var(--color-text-secondary);
    --accent-primary: var(--color-accents-primary);
    --border-default: var(--color-borders-default);
    --shadow-default: var(--color-shadows-default);
  }

  /* Light theme overrides (applied via data-theme attribute) */
  [data-theme='light'] {
    --color-backgrounds-primary: #ffffff;
    --color-backgrounds-secondary: #f8f9fa;
    --color-backgrounds-tertiary: #f1f3f4;
    --color-backgrounds-elevated: #ffffff;
    --color-backgrounds-overlay: rgba(255, 255, 255, 0.9);

    --color-text-primary: #202124;
    --color-text-secondary: #5f6368;
    --color-text-tertiary: #80868b;
    --color-text-muted: #9aa0a6;
    --color-text-inverse: #ffffff;

    --color-borders-default: #e8eaed;
    --color-borders-hover: #dadce0;
    --color-borders-subtle: #f1f3f4;

    --color-shadows-default: rgba(0, 0, 0, 0.1);
    --color-shadows-elevated: rgba(0, 0, 0, 0.15);
    --color-shadows-focus: rgba(255, 51, 51, 0.2);

    --color-states-hover: rgba(0, 0, 0, 0.04);
    --color-states-active: rgba(0, 0, 0, 0.08);
    --color-states-selected: rgba(255, 51, 51, 0.1);
    --color-states-disabled: rgba(0, 0, 0, 0.12);

    /* Legacy variable overrides for light theme */
    --dark-navy: #ffffff;
    --navy: #f8f9fa;
    --light-navy: #f1f3f4;
    --lightest-navy: #e8eaed;
    --navy-shadow: rgba(0, 0, 0, 0.1);
    --dark-slate: #9aa0a6;
    --slate: #5f6368;
    --light-slate: #80868b;
    --lightest-slate: #202124;
    --white: #202124;
  }

  /* Accessibility: Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    :root {
      --animation-duration: 0s;
      --transition: none;
    }
  }

  /* Accessibility: High contrast mode adjustments */
  @media (prefers-contrast: high) {
    :root {
      --color-borders-default: var(--color-text-primary);
      --color-shadows-default: transparent;
    }

    [data-theme='light'] {
      --color-borders-default: var(--color-text-primary);
    }
  }

  /* Print styles */
  @media print {
    :root {
      --color-backgrounds-primary: white;
      --color-backgrounds-secondary: white;
      --color-text-primary: black;
      --color-text-secondary: black;
      --color-accents-primary: black;
      --color-shadows-default: transparent;
    }
  }
`;

export default variables;
