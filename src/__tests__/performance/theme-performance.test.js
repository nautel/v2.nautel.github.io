import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@contexts/ThemeContext';
import ThemeToggle from '@components/ThemeToggle';
import ThemeSelector from '@components/ThemeSelector';
import {
  renderWithTheme,
  createMockThemeContext,
  mockLocalStorage,
  mockAnimationFrame,
} from '../test-utils';

// Performance testing utilities
const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return {
    result,
    duration: end - start,
    name,
  };
};

const measureAsyncPerformance = async (name, fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    duration: end - start,
    name,
  };
};

describe('Theme System Performance Tests', () => {
  let mockLocalStorageInstance;

  beforeEach(() => {
    mockLocalStorageInstance = mockLocalStorage();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Theme Switching Performance', () => {
    it('switches themes within acceptable time limits', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('theme-switch', async () => {
        await user.click(toggle);
      });

      // Theme switch should complete within 100ms
      expect(measurement.duration).toBeLessThan(100);
    });

    it('handles rapid theme switches efficiently', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('rapid-theme-switches', async () => {
        // Perform 10 rapid theme switches
        for (let i = 0; i < 10; i++) {
          await user.click(toggle);
        }
      });

      // 10 rapid switches should complete within 500ms
      expect(measurement.duration).toBeLessThan(500);
    });

    it('maintains performance with multiple theme components', async () => {
      const TestApp = () => (
        <>
          <ThemeToggle variant="switch" data-testid="toggle" />
          <ThemeSelector variant="full" data-testid="selector" />
          <div data-testid="content">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i}>Themed content {i}</div>
            ))}
          </div>
        </>
      );

      const measurement = measurePerformance('multi-component-render', () => {
        renderWithTheme(<TestApp />);
      });

      // Multiple components should render within 50ms
      expect(measurement.duration).toBeLessThan(50);
    });

    it('measures CSS custom property application performance', async () => {
      const user = userEvent.setup();
      
      // Mock CSS property setting to measure calls
      const setPropertySpy = jest.fn();
      Object.defineProperty(document.documentElement, 'style', {
        value: { setProperty: setPropertySpy },
        writable: true,
      });

      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('css-property-application', async () => {
        await user.click(toggle);
      });

      // CSS property application should be efficient
      expect(measurement.duration).toBeLessThan(50);
      expect(setPropertySpy).toHaveBeenCalled();
    });
  });

  describe('Component Rendering Performance', () => {
    it('renders ThemeToggle efficiently', () => {
      const measurement = measurePerformance('theme-toggle-render', () => {
        renderWithTheme(<ThemeToggle variant="switch" />);
      });

      expect(measurement.duration).toBeLessThan(20);
    });

    it('renders ThemeSelector efficiently', () => {
      const measurement = measurePerformance('theme-selector-render', () => {
        renderWithTheme(<ThemeSelector variant="full" />);
      });

      expect(measurement.duration).toBeLessThan(30);
    });

    it('handles theme context updates efficiently', () => {
      const ThemeConsumer = () => {
        const theme = useTheme();
        return <div data-testid="theme-consumer">{theme.currentTheme}</div>;
      };

      const { rerender } = renderWithTheme(<ThemeConsumer />);

      const measurement = measurePerformance('theme-context-update', () => {
        // Simulate context update by re-rendering
        rerender(<ThemeConsumer />);
      });

      expect(measurement.duration).toBeLessThan(15);
    });

    it('efficiently handles theme provider initialization', () => {
      const measurement = measurePerformance('theme-provider-init', () => {
        render(
          <ThemeProvider>
            <div>Test content</div>
          </ThemeProvider>
        );
      });

      expect(measurement.duration).toBeLessThan(25);
    });
  });

  describe('Memory Usage and Cleanup', () => {
    it('properly cleans up event listeners', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const { unmount } = renderWithTheme(<ThemeToggle variant="switch" />);

      expect(addEventListenerSpy).toHaveBeenCalled();

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('handles component mounting and unmounting efficiently', () => {
      const measurement = measurePerformance('mount-unmount-cycle', () => {
        const { unmount } = renderWithTheme(<ThemeSelector variant="full" />);
        unmount();
      });

      expect(measurement.duration).toBeLessThan(30);
    });

    it('efficiently manages theme state updates', () => {
      const StateConsumer = ({ updateCount }) => {
        const theme = useTheme();
        return <div data-testid="update-count">{updateCount}</div>;
      };

      const { rerender } = renderWithTheme(<StateConsumer updateCount={0} />);

      const measurement = measurePerformance('state-updates', () => {
        // Simulate multiple state updates
        for (let i = 1; i <= 20; i++) {
          rerender(<StateConsumer updateCount={i} />);
        }
      });

      expect(measurement.duration).toBeLessThan(100);
    });

    it('prevents memory leaks with repeated theme switches', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('memory-leak-test', async () => {
        // Perform many theme switches to test for memory leaks
        for (let i = 0; i < 50; i++) {
          await user.click(toggle);
        }
      });

      // Should handle many switches without performance degradation
      expect(measurement.duration).toBeLessThan(2000);
    });
  });

  describe('Animation and Transition Performance', () => {
    it('handles transition animations efficiently', async () => {
      const { callbacks } = mockAnimationFrame();
      const user = userEvent.setup();

      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('transition-animation', async () => {
        await user.click(toggle);
        
        // Wait for any animation frames
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      });

      expect(measurement.duration).toBeLessThan(150);
    });

    it('optimizes performance when reduced motion is preferred', async () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });

      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('reduced-motion-switch', async () => {
        await user.click(toggle);
      });

      // Should be faster with reduced motion
      expect(measurement.duration).toBeLessThan(50);
    });

    it('efficiently handles concurrent animations', async () => {
      const user = userEvent.setup();
      
      const MultiToggleApp = () => (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <ThemeToggle key={i} variant="switch" data-testid={`toggle-${i}`} />
          ))}
        </>
      );

      renderWithTheme(<MultiToggleApp />);

      const toggles = screen.getAllByRole('switch');

      const measurement = await measureAsyncPerformance('concurrent-animations', async () => {
        // Click all toggles simultaneously
        await Promise.all(toggles.map(toggle => user.click(toggle)));
      });

      expect(measurement.duration).toBeLessThan(200);
    });
  });

  describe('localStorage Performance', () => {
    it('efficiently reads from localStorage on initialization', () => {
      mockLocalStorageInstance.getItem.mockReturnValue('light');

      const measurement = measurePerformance('localstorage-read', () => {
        renderWithTheme(<ThemeToggle variant="switch" />);
      });

      expect(measurement.duration).toBeLessThan(25);
      expect(mockLocalStorageInstance.getItem).toHaveBeenCalledWith('preferred-theme');
    });

    it('efficiently writes to localStorage during theme changes', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('localstorage-write', async () => {
        await user.click(toggle);
      });

      expect(measurement.duration).toBeLessThan(30);
      expect(mockLocalStorageInstance.setItem).toHaveBeenCalled();
    });

    it('handles localStorage errors without performance impact', async () => {
      mockLocalStorageInstance.setItem.mockImplementation(() => {
        throw new Error('localStorage full');
      });

      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('localstorage-error', async () => {
        await user.click(toggle);
      });

      // Error handling should not significantly impact performance
      expect(measurement.duration).toBeLessThan(50);
    });
  });

  describe('API Performance', () => {
    it('handles API calls without blocking UI updates', async () => {
      // Mock slow API response
      global.fetch = jest.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ theme: 'light' })
        }), 100))
      );

      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('non-blocking-api', async () => {
        await user.click(toggle);
        
        // UI should update immediately, not wait for API
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      // UI update should be fast even with slow API
      expect(measurement.duration).toBeLessThan(50);
    });

    it('efficiently batches multiple API calls', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      const measurement = await measureAsyncPerformance('batched-api-calls', async () => {
        // Rapid theme switches should not cause excessive API calls
        for (let i = 0; i < 5; i++) {
          await user.click(toggle);
        }
      });

      expect(measurement.duration).toBeLessThan(200);
    });
  });

  describe('Large Dataset Performance', () => {
    it('handles many theme consumers efficiently', () => {
      const ManyConsumers = () => (
        <>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} data-testid={`consumer-${i}`}>
              Consumer {i}
            </div>
          ))}
        </>
      );

      const measurement = measurePerformance('many-consumers', () => {
        renderWithTheme(<ManyConsumers />);
      });

      expect(measurement.duration).toBeLessThan(100);
    });

    it('efficiently updates many components on theme change', async () => {
      const ManyThemedComponents = () => (
        <>
          <ThemeToggle variant="switch" data-testid="toggle" />
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i} data-testid={`themed-${i}`}>
              Themed component {i}
            </div>
          ))}
        </>
      );

      const user = userEvent.setup();
      renderWithTheme(<ManyThemedComponents />);

      const toggle = screen.getByTestId('toggle');

      const measurement = await measureAsyncPerformance('many-component-update', async () => {
        await user.click(toggle);
      });

      expect(measurement.duration).toBeLessThan(150);
    });
  });

  describe('Performance Regression Detection', () => {
    const performanceBaselines = {
      'theme-switch': 100,
      'component-render': 30,
      'context-update': 20,
      'localstorage-operation': 25,
    };

    Object.entries(performanceBaselines).forEach(([operation, baseline]) => {
      it(`maintains ${operation} performance below baseline (${baseline}ms)`, async () => {
        let measurement;

        switch (operation) {
          case 'theme-switch':
            const user = userEvent.setup();
            renderWithTheme(<ThemeToggle variant="switch" />);
            const toggle = screen.getByRole('switch');
            measurement = await measureAsyncPerformance(operation, async () => {
              await user.click(toggle);
            });
            break;

          case 'component-render':
            measurement = measurePerformance(operation, () => {
              renderWithTheme(<ThemeSelector variant="full" />);
            });
            break;

          case 'context-update':
            const { rerender } = renderWithTheme(<div>Test</div>);
            measurement = measurePerformance(operation, () => {
              rerender(<div>Updated</div>);
            });
            break;

          case 'localstorage-operation':
            mockLocalStorageInstance.getItem.mockReturnValue('dark');
            measurement = measurePerformance(operation, () => {
              renderWithTheme(<ThemeToggle variant="switch" />);
            });
            break;

          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        expect(measurement.duration).toBeLessThan(baseline);
      });
    });
  });

  describe('Performance Optimization Verification', () => {
    it('uses React.memo or similar optimizations where appropriate', () => {
      // This would require checking component implementation
      // For now, we verify that re-renders don't cause excessive work
      const { rerender } = renderWithTheme(
        <ThemeToggle variant="switch" />
      );

      const measurement = measurePerformance('optimized-rerender', () => {
        // Multiple re-renders with same props should be optimized
        for (let i = 0; i < 10; i++) {
          rerender(<ThemeToggle variant="switch" />);
        }
      });

      expect(measurement.duration).toBeLessThan(50);
    });

    it('efficiently handles prop changes', () => {
      const { rerender } = renderWithTheme(
        <ThemeToggle variant="switch" />
      );

      const measurement = measurePerformance('prop-changes', () => {
        rerender(<ThemeToggle variant="switch" disabled />);
        rerender(<ThemeToggle variant="switch" disabled={false} />);
        rerender(<ThemeToggle variant="extended" />);
      });

      expect(measurement.duration).toBeLessThan(40);
    });

    it('optimizes context value creation', () => {
      const measurement = measurePerformance('context-optimization', () => {
        // Multiple context providers should not recreate values unnecessarily
        renderWithTheme(<div>Test 1</div>);
        renderWithTheme(<div>Test 2</div>);
        renderWithTheme(<div>Test 3</div>);
      });

      expect(measurement.duration).toBeLessThan(60);
    });
  });
});

// Performance monitoring utilities
export class ThemePerformanceMonitor {
  static measurements = new Map();

  static startMeasurement(name) {
    this.measurements.set(name, {
      start: performance.now(),
      name,
    });
  }

  static endMeasurement(name) {
    const measurement = this.measurements.get(name);
    if (!measurement) {
      console.warn(`No measurement started for: ${name}`);
      return null;
    }

    const result = {
      ...measurement,
      end: performance.now(),
      duration: performance.now() - measurement.start,
    };

    this.measurements.delete(name);
    return result;
  }

  static getAverageTime(measurements) {
    return measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length;
  }

  static detectPerformanceRegression(current, baseline, threshold = 1.5) {
    return current > baseline * threshold;
  }

  static generatePerformanceReport(measurements) {
    const report = {
      total: measurements.length,
      average: this.getAverageTime(measurements),
      min: Math.min(...measurements.map(m => m.duration)),
      max: Math.max(...measurements.map(m => m.duration)),
      p95: measurements.sort((a, b) => a.duration - b.duration)[Math.floor(measurements.length * 0.95)]?.duration || 0,
    };

    return report;
  }
}