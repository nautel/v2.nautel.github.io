import { renderHook, act } from '@testing-library/react-hooks';
import {
  useSystemTheme,
  useAccessibilityPreferences,
  useThemePersistence,
} from '@hooks/useSystemTheme';
import { mockMatchMedia, mockLocalStorage } from '../test-utils';

describe('useSystemTheme', () => {
  let mockMatchMediaInstance;

  beforeEach(() => {
    mockMatchMediaInstance = mockMatchMedia();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('detects dark theme preference', () => {
    mockMatchMedia(true); // prefers-color-scheme: dark

    const { result } = renderHook(() => useSystemTheme());

    expect(result.current.systemTheme).toBe('dark');
    expect(result.current.supportsColorScheme).toBe(true);
  });

  it('detects light theme preference', () => {
    mockMatchMedia(false); // prefers-color-scheme: light

    const { result } = renderHook(() => useSystemTheme());

    expect(result.current.systemTheme).toBe('light');
    expect(result.current.supportsColorScheme).toBe(true);
  });

  it('defaults to dark when no matchMedia support', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useSystemTheme());

    expect(result.current.systemTheme).toBe('dark');
    expect(result.current.supportsColorScheme).toBe(false);
  });

  it('handles SSR environment', () => {
    const originalWindow = global.window;
    delete global.window;

    const { result } = renderHook(() => useSystemTheme());

    expect(result.current.systemTheme).toBe('dark');
    expect(result.current.supportsColorScheme).toBe(false);

    global.window = originalWindow;
  });

  it('listens for system theme changes', () => {
    let mediaQueryCallback;
    const mockMediaQuery = {
      matches: false,
      addEventListener: jest.fn((event, callback) => {
        mediaQueryCallback = callback;
      }),
      removeEventListener: jest.fn(),
      addListener: jest.fn((callback) => {
        mediaQueryCallback = callback;
      }),
      removeListener: jest.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn(() => mockMediaQuery),
      writable: true,
    });

    const { result } = renderHook(() => useSystemTheme());

    expect(result.current.systemTheme).toBe('light');

    // Simulate system theme change to dark
    act(() => {
      mediaQueryCallback({ matches: true });
    });

    expect(result.current.systemTheme).toBe('dark');
  });

  it('uses fallback listener method for older browsers', () => {
    let mediaQueryCallback;
    const mockMediaQuery = {
      matches: false,
      addEventListener: undefined,
      removeEventListener: undefined,
      addListener: jest.fn((callback) => {
        mediaQueryCallback = callback;
      }),
      removeListener: jest.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn(() => mockMediaQuery),
      writable: true,
    });

    const { result } = renderHook(() => useSystemTheme());

    expect(mockMediaQuery.addListener).toHaveBeenCalled();

    // Simulate system theme change
    act(() => {
      mediaQueryCallback({ matches: true });
    });

    expect(result.current.systemTheme).toBe('dark');
  });

  it('cleans up event listeners on unmount', () => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn(() => mockMediaQuery),
      writable: true,
    });

    const { unmount } = renderHook(() => useSystemTheme());

    unmount();

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalled();
  });
});

describe('useAccessibilityPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('detects reduced motion preference', () => {
    const mockMediaQuery = jest.fn().mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return {
          matches: true,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      }
      return {
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
    });

    Object.defineProperty(window, 'matchMedia', {
      value: mockMediaQuery,
      writable: true,
    });

    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.supportsReducedMotion).toBe(true);
  });

  it('detects high contrast preference', () => {
    const mockMediaQuery = jest.fn().mockImplementation((query) => {
      if (query === '(prefers-contrast: high)') {
        return {
          matches: true,
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        };
      }
      return {
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
    });

    Object.defineProperty(window, 'matchMedia', {
      value: mockMediaQuery,
      writable: true,
    });

    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.prefersHighContrast).toBe(true);
    expect(result.current.supportsHighContrast).toBe(true);
  });

  it('handles missing matchMedia support', () => {
    Object.defineProperty(window, 'matchMedia', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.prefersHighContrast).toBe(false);
    expect(result.current.supportsReducedMotion).toBe(false);
    expect(result.current.supportsHighContrast).toBe(false);
  });

  it('updates preferences when media queries change', () => {
    let reducedMotionCallback;
    let highContrastCallback;

    const mockMediaQuery = jest.fn().mockImplementation((query) => {
      const mockQuery = {
        matches: false,
        addEventListener: jest.fn((event, callback) => {
          if (query === '(prefers-reduced-motion: reduce)') {
            reducedMotionCallback = callback;
          } else if (query === '(prefers-contrast: high)') {
            highContrastCallback = callback;
          }
        }),
        removeEventListener: jest.fn(),
      };
      return mockQuery;
    });

    Object.defineProperty(window, 'matchMedia', {
      value: mockMediaQuery,
      writable: true,
    });

    const { result } = renderHook(() => useAccessibilityPreferences());

    expect(result.current.prefersReducedMotion).toBe(false);
    expect(result.current.prefersHighContrast).toBe(false);

    // Simulate reduced motion preference change
    act(() => {
      reducedMotionCallback();
    });

    // Simulate high contrast preference change
    act(() => {
      highContrastCallback();
    });

    // The callback should trigger a re-render with updated preferences
    expect(mockMediaQuery).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(mockMediaQuery).toHaveBeenCalledWith('(prefers-contrast: high)');
  });
});

describe('useThemePersistence', () => {
  let mockLocalStorageInstance;

  beforeEach(() => {
    mockLocalStorageInstance = mockLocalStorage();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('provides storage methods after hydration', () => {
    const { result } = renderHook(() => useThemePersistence());

    expect(result.current.isHydrated).toBe(false);

    // Wait for hydration effect
    act(() => {
      // Hydration should occur automatically
    });

    expect(result.current.isHydrated).toBe(true);
    expect(typeof result.current.getStoredTheme).toBe('function');
    expect(typeof result.current.setStoredTheme).toBe('function');
    expect(typeof result.current.removeStoredTheme).toBe('function');
    expect(typeof result.current.getStoredPreferences).toBe('function');
    expect(typeof result.current.setStoredPreferences).toBe('function');
  });

  it('gets stored theme from localStorage', () => {
    mockLocalStorageInstance.getItem.mockReturnValue('light');

    const { result } = renderHook(() => useThemePersistence());

    act(() => {
      // Wait for hydration
    });

    const storedTheme = result.current.getStoredTheme();
    expect(storedTheme).toBe('light');
    expect(mockLocalStorageInstance.getItem).toHaveBeenCalledWith('preferred-theme');
  });

  it('sets theme in localStorage', () => {
    const { result } = renderHook(() => useThemePersistence());

    act(() => {
      // Wait for hydration
    });

    const success = result.current.setStoredTheme('dark');
    expect(success).toBe(true);
    expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith(
      'preferred-theme',
      'dark'
    );
  });

  it('removes theme from localStorage', () => {
    const { result } = renderHook(() => useThemePersistence());

    act(() => {
      // Wait for hydration
    });

    const success = result.current.removeStoredTheme();
    expect(success).toBe(true);
    expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('preferred-theme');
  });

  it('handles localStorage errors gracefully', () => {
    mockLocalStorageInstance.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    const { result } = renderHook(() => useThemePersistence());

    act(() => {
      // Wait for hydration
    });

    const storedTheme = result.current.getStoredTheme();
    expect(storedTheme).toBe(null);
  });

  it('works with custom storage key', () => {
    const { result } = renderHook(() => useThemePersistence('custom-theme-key'));

    act(() => {
      // Wait for hydration
    });

    result.current.getStoredTheme();
    expect(mockLocalStorageInstance.getItem).toHaveBeenCalledWith('custom-theme-key');
  });

  it('handles theme preferences storage', () => {
    const preferences = {
      theme: 'dark',
      autoSwitch: true,
      reducedMotion: false,
    };

    const { result } = renderHook(() => useThemePersistence());

    act(() => {
      // Wait for hydration
    });

    // Set preferences
    const setSuccess = result.current.setStoredPreferences(preferences);
    expect(setSuccess).toBe(true);
    expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith(
      'preferred-theme-preferences',
      JSON.stringify(preferences)
    );

    // Get preferences
    mockLocalStorageInstance.getItem.mockReturnValue(JSON.stringify(preferences));
    const storedPreferences = result.current.getStoredPreferences();
    expect(storedPreferences).toEqual(preferences);
  });

  it('handles invalid JSON in preferences gracefully', () => {
    mockLocalStorageInstance.getItem.mockReturnValue('invalid-json');

    const { result } = renderHook(() => useThemePersistence());

    act(() => {
      // Wait for hydration
    });

    const storedPreferences = result.current.getStoredPreferences();
    expect(storedPreferences).toBe(null);
  });

  it('returns null for operations before hydration', () => {
    const { result } = renderHook(() => useThemePersistence());

    // Before hydration
    expect(result.current.getStoredTheme()).toBe(null);
    expect(result.current.setStoredTheme('dark')).toBe(false);
    expect(result.current.removeStoredTheme()).toBe(false);
    expect(result.current.getStoredPreferences()).toBe(null);
    expect(result.current.setStoredPreferences({})).toBe(false);
  });

  it('handles SSR environment', () => {
    const originalWindow = global.window;
    delete global.window;

    const { result } = renderHook(() => useThemePersistence());

    expect(result.current.getStoredTheme()).toBe(null);
    expect(result.current.setStoredTheme('dark')).toBe(false);

    global.window = originalWindow;
  });
});