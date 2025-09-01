// Theme Configuration for Dual-Theme System
// Inspired by Claude's interface design

const baseTheme = {
  // Breakpoints
  bp: {
    mobileS: `max-width: 330px`,
    mobileM: `max-width: 400px`,
    mobileL: `max-width: 480px`,
    tabletS: `max-width: 600px`,
    tabletL: `max-width: 768px`,
    desktopXS: `max-width: 900px`,
    desktopS: `max-width: 1080px`,
    desktopM: `max-width: 1200px`,
    desktopL: `max-width: 1400px`,
  },

  // Typography
  fonts: {
    sans: `'Calibre', 'Inter', 'San Francisco', 'SF Pro Text', -apple-system, system-ui, sans-serif`,
    mono: `'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace`,
  },

  fontSizes: {
    xxs: '12px',
    xs: '13px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '22px',
    heading: '32px',
  },

  // Animations
  animations: {
    transition: 'all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1)',
    easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    duration: {
      fast: '0.15s',
      normal: '0.25s',
      slow: '0.4s',
    },
  },

  // Layout
  layout: {
    borderRadius: '4px',
    navHeight: '100px',
    navScrollHeight: '70px',
    tabHeight: '42px',
    tabWidth: '120px',
    hamburgerWidth: '30px',
  },
};

// Light Theme Configuration (Claude-inspired clean interface)
export const lightTheme = {
  ...baseTheme,
  name: 'light',
  colors: {
    backgrounds: {
      primary: '#ffffff',        // Pure white
      secondary: '#f8f9fa',      // Light gray
      tertiary: '#f1f3f4',       // Slightly darker gray
      elevated: '#ffffff',        // White for cards/elevated content
      overlay: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#202124',         // Dark gray (Claude's primary text)
      secondary: '#5f6368',       // Medium gray
      tertiary: '#80868b',        // Light gray
      muted: '#9aa0a6',          // Very light gray
      inverse: '#ffffff',         // White text for dark backgrounds
    },
    accents: {
      primary: '#ff3333',         // Keeping the red accent from original theme
      secondary: '#ff5757',       // Lighter red
      success: '#34a853',         // Green for success states
      warning: '#fbbc04',         // Yellow for warnings
      error: '#ea4335',          // Red for errors
      info: '#4285f4',           // Blue for info
    },
    borders: {
      default: '#e8eaed',         // Light border
      hover: '#dadce0',           // Slightly darker on hover
      focus: '#ff3333',           // Red focus state
      subtle: '#f1f3f4',          // Very subtle border
    },
    shadows: {
      default: 'rgba(0, 0, 0, 0.1)',
      elevated: 'rgba(0, 0, 0, 0.15)',
      focus: 'rgba(255, 51, 51, 0.2)',
    },
    states: {
      hover: 'rgba(0, 0, 0, 0.04)',
      active: 'rgba(0, 0, 0, 0.08)',
      selected: 'rgba(255, 51, 51, 0.1)',
      disabled: 'rgba(0, 0, 0, 0.12)',
    },
  },
};

// Dark Theme Configuration (Claude-inspired dark interface)
export const darkTheme = {
  ...baseTheme,
  name: 'dark',
  colors: {
    backgrounds: {
      primary: '#0d0404',         // Very dark red/black (original theme)
      secondary: '#1a0a0a',       // Dark red/black (original theme)
      tertiary: '#2b1111',        // Lighter dark red
      elevated: '#1f1f1f',        // Elevated surfaces
      overlay: 'rgba(13, 4, 4, 0.9)',
    },
    text: {
      primary: '#ffe6e6',         // Light pinkish white (original theme)
      secondary: '#d1b8b8',       // Light slate (original theme)
      tertiary: '#b09999',        // Slate (original theme)
      muted: '#6b4c4c',          // Dark slate (original theme)
      inverse: '#0d0404',         // Dark text for light backgrounds
    },
    accents: {
      primary: '#ff3333',         // Bright red (original theme)
      secondary: '#ff5757',       // Pink (original theme)
      success: '#4caf50',         // Green for success states
      warning: '#ff9800',         // Orange for warnings
      error: '#f44336',          // Red for errors
      info: '#2196f3',           // Blue for info
    },
    borders: {
      default: '#3d1f1f',         // Lightest navy (original theme)
      hover: '#2b1111',           // Light navy
      focus: '#ff3333',           // Red focus state
      subtle: '#1a0a0a',          // Very subtle border
    },
    shadows: {
      default: 'rgba(13, 4, 4, 0.7)', // Navy shadow (original theme)
      elevated: 'rgba(0, 0, 0, 0.5)',
      focus: 'rgba(255, 51, 51, 0.3)',
    },
    states: {
      hover: 'rgba(255, 255, 255, 0.04)',
      active: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 51, 51, 0.2)',
      disabled: 'rgba(255, 255, 255, 0.12)',
    },
  },
};

// Theme system configuration
export const themeConfig = {
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  default: 'dark', // Keep dark as default to maintain current feel
  storageKey: 'preferred-theme',
  systemPreferenceKey: 'prefers-color-scheme',
};

export default themeConfig;