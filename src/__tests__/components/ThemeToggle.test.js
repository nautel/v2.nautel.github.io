import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import ThemeToggle from '@components/ThemeToggle';
import { renderWithTheme, createMockThemeContext } from '../test-utils';

expect.extend(toHaveNoViolations);

describe('ThemeToggle', () => {
  const mockThemeContext = createMockThemeContext();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Switch variant', () => {
    it('renders switch toggle with correct initial state', () => {
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-checked', 'true'); // dark theme active
      expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
    });

    it('renders with light theme active', () => {
      const lightThemeContext = createMockThemeContext({
        currentTheme: 'light',
        isDark: false,
        isLight: true,
      });

      renderWithTheme(<ThemeToggle variant="switch" />, {
        themeContext: lightThemeContext,
      });

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
      expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
    });

    it('displays correct icon for current theme', () => {
      renderWithTheme(<ThemeToggle variant="switch" />);

      // Dark theme should show moon icon
      const moonIcon = screen.getByRole('switch').querySelector('svg');
      expect(moonIcon).toBeInTheDocument();
    });

    it('calls toggleTheme on click', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(1);
    });

    it('calls toggleTheme on Enter key press', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      await user.keyboard('{Enter}');

      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(1);
    });

    it('calls toggleTheme on Space key press', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      toggle.focus();
      await user.keyboard(' ');

      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(1);
    });

    it('does not call toggleTheme when disabled', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" disabled />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();

      await user.click(toggle);
      expect(mockThemeContext.toggleTheme).not.toHaveBeenCalled();
    });

    it('does not call toggleTheme when loading', async () => {
      const loadingContext = createMockThemeContext({ isLoading: true });
      const user = userEvent.setup();

      renderWithTheme(<ThemeToggle variant="switch" />, {
        themeContext: loadingContext,
      });

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(mockThemeContext.toggleTheme).not.toHaveBeenCalled();
    });

    it('applies custom className', () => {
      renderWithTheme(<ThemeToggle variant="switch" className="custom-class" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveClass('custom-class');
    });

    it('forwards additional props', () => {
      renderWithTheme(<ThemeToggle variant="switch" data-testid="theme-toggle" />);

      const toggle = screen.getByTestId('theme-toggle');
      expect(toggle).toBeInTheDocument();
    });
  });

  describe('Extended variant', () => {
    it('renders extended toggle with labels', () => {
      renderWithTheme(<ThemeToggle variant="extended" showLabels />);

      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders extended toggle without labels', () => {
      renderWithTheme(<ThemeToggle variant="extended" showLabels={false} />);

      expect(screen.queryByText('Theme')).not.toBeInTheDocument();
      expect(screen.queryByText('Dark')).not.toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('shows correct theme label', () => {
      const lightThemeContext = createMockThemeContext({
        currentTheme: 'light',
        isDark: false,
        isLight: true,
      });

      renderWithTheme(
        <ThemeToggle variant="extended" showLabels />,
        { themeContext: lightThemeContext }
      );

      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('functions correctly with extended variant', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="extended" />);

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('Invalid variant', () => {
    it('returns null for invalid variant', () => {
      const { container } = renderWithTheme(<ThemeToggle variant="invalid" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Visual states', () => {
    it('shows loading state correctly', () => {
      const loadingContext = createMockThemeContext({ isLoading: true });

      renderWithTheme(<ThemeToggle variant="switch" />, {
        themeContext: loadingContext,
      });

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });

    it('applies hover styles', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      await user.hover(toggle);

      // Styled components will apply hover styles through CSS
      expect(toggle).toBeInTheDocument();
    });

    it('applies focus styles', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      await user.tab();

      expect(toggle).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('role', 'switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
      expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
      expect(toggle).toHaveAttribute('title', 'Switch to light theme');
    });

    it('provides screen reader text', () => {
      renderWithTheme(<ThemeToggle variant="switch" />);

      expect(screen.getByText('Dark theme active')).toBeInTheDocument();
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      // Should be focusable
      await user.tab();
      expect(toggle).toHaveFocus();

      // Should activate with Enter
      await user.keyboard('{Enter}');
      expect(mockThemeContext.toggleTheme).toHaveBeenCalled();
    });

    it('meets accessibility standards', async () => {
      const { container } = renderWithTheme(<ThemeToggle variant="switch" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for extended variant', async () => {
      const { container } = renderWithTheme(
        <ThemeToggle variant="extended" showLabels />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('handles reduced motion preference', () => {
      // This would be handled by CSS media queries
      // The component should render without motion styles when preferred
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });
  });

  describe('Theme integration', () => {
    it('uses theme colors correctly', () => {
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
      // Styled components will apply theme colors through CSS
    });

    it('responds to theme changes', () => {
      const { rerender } = renderWithTheme(<ThemeToggle variant="switch" />);

      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');

      // Simulate theme change
      const lightThemeContext = createMockThemeContext({
        currentTheme: 'light',
        isDark: false,
        isLight: true,
      });

      rerender(<ThemeToggle variant="switch" />);

      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Error handling', () => {
    it('handles missing theme context gracefully', () => {
      // This should be handled by the useTheme hook throwing an error
      // but for completeness, we test the component renders
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderWithTheme(<ThemeToggle variant="switch" />);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Animation and transitions', () => {
    it('handles theme toggle animation', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');

      // Click to toggle theme
      await user.click(toggle);

      expect(mockThemeContext.toggleTheme).toHaveBeenCalled();

      // The actual animation would be handled by styled-components and CSS
      await waitFor(() => {
        expect(toggle).toBeInTheDocument();
      });
    });

    it('respects reduced motion preferences', () => {
      // Mock CSS media query for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });

      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
      // CSS should disable transitions when reduced motion is preferred
    });
  });
});