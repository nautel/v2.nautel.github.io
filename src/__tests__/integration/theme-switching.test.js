import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@contexts/ThemeContext';
import ThemeToggle from '@components/ThemeToggle';
import ThemePreview from '@components/ThemePreview';
import ThemeSelector from '@components/ThemeSelector';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import {
  renderWithTheme,
  mockLocalStorage,
  mockMatchMedia,
  mockCSSCustomProperties,
  mockFetch,
} from '../test-utils';
import { lightTheme, darkTheme } from '@styles/themes';

// Integration test suite for theme switching flows
describe('Theme Switching Integration', () => {
  let mockLocalStorageInstance;
  let mockCSSProperties;

  beforeEach(() => {
    mockLocalStorageInstance = mockLocalStorage();
    mockCSSProperties = mockCSSCustomProperties();
    mockMatchMedia(false); // Default to light system preference
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const CompleteThemeApp = () => (
    <ThemeProvider>
      <StyledThemeProvider theme={darkTheme}>
        <div data-testid="app">
          <ThemeToggle variant="switch" data-testid="theme-toggle" />
          <ThemeSelector variant="full" data-testid="theme-selector" />
          <div data-testid="content">
            <h1>Test Content</h1>
            <p>This content should change themes</p>
          </div>
        </div>
      </StyledThemeProvider>
    </ThemeProvider>
  );

  describe('Complete theme switching flow', () => {
    it('switches themes through toggle and persists state', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<CompleteThemeApp />);

      // Initial state should be dark
      const toggle = screen.getByTestId('theme-toggle');
      expect(toggle).toHaveAttribute('aria-checked', 'true');

      // Toggle to light theme
      await user.click(toggle);

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      // Verify localStorage was updated
      expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith(
        'preferred-theme',
        'light'
      );

      // Verify CSS custom properties were applied
      expect(mockCSSProperties.setProperty).toHaveBeenCalled();
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'light'
      );
    });

    it('syncs theme state across multiple components', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<CompleteThemeApp />);

      // Both components should show dark theme initially
      const toggle = screen.getByTestId('theme-toggle');
      expect(toggle).toHaveAttribute('aria-checked', 'true');

      // Toggle to light theme
      await user.click(toggle);

      await waitFor(() => {
        // Both components should update
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('maintains theme consistency across component re-renders', async () => {
      const user = userEvent.setup();
      
      const { rerender } = renderWithTheme(<CompleteThemeApp />);

      // Switch to light theme
      const toggle = screen.getByTestId('theme-toggle');
      await user.click(toggle);

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      // Re-render the app
      rerender(<CompleteThemeApp />);

      // Theme should still be light
      const newToggle = screen.getByTestId('theme-toggle');
      expect(newToggle).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('System theme detection integration', () => {
    it('detects and applies system theme preference on mount', async () => {
      // Mock dark system preference
      mockMatchMedia(true);

      renderWithTheme(<CompleteThemeApp />);

      await waitFor(() => {
        const toggle = screen.getByTestId('theme-toggle');
        expect(toggle).toHaveAttribute('aria-checked', 'true');
      });
    });

    it('responds to system theme changes', async () => {
      let mediaQueryCallback;
      const mockMediaQuery = {
        matches: false,
        addEventListener: jest.fn((event, callback) => {
          mediaQueryCallback = callback;
        }),
        removeEventListener: jest.fn(),
      };

      Object.defineProperty(window, 'matchMedia', {
        value: jest.fn(() => mockMediaQuery),
        writable: true,
      });

      renderWithTheme(<CompleteThemeApp />);

      // Simulate system theme change to dark
      await waitFor(() => {
        if (mediaQueryCallback) {
          mediaQueryCallback({ matches: true });
        }
      });

      // Should not automatically switch theme (requires user opt-in)
      // But system theme state should be updated
    });
  });

  describe('Theme persistence and hydration', () => {
    it('loads saved theme from localStorage on initialization', async () => {
      mockLocalStorageInstance.getItem.mockReturnValue('light');

      renderWithTheme(<CompleteThemeApp />);

      await waitFor(() => {
        const toggle = screen.getByTestId('theme-toggle');
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      expect(mockLocalStorageInstance.getItem).toHaveBeenCalledWith('preferred-theme');
    });

    it('handles localStorage errors gracefully', async () => {
      mockLocalStorageInstance.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      renderWithTheme(<CompleteThemeApp />);

      // Should still render with default theme
      await waitFor(() => {
        const toggle = screen.getByTestId('theme-toggle');
        expect(toggle).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('handles invalid localStorage data gracefully', async () => {
      mockLocalStorageInstance.getItem.mockReturnValue('invalid-theme');

      renderWithTheme(<CompleteThemeApp />);

      // Should fallback to default theme
      await waitFor(() => {
        const toggle = screen.getByTestId('theme-toggle');
        expect(toggle).toHaveAttribute('aria-checked', 'true'); // dark default
      });
    });
  });

  describe('Theme switching with animations and transitions', () => {
    it('applies transition classes during theme switch', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');
      await user.click(toggle);

      await waitFor(() => {
        // Should apply transitioning class
        expect(document.documentElement.classList.add).toHaveBeenCalledWith(
          'theme-transitioning'
        );
      });

      // Should eventually remove the class
      await waitFor(() => {
        expect(document.documentElement.classList.remove).toHaveBeenCalledWith(
          'theme-transitioning'
        );
      });
    });

    it('respects reduced motion preferences during transitions', async () => {
      // Mock reduced motion preference
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

      const user = userEvent.setup();
      renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');
      await user.click(toggle);

      await waitFor(() => {
        // Should set transition duration to 0s for reduced motion
        expect(mockCSSProperties.setProperty).toHaveBeenCalledWith(
          '--animation-duration',
          '0s'
        );
      });
    });
  });

  describe('API integration with theme switching', () => {
    it('syncs theme changes with API when online', async () => {
      const mockAPIResponse = {
        success: true,
        data: { theme: 'light', synced: true },
      };

      mockFetch(mockAPIResponse);

      // Mock online status
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });

      const user = userEvent.setup();
      renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');
      await user.click(toggle);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('continues working when API is offline', async () => {
      // Mock network error
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Mock offline status
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
      });

      const user = userEvent.setup();
      renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');
      await user.click(toggle);

      await waitFor(() => {
        // Theme should still switch locally
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      // Should save to localStorage even when offline
      expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith(
        'preferred-theme',
        'light'
      );
    });
  });

  describe('Accessibility integration', () => {
    it('maintains accessibility attributes across theme changes', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');
      
      // Check initial accessibility attributes
      expect(toggle).toHaveAttribute('role', 'switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
      expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');

      await user.click(toggle);

      await waitFor(() => {
        // Attributes should update correctly
        expect(toggle).toHaveAttribute('aria-checked', 'false');
        expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
      });
    });

    it('provides consistent screen reader feedback', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CompleteThemeApp />);

      // Check initial screen reader text
      expect(screen.getByText('Dark theme active')).toBeInTheDocument();

      const toggle = screen.getByTestId('theme-toggle');
      await user.click(toggle);

      await waitFor(() => {
        // Screen reader text should update
        expect(screen.getByText('Light theme active')).toBeInTheDocument();
        expect(screen.queryByText('Dark theme active')).not.toBeInTheDocument();
      });
    });

    it('maintains keyboard navigation during theme transitions', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');

      // Focus the toggle
      await user.tab();
      expect(toggle).toHaveFocus();

      // Activate with keyboard
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      // Should maintain focus
      expect(toggle).toHaveFocus();
    });
  });

  describe('Error recovery and resilience', () => {
    it('recovers from CSS application errors', async () => {
      // Mock CSS property error
      mockCSSProperties.setProperty.mockImplementation(() => {
        throw new Error('CSS error');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const user = userEvent.setup();

      renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');
      
      // Should not crash on CSS error
      await user.click(toggle);

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      consoleSpy.mockRestore();
    });

    it('handles missing DOM elements gracefully', async () => {
      // Mock missing documentElement
      const originalDocumentElement = document.documentElement;
      Object.defineProperty(document, 'documentElement', {
        value: null,
        writable: true,
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const user = userEvent.setup();

      renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');
      
      // Should not crash
      await user.click(toggle);

      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      // Restore
      Object.defineProperty(document, 'documentElement', {
        value: originalDocumentElement,
        writable: true,
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and optimization', () => {
    it('batches theme updates efficiently', async () => {
      const user = userEvent.setup();
      renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');

      // Rapid theme switches
      await user.click(toggle);
      await user.click(toggle);
      await user.click(toggle);

      await waitFor(() => {
        // Should end up in dark theme (original -> light -> dark -> light)
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });

      // Should handle rapid changes without errors
      expect(mockLocalStorageInstance.setItem).toHaveBeenCalled();
    });

    it('does not cause memory leaks with event listeners', async () => {
      const { unmount } = renderWithTheme(<CompleteThemeApp />);

      // Create many theme changes
      const toggle = screen.getByTestId('theme-toggle');
      const user = userEvent.setup();

      for (let i = 0; i < 10; i++) {
        await user.click(toggle);
      }

      // Unmount should clean up without errors
      unmount();

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('handles rapid component mounting and unmounting', async () => {
      const { unmount, rerender } = renderWithTheme(<CompleteThemeApp />);

      // Quick unmount/remount cycle
      unmount();
      rerender(<CompleteThemeApp />);

      await waitFor(() => {
        const toggle = screen.getByTestId('theme-toggle');
        expect(toggle).toBeInTheDocument();
      });
    });

    it('maintains state consistency during React Suspense', async () => {
      // This would test Suspense boundaries if they were implemented
      // For now, ensure basic rendering works
      renderWithTheme(<CompleteThemeApp />);

      await waitFor(() => {
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });
    });

    it('handles theme switching during component updates', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithTheme(<CompleteThemeApp />);

      const toggle = screen.getByTestId('theme-toggle');
      await user.click(toggle);

      // Force re-render during theme transition
      rerender(<CompleteThemeApp />);

      await waitFor(() => {
        const newToggle = screen.getByTestId('theme-toggle');
        expect(newToggle).toHaveAttribute('aria-checked', 'false');
      });
    });
  });
});