import { renderHook, act } from '@testing-library/react-hooks';
import { useThemeTransition, useThemeAnimation } from '@hooks/useThemeTransition';
import { useTheme } from '@contexts/ThemeContext';
import { mockCSSCustomProperties, mockViewTransition } from '../test-utils';

// Mock the theme context
jest.mock('@contexts/ThemeContext');

describe('useThemeTransition', () => {
  let mockCSSProperties;
  let mockViewTransitionAPI;

  beforeEach(() => {
    mockCSSProperties = mockCSSCustomProperties();
    mockViewTransitionAPI = mockViewTransition();
    
    useTheme.mockReturnValue({
      currentTheme: 'dark',
      prefersReducedMotion: false,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization and configuration', () => {
    it('initializes with default options', () => {
      const { result } = renderHook(() => useThemeTransition());

      expect(result.current.isTransitioning).toBe(false);
      expect(result.current.transitionPhase).toBe('idle');
      expect(result.current.supportsViewTransition).toBe(true);
    });

    it('initializes with custom options', () => {
      const options = {
        duration: 500,
        easing: 'ease-in-out',
        enableViewTransition: false,
      };

      const { result } = renderHook(() => useThemeTransition(options));

      expect(result.current.supportsViewTransition).toBe(false);
    });

    it('detects View Transitions API support', () => {
      const { result } = renderHook(() => useThemeTransition());

      expect(result.current.supportsViewTransition).toBe(true);
    });

    it('handles missing View Transitions API', () => {
      delete document.startViewTransition;

      const { result } = renderHook(() => useThemeTransition());

      expect(result.current.supportsViewTransition).toBe(false);
    });
  });

  describe('CSS transition styles', () => {
    it('applies transition styles correctly', async () => {
      const { result } = renderHook(() => useThemeTransition({ duration: 300 }));

      const mockTransitionFn = jest.fn();

      await act(async () => {
        await result.current.executeTransition(mockTransitionFn);
      });

      expect(mockCSSProperties.setProperty).toHaveBeenCalledWith(
        '--theme-transition-duration',
        '300ms'
      );
      expect(document.documentElement.classList.add).toHaveBeenCalledWith(
        'theme-transitioning'
      );
    });

    it('applies no transition duration when reduced motion is preferred', async () => {
      useTheme.mockReturnValue({
        currentTheme: 'dark',
        prefersReducedMotion: true,
      });

      const { result } = renderHook(() => useThemeTransition({ duration: 300 }));

      const mockTransitionFn = jest.fn();

      await act(async () => {
        await result.current.executeTransition(mockTransitionFn);
      });

      expect(mockCSSProperties.setProperty).toHaveBeenCalledWith(
        '--theme-transition-duration',
        '0s'
      );
    });

    it('removes transition styles after completion', async () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useThemeTransition());

      const mockTransitionFn = jest.fn();

      act(() => {
        result.current.executeTransition(mockTransitionFn);
      });

      // Fast-forward through the transition
      await act(async () => {
        jest.runAllTimers();
      });

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
        'theme-transitioning'
      );

      jest.useRealTimers();
    });
  });

  describe('View Transitions API', () => {
    it('uses View Transitions API when supported', async () => {
      const { result } = renderHook(() => useThemeTransition());

      const mockTransitionFn = jest.fn();

      await act(async () => {
        await result.current.executeTransition(mockTransitionFn);
      });

      expect(document.startViewTransition).toHaveBeenCalledWith(mockTransitionFn);
      expect(mockTransitionFn).toHaveBeenCalled();
    });

    it('falls back to manual transition when View Transitions API is not supported', async () => {
      delete document.startViewTransition;

      const { result } = renderHook(() => useThemeTransition({ duration: 100 }));

      const mockTransitionFn = jest.fn();

      await act(async () => {
        await result.current.executeTransition(mockTransitionFn);
      });

      expect(mockTransitionFn).toHaveBeenCalled();
    });

    it('handles View Transition API errors gracefully', async () => {
      document.startViewTransition.mockImplementation(() => {
        throw new Error('View Transition failed');
      });

      const { result } = renderHook(() => useThemeTransition());

      const mockTransitionFn = jest.fn();

      await act(async () => {
        await result.current.executeTransition(mockTransitionFn);
      });

      expect(result.current.transitionPhase).toBe('idle');
      expect(result.current.isTransitioning).toBe(false);
    });
  });

  describe('Transition state management', () => {
    it('manages transition phases correctly', async () => {
      jest.useFakeTimers();

      const { result } = renderHook(() => useThemeTransition());

      const mockTransitionFn = jest.fn();

      act(() => {
        result.current.executeTransition(mockTransitionFn);
      });

      expect(result.current.isTransitioning).toBe(true);
      expect(result.current.transitionPhase).toBe('preparing');

      await act(async () => {
        jest.runAllTimers();
      });

      expect(result.current.transitionPhase).toBe('idle');
      expect(result.current.isTransitioning).toBe(false);

      jest.useRealTimers();
    });

    it('prevents concurrent transitions', async () => {
      const { result } = renderHook(() => useThemeTransition());

      const mockTransitionFn1 = jest.fn();
      const mockTransitionFn2 = jest.fn();

      act(() => {
        result.current.executeTransition(mockTransitionFn1);
        result.current.executeTransition(mockTransitionFn2);
      });

      expect(mockTransitionFn1).toHaveBeenCalled();
      expect(mockTransitionFn2).not.toHaveBeenCalled();
    });

    it('handles transition errors and resets state', async () => {
      const mockTransitionFn = jest.fn(() => {
        throw new Error('Transition error');
      });

      const { result } = renderHook(() => useThemeTransition());

      await act(async () => {
        await result.current.executeTransition(mockTransitionFn);
      });

      expect(result.current.transitionPhase).toBe('idle');
      expect(result.current.isTransitioning).toBe(false);
    });
  });

  describe('Theme change detection', () => {
    it('triggers transition when theme changes', () => {
      let themeValue = { currentTheme: 'dark', prefersReducedMotion: false };
      useTheme.mockReturnValue(themeValue);

      const { result, rerender } = renderHook(() => useThemeTransition());

      const executeTransition = jest.spyOn(result.current, 'executeTransition');

      // Change theme
      themeValue = { currentTheme: 'light', prefersReducedMotion: false };
      useTheme.mockReturnValue(themeValue);

      rerender();

      expect(executeTransition).toHaveBeenCalled();
    });

    it('does not trigger transition on initial render', () => {
      const { result } = renderHook(() => useThemeTransition());

      const executeTransition = jest.spyOn(result.current, 'executeTransition');

      expect(executeTransition).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('cleans up timeout on unmount', () => {
      jest.useFakeTimers();

      const { result, unmount } = renderHook(() => useThemeTransition());

      act(() => {
        result.current.executeTransition(jest.fn());
      });

      unmount();

      expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
        'theme-transitioning'
      );

      jest.useRealTimers();
    });

    it('clears transition timeout on unmount', () => {
      jest.useFakeTimers();
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const { unmount } = renderHook(() => useThemeTransition());

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});

describe('useThemeAnimation', () => {
  beforeEach(() => {
    useTheme.mockReturnValue({
      theme: {
        animations: {
          easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
        },
      },
      prefersReducedMotion: false,
    });

    jest.clearAllMocks();
  });

  describe('Animation configuration', () => {
    it('enables animations by default', () => {
      const { result } = renderHook(() => useThemeAnimation());

      expect(result.current.animationsEnabled).toBe(true);
    });

    it('disables animations when user prefers reduced motion', () => {
      useTheme.mockReturnValue({
        theme: {
          animations: { easing: 'ease' },
        },
        prefersReducedMotion: true,
      });

      const { result } = renderHook(() => useThemeAnimation());

      expect(result.current.animationsEnabled).toBe(false);
    });

    it('updates animations enabled state when preference changes', () => {
      let themeValue = {
        theme: { animations: { easing: 'ease' } },
        prefersReducedMotion: false,
      };
      useTheme.mockReturnValue(themeValue);

      const { result, rerender } = renderHook(() => useThemeAnimation());

      expect(result.current.animationsEnabled).toBe(true);

      // Change preference
      themeValue = {
        theme: { animations: { easing: 'ease' } },
        prefersReducedMotion: true,
      };
      useTheme.mockReturnValue(themeValue);

      rerender();

      expect(result.current.animationsEnabled).toBe(false);
    });
  });

  describe('Animation duration', () => {
    it('returns duration as string when animations enabled', () => {
      const { result } = renderHook(() => useThemeAnimation());

      const duration = result.current.getAnimationDuration(250);
      expect(duration).toBe('250ms');
    });

    it('returns duration string as-is when animations enabled', () => {
      const { result } = renderHook(() => useThemeAnimation());

      const duration = result.current.getAnimationDuration('0.25s');
      expect(duration).toBe('0.25s');
    });

    it('returns 0 when animations disabled', () => {
      useTheme.mockReturnValue({
        theme: { animations: { easing: 'ease' } },
        prefersReducedMotion: true,
      });

      const { result } = renderHook(() => useThemeAnimation());

      const duration = result.current.getAnimationDuration(250);
      expect(duration).toBe(0);
    });
  });

  describe('Easing function', () => {
    it('returns theme easing function', () => {
      const { result } = renderHook(() => useThemeAnimation());

      const easing = result.current.getEasing();
      expect(easing).toBe('cubic-bezier(0.645, 0.045, 0.355, 1)');
    });
  });

  describe('Animation styles creation', () => {
    it('creates animation styles when animations enabled', () => {
      const { result } = renderHook(() => useThemeAnimation());

      const animations = {
        opacity: 200,
        transform: { duration: 300, easing: 'ease-in', delay: 100 },
      };

      const styles = result.current.createAnimationStyles(animations);

      expect(styles).toEqual({
        opacity: {
          transition: 'opacity 200ms cubic-bezier(0.645, 0.045, 0.355, 1)',
        },
        transform: {
          transition: 'transform 300ms ease-in 100ms',
        },
      });
    });

    it('returns empty styles when animations disabled', () => {
      useTheme.mockReturnValue({
        theme: { animations: { easing: 'ease' } },
        prefersReducedMotion: true,
      });

      const { result } = renderHook(() => useThemeAnimation());

      const animations = {
        opacity: 200,
        transform: 300,
      };

      const styles = result.current.createAnimationStyles(animations);

      expect(styles).toEqual({});
    });

    it('handles complex animation configurations', () => {
      const { result } = renderHook(() => useThemeAnimation());

      const animations = {
        opacity: { duration: 200, delay: 50 },
        transform: { duration: 300, easing: 'ease-out' },
        color: 150,
      };

      const styles = result.current.createAnimationStyles(animations);

      expect(styles.opacity.transition).toContain('opacity 200ms');
      expect(styles.opacity.transition).toContain('50ms');
      expect(styles.transform.transition).toContain('ease-out');
      expect(styles.color.transition).toContain('color 150ms');
    });
  });

  describe('Theme object access', () => {
    it('provides access to theme object', () => {
      const mockTheme = {
        animations: { easing: 'ease' },
        colors: { primary: '#000' },
      };

      useTheme.mockReturnValue({
        theme: mockTheme,
        prefersReducedMotion: false,
      });

      const { result } = renderHook(() => useThemeAnimation());

      expect(result.current.theme).toEqual(mockTheme);
    });
  });
});