import '@testing-library/jest-dom';
import React from 'react';

// Mock gatsby modules
global.___loader = {
  enqueue: jest.fn(),
};

// Mock StaticImage component from gatsby-plugin-image
jest.mock('gatsby-plugin-image', () => ({
  StaticImage: ({ alt, ...props }) => <img alt={alt} {...props} data-testid="static-image" />,
  GatsbyImage: ({ alt, ...props }) => <img alt={alt} {...props} data-testid="gatsby-image" />,
}));

// Mock gatsby
jest.mock('gatsby', () => ({
  graphql: jest.fn(),
  Link: ({ children, to, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useStaticQuery: jest.fn(),
  navigate: jest.fn(),
}));

// Mock ScrollReveal
jest.mock('scrollreveal', () => ({
  __esModule: true,
  default: {
    reveal: jest.fn(),
  },
}));

// Mock animejs
jest.mock('animejs', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Theme testing specific setup
beforeEach(() => {
  // Reset CSS custom properties mock
  if (document.documentElement && document.documentElement.style) {
    document.documentElement.style.setProperty = jest.fn();
    document.documentElement.style.removeProperty = jest.fn();
    document.documentElement.style.getPropertyValue = jest.fn();
  }

  // Reset document element attributes
  if (document.documentElement) {
    document.documentElement.setAttribute = jest.fn();
    document.documentElement.classList = {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn(),
    };
  }

  // Reset window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Reset localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    get length() {
      return Object.keys(this).length;
    },
    key: jest.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Reset fetch
  global.fetch = jest.fn();

  // Reset performance API
  Object.defineProperty(window, 'performance', {
    value: {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByName: jest.fn(() => []),
      getEntriesByType: jest.fn(() => []),
    },
    writable: true,
  });

  // Reset requestAnimationFrame and cancelAnimationFrame
  global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
  global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true,
  });

  // Mock window.addEventListener and removeEventListener
  window.addEventListener = jest.fn();
  window.removeEventListener = jest.fn();

  // Reset console methods to avoid noise in tests
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console methods
  console.warn.mockRestore?.();
  console.error.mockRestore?.();

  // Clean up any running timers
  jest.clearAllTimers();
  jest.clearAllMocks();

  // Clear any DOM changes
  document.body.innerHTML = '';
  
  // Reset document title
  document.title = '';
});

// Global test utilities for theme testing
global.mockThemeContext = (overrides = {}) => ({
  currentTheme: 'dark',
  systemTheme: 'dark',
  isLoading: false,
  prefersReducedMotion: false,
  prefersHighContrast: false,
  theme: { name: 'dark' },
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
  isLight: false,
  isDark: true,
  ...overrides,
});

// Mock styled-components for testing
jest.mock('styled-components', () => {
  const React = require('react');
  
  const styled = (tag) => (styles) => {
    return React.forwardRef(({ children, ...props }, ref) => {
      const className = `styled-${tag}-${Math.random().toString(36).substr(2, 9)}`;
      return React.createElement(
        tag,
        {
          ...props,
          ref,
          className: `${props.className || ''} ${className}`,
          'data-styled': 'true',
          'data-styles': typeof styles === 'function' ? 'dynamic' : 'static',
        },
        children
      );
    });
  };

  ['div', 'button', 'span', 'h1', 'h2', 'h3', 'p', 'section', 'article'].forEach(tag => {
    styled[tag] = styled(tag);
  });

  const ThemeProvider = ({ theme, children }) => {
    return React.createElement(
      'div',
      {
        'data-theme-provider': 'true',
        'data-theme': theme?.name || 'unknown',
        style: {
          '--theme-name': theme?.name,
        },
      },
      children
    );
  };

  return {
    __esModule: true,
    default: styled,
    ThemeProvider,
    css: (strings, ...values) => ({
      css: strings.join(''),
      values,
    }),
    keyframes: (strings) => ({
      name: `keyframes-${Math.random().toString(36).substr(2, 9)}`,
      styles: strings.join(''),
    }),
    createGlobalStyle: () => () => null,
  };
});

// Configure jest-axe for accessibility testing
if (global.__THEME_TESTING__) {
  const { configureAxe } = require('jest-axe');

  const axe = configureAxe({
    rules: {
      // Disable some rules that might not be relevant for component testing
      'page-has-heading-one': { enabled: false },
      'landmark-one-main': { enabled: false },
    },
  });

  global.axe = axe;
}

// Error boundary for testing error scenarios
global.TestErrorBoundary = class extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong: {this.state.error?.message}</div>;
    }

    return this.props.children;
  }
};

// Performance testing utilities
global.measureTestPerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  const duration = end - start;
  if (duration > 100) {
    console.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
  }
  
  return { result, duration };
};

// Theme test data
global.testThemes = {
  light: {
    name: 'light',
    colors: {
      backgrounds: { primary: '#ffffff' },
      text: { primary: '#202124' },
      accents: { primary: '#ff3333' },
    },
  },
  dark: {
    name: 'dark',
    colors: {
      backgrounds: { primary: '#0d0404' },
      text: { primary: '#ffe6e6' },
      accents: { primary: '#ff3333' },
    },
  },
};
