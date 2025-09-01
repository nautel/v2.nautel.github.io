// Test Utilities for Theme System Testing
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider } from '@contexts/ThemeContext';
import { lightTheme, darkTheme } from '@styles/themes';

// Custom render function with theme providers
export function renderWithTheme(ui, options = {}) {
  const {
    initialTheme = 'dark',
    initialState = {},
    renderOptions = {},
  } = options;

  // Create a custom wrapper component
  function Wrapper({ children }) {
    const theme = initialTheme === 'light' ? lightTheme : darkTheme;
    
    return (
      <ThemeProvider>
        <StyledThemeProvider theme={theme}>
          {children}
        </StyledThemeProvider>
      </ThemeProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Custom render with controlled theme context
export function renderWithControlledTheme(ui, themeValue, options = {}) {
  const { renderOptions = {} } = options;

  function Wrapper({ children }) {
    const theme = themeValue.currentTheme === 'light' ? lightTheme : darkTheme;
    
    return (
      <StyledThemeProvider theme={theme}>
        <div data-theme={themeValue.currentTheme}>
          {children}
        </div>
      </StyledThemeProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock theme context value
export const createMockThemeContext = (overrides = {}) => ({
  currentTheme: 'dark',
  systemTheme: 'dark',
  isLoading: false,
  prefersReducedMotion: false,
  prefersHighContrast: false,
  theme: darkTheme,
  setTheme: jest.fn(),
  toggleTheme: jest.fn(),
  isLight: false,
  isDark: true,
  ...overrides,
});

// Mock window.matchMedia
export const mockMatchMedia = (matches = false) => {
  const mockMediaQuery = {
    matches,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      ...mockMediaQuery,
      matches,
      media: query,
    })),
  });

  return window.matchMedia;
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store = {};
  const mockLocalStorage = {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      for (const key in store) {
        delete store[key];
      }
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => Object.keys(store)[index] || null),
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return mockLocalStorage;
};

// Mock fetch for API testing
export const mockFetch = (mockResponse = {}, options = {}) => {
  const {
    ok = true,
    status = 200,
    statusText = 'OK',
    delay = 0,
    shouldFail = false,
  } = options;

  const mockFetchPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Network error'));
        return;
      }

      const response = {
        ok,
        status,
        statusText,
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
        clone: function() { return this; },
      };

      resolve(response);
    }, delay);
  });

  global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);
  return mockFetchPromise;
};

// Wait for all promises to resolve
export const waitForPromises = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Create CSS custom properties mock
export const mockCSSCustomProperties = () => {
  const mockStyle = {
    setProperty: jest.fn(),
    removeProperty: jest.fn(),
    getPropertyValue: jest.fn(),
  };

  Object.defineProperty(document, 'documentElement', {
    value: {
      style: mockStyle,
      setAttribute: jest.fn(),
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(),
        toggle: jest.fn(),
      },
    },
    writable: true,
  });

  return mockStyle;
};

// Theme assertion helpers
export const expectThemeColors = (element, theme, colorPath) => {
  const getNestedProperty = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };
  
  const expectedColor = getNestedProperty(theme, colorPath);
  expect(element).toHaveStyle(`color: ${expectedColor}`);
};

export const expectThemeBackground = (element, theme, colorPath) => {
  const getNestedProperty = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };
  
  const expectedBackground = getNestedProperty(theme, colorPath);
  expect(element).toHaveStyle(`background: ${expectedBackground}`);
};

// Animation testing utilities
export const mockAnimationFrame = () => {
  let id = 0;
  const callbacks = new Map();

  global.requestAnimationFrame = jest.fn((callback) => {
    const currentId = ++id;
    setTimeout(() => {
      if (callbacks.has(currentId)) {
        callback(performance.now());
        callbacks.delete(currentId);
      }
    }, 16); // 60fps
    callbacks.set(currentId, callback);
    return currentId;
  });

  global.cancelAnimationFrame = jest.fn((id) => {
    callbacks.delete(id);
  });

  return { callbacks };
};

// Accessibility testing utilities
export const mockAccessibilityFeatures = (features = {}) => {
  const {
    prefersReducedMotion = false,
    prefersHighContrast = false,
    prefersColorSchemeDark = false,
  } = features;

  const mediaQueries = {
    '(prefers-reduced-motion: reduce)': prefersReducedMotion,
    '(prefers-contrast: high)': prefersHighContrast,
    '(prefers-color-scheme: dark)': prefersColorSchemeDark,
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: mediaQueries[query] || false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Theme transition testing
export const mockViewTransition = () => {
  const mockTransition = {
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    updateCallbackDone: Promise.resolve(),
  };

  Object.defineProperty(document, 'startViewTransition', {
    value: jest.fn((callback) => {
      if (callback) callback();
      return mockTransition;
    }),
    writable: true,
  });

  return mockTransition;
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export * from '@testing-library/user-event';
export { default as userEvent } from '@testing-library/user-event';

// Default export
export { rtlRender as render };