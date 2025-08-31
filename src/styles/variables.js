import { css } from 'styled-components';

const variables = css`
  :root {
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

    --border-radius: 4px;
    --nav-height: 100px;
    --nav-scroll-height: 70px;

    --tab-height: 42px;
    --tab-width: 120px;

    --easing: cubic-bezier(0.645, 0.045, 0.355, 1);
    --transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);

    --hamburger-width: 30px;

    --ham-before: top 0.1s ease-in 0.25s, opacity 0.1s ease-in;
    --ham-before-active: top 0.1s ease-out, opacity 0.1s ease-out 0.12s;
    --ham-after: bottom 0.1s ease-in 0.25s, transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19);
    --ham-after-active: bottom 0.1s ease-out,
      transform 0.22s cubic-bezier(0.215, 0.61, 0.355, 1) 0.12s;
  }
`;

export default variables;
