import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@contexts/ThemeContext';
import { lightTheme, darkTheme, themeConfig } from '@styles/themes';
import {
  mockLocalStorage,
  mockMatchMedia,
  mockCSSCustomProperties,
} from '../test-utils';

describe('ThemeContext', () => {
  let mockLocalStorageInstance;
  let mockMatchMediaInstance;
  let mockCSSProperties;

  beforeEach(() => {
    mockLocalStorageInstance = mockLocalStorage();
    mockMatchMediaInstance = mockMatchMedia();
    mockCSSProperties = mockCSSCustomProperties();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const TestComponent = () => {
    const theme = useTheme();
    return (
      <div data-testid="theme-consumer">
        <span data-testid="current-theme">{theme.currentTheme}</span>
        <span data-testid="system-theme">{theme.systemTheme}</span>
        <span data-testid="is-loading">{theme.isLoading.toString()}</span>
        <span data-testid="prefers-reduced-motion">
          {theme.prefersReducedMotion.toString()}
        </span>
        <span data-testid="prefers-high-contrast">
          {theme.prefersHighContrast.toString()}
        </span>
      </div>
    );
  };

  describe('ThemeProvider', () => {
    it('provides default theme context values', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('system-theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    it('initializes with light theme when system prefers light', () => {
      mockMatchMedia(false); // prefers-color-scheme: light

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('system-theme')).toHaveTextContent('light');
    });

    it('initializes with dark theme when system prefers dark', () => {
      mockMatchMedia(true); // prefers-color-scheme: dark

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('system-theme')).toHaveTextContent('dark');
    });

    it('loads stored theme from localStorage', () => {
      mockLocalStorageInstance.getItem.mockReturnValue('light');

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockLocalStorageInstance.getItem).toHaveBeenCalledWith(
        themeConfig.storageKey
      );
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('detects reduced motion preference', () => {
      const mockMediaQuery = jest.fn().mockImplementation((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return {
            matches: true,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          };
        }
        return {
          matches: false,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMediaQuery,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('prefers-reduced-motion')).toHaveTextContent('true');
    });

    it('detects high contrast preference', () => {
      const mockMediaQuery = jest.fn().mockImplementation((query) => {
        if (query === '(prefers-contrast: high)') {
          return {
            matches: true,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
          };
        }
        return {
          matches: false,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      });

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMediaQuery,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('prefers-high-contrast')).toHaveTextContent('true');
    });

    it('applies CSS custom properties when theme changes', () => {
      const TestThemeChanger = () => {
        const { setTheme } = useTheme();
        return (
          <button onClick={() => setTheme('light')} data-testid="change-theme">
            Change Theme
          </button>
        );
      };

      const { getByTestId } = render(
        <ThemeProvider>
          <TestThemeChanger />
        </ThemeProvider>
      );

      act(() => {
        getByTestId('change-theme').click();
      });

      // Check that CSS custom properties were set
      expect(mockCSSProperties.setProperty).toHaveBeenCalled();
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light'
      );
    });

    it('saves theme to localStorage when changed', () => {
      const TestThemeChanger = () => {
        const { setTheme } = useTheme();
        return (
          <button onClick={() => setTheme('light')} data-testid="change-theme">
            Change Theme
          </button>
        );
      };

      const { getByTestId } = render(
        <ThemeProvider>
          <TestThemeChanger />
        </ThemeProvider>
      );

      act(() => {
        getByTestId('change-theme').click();
      });

      expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith(
        themeConfig.storageKey,
        'light'
      );
    });

    it('sets up media query listeners', () => {
      const mockEventListener = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        matches: false,
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn(() => mockEventListener),
      });

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockEventListener.addEventListener).toHaveBeenCalled();

      unmount();

      expect(mockEventListener.removeEventListener).toHaveBeenCalled();
    });

    it('handles media query listener fallback for older browsers', () => {
      const mockEventListener = {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        matches: false,
      };

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn(() => mockEventListener),
      });

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockEventListener.addListener).toHaveBeenCalled();

      unmount();

      expect(mockEventListener.removeListener).toHaveBeenCalled();
    });
  });

  describe('useTheme hook', () => {
    const wrapper = ({ children }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );

    it('throws error when used outside ThemeProvider', () => {
      const TestComponent = () => {
        useTheme();
        return null;
      };

      // Suppress error boundary logs for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => render(<TestComponent />)).toThrow(
        'useTheme must be used within a ThemeProvider'
      );

      console.error = originalError;
    });

    it('returns current theme object based on theme name', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toEqual(darkTheme);
      expect(result.current.currentTheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(result.current.isLight).toBe(false);
    });

    it('toggles theme correctly', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.currentTheme).toBe('dark');

      await act(async () => {
        result.current.toggleTheme();
      });

      expect(result.current.currentTheme).toBe('light');
      expect(result.current.theme).toEqual(lightTheme);
      expect(result.current.isLight).toBe(true);
      expect(result.current.isDark).toBe(false);
    });

    it('sets specific theme correctly', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        result.current.setTheme('light');
      });

      expect(result.current.currentTheme).toBe('light');
      expect(result.current.theme).toEqual(lightTheme);
    });

    it('provides correct helper properties', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toHaveProperty('currentTheme');
      expect(result.current).toHaveProperty('systemTheme');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('prefersReducedMotion');
      expect(result.current).toHaveProperty('prefersHighContrast');
      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('setTheme');
      expect(result.current).toHaveProperty('toggleTheme');
      expect(result.current).toHaveProperty('isLight');
      expect(result.current).toHaveProperty('isDark');
    });
  });

  describe('Theme object integrity', () => {
    it('provides complete theme objects', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      // Test dark theme structure
      expect(result.current.theme).toHaveProperty('name', 'dark');
      expect(result.current.theme).toHaveProperty('colors');
      expect(result.current.theme).toHaveProperty('fonts');
      expect(result.current.theme).toHaveProperty('fontSizes');
      expect(result.current.theme).toHaveProperty('animations');
      expect(result.current.theme).toHaveProperty('layout');
      expect(result.current.theme).toHaveProperty('bp');

      // Test color structure
      expect(result.current.theme.colors).toHaveProperty('backgrounds');
      expect(result.current.theme.colors).toHaveProperty('text');
      expect(result.current.theme.colors).toHaveProperty('accents');
      expect(result.current.theme.colors).toHaveProperty('borders');
      expect(result.current.theme.colors).toHaveProperty('shadows');
      expect(result.current.theme.colors).toHaveProperty('states');
    });

    it('switches between complete theme objects', async () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
      });

      // Start with dark theme
      expect(result.current.theme.name).toBe('dark');
      expect(result.current.theme.colors.backgrounds.primary).toBe('#0d0404');

      // Toggle to light theme
      await act(async () => {
        result.current.toggleTheme();
      });

      expect(result.current.theme.name).toBe('light');
      expect(result.current.theme.colors.backgrounds.primary).toBe('#ffffff');
    });
  });

  describe('Error handling and edge cases', () => {
    it('handles missing localStorage gracefully', () => {
      // Mock localStorage to throw an error
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => {
            throw new Error('localStorage not available');
          }),
          setItem: jest.fn(() => {
            throw new Error('localStorage not available');
          }),
        },
        writable: true,
      });

      // Should not throw error
      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();
    });

    it('handles missing matchMedia gracefully', () => {
      // Remove matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true,
      });

      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();
    });

    it('handles SSR environment (no window)', () => {
      const originalWindow = global.window;
      delete global.window;

      expect(() => {
        render(
          <ThemeProvider>
            <TestComponent />
          </ThemeProvider>
        );
      }).not.toThrow();

      global.window = originalWindow;
    });
  });
});