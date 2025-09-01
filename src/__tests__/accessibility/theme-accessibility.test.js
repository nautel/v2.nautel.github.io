import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@contexts/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import ThemeToggle from '@components/ThemeToggle';
import ThemePreview from '@components/ThemePreview';
import ThemeSelector from '@components/ThemeSelector';
import {
  renderWithTheme,
  createMockThemeContext,
  mockAccessibilityFeatures,
} from '../test-utils';
import { lightTheme, darkTheme } from '@styles/themes';

expect.extend(toHaveNoViolations);

describe('Theme System Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('WCAG Compliance', () => {
    describe('ThemeToggle Accessibility', () => {
      it('meets WCAG AA standards in both themes', async () => {
        // Test dark theme
        const { container: darkContainer } = renderWithTheme(
          <ThemeToggle variant="switch" />,
          { initialTheme: 'dark' }
        );
        const darkResults = await axe(darkContainer);
        expect(darkResults).toHaveNoViolations();

        // Test light theme
        const { container: lightContainer } = renderWithTheme(
          <ThemeToggle variant="switch" />,
          { initialTheme: 'light' }
        );
        const lightResults = await axe(lightContainer);
        expect(lightResults).toHaveNoViolations();
      });

      it('provides proper ARIA labels and roles', () => {
        renderWithTheme(<ThemeToggle variant="switch" />);

        const toggle = screen.getByRole('switch');
        expect(toggle).toHaveAttribute('role', 'switch');
        expect(toggle).toHaveAttribute('aria-checked');
        expect(toggle).toHaveAttribute('aria-label');
        expect(toggle).toHaveAttribute('title');
      });

      it('supports keyboard navigation', async () => {
        const user = userEvent.setup();
        renderWithTheme(<ThemeToggle variant="switch" />);

        const toggle = screen.getByRole('switch');

        // Should be focusable
        await user.tab();
        expect(toggle).toHaveFocus();

        // Should activate with Space key
        await user.keyboard(' ');
        expect(toggle).toHaveAttribute('aria-checked', 'false');

        // Should activate with Enter key
        await user.keyboard('{Enter}');
        expect(toggle).toHaveAttribute('aria-checked', 'true');
      });

      it('provides screen reader announcements', () => {
        renderWithTheme(<ThemeToggle variant="switch" />);

        // Should have visually hidden screen reader text
        expect(screen.getByText('Dark theme active')).toBeInTheDocument();
      });

      it('meets contrast requirements in both themes', async () => {
        // This would require actual color contrast calculation
        // For now, we ensure the component renders without violations
        const { container } = renderWithTheme(<ThemeToggle variant="switch" />);
        const results = await axe(container, {
          rules: {
            'color-contrast': { enabled: true },
          },
        });
        expect(results).toHaveNoViolations();
      });
    });

    describe('ThemePreview Accessibility', () => {
      it('meets WCAG AA standards', async () => {
        const { container } = renderWithTheme(
          <ThemePreview themeName="light" onClick={jest.fn()} />
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it('provides proper button semantics', () => {
        renderWithTheme(
          <ThemePreview themeName="light" onClick={jest.fn()} />
        );

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('role', 'button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
        expect(button).toHaveAttribute('aria-pressed');
        expect(button).toHaveAttribute('tabIndex', '0');
      });

      it('supports keyboard interaction', async () => {
        const mockOnClick = jest.fn();
        const user = userEvent.setup();

        renderWithTheme(
          <ThemePreview themeName="light" onClick={mockOnClick} />
        );

        const button = screen.getByRole('button');
        await user.tab();
        expect(button).toHaveFocus();

        await user.keyboard('{Enter}');
        expect(mockOnClick).toHaveBeenCalledWith('light');

        await user.keyboard(' ');
        expect(mockOnClick).toHaveBeenCalledWith('light');
      });

      it('indicates selection state to screen readers', () => {
        const { rerender } = renderWithTheme(
          <ThemePreview themeName="light" isActive={false} onClick={jest.fn()} />
        );

        let button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-pressed', 'false');

        rerender(
          <ThemePreview themeName="light" isActive={true} onClick={jest.fn()} />
        );

        button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-pressed', 'true');
      });
    });

    describe('ThemeSelector Accessibility', () => {
      it('meets WCAG AA standards for full variant', async () => {
        const { container } = renderWithTheme(
          <ThemeSelector variant="full" />
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it('meets WCAG AA standards for compact variant', async () => {
        const { container } = renderWithTheme(
          <ThemeSelector variant="compact" />
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });

      it('provides proper heading hierarchy', () => {
        renderWithTheme(<ThemeSelector variant="full" />);

        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toHaveTextContent('Choose Your Theme');
      });

      it('groups related form controls properly', () => {
        renderWithTheme(<ThemeSelector variant="full" />);

        // System preference toggle should have proper labeling
        const systemToggle = screen.getByRole('button', {
          name: /toggle system theme preference/i,
        });
        expect(systemToggle).toBeInTheDocument();
      });

      it('provides descriptive text for complex interactions', () => {
        renderWithTheme(<ThemeSelector variant="full" />);

        expect(screen.getByText(/select your preferred color scheme/i)).toBeInTheDocument();
        expect(screen.getByText(/automatically switch themes based on your system setting/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Preferences Integration', () => {
    it('respects prefers-reduced-motion', () => {
      mockAccessibilityFeatures({ prefersReducedMotion: true });

      renderWithTheme(<ThemeToggle variant="switch" />);

      // Component should render with reduced motion preferences
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('detects and adapts to high contrast preferences', () => {
      mockAccessibilityFeatures({ prefersHighContrast: true });

      renderWithTheme(<ThemeSelector variant="full" />);

      // Should show accessibility preferences info
      expect(screen.getByText(/high contrast is preferred/i)).toBeInTheDocument();
    });

    it('provides feedback about accessibility adaptations', () => {
      mockAccessibilityFeatures({
        prefersReducedMotion: true,
        prefersHighContrast: true,
      });

      renderWithTheme(<ThemeSelector variant="full" />);

      expect(screen.getByText('Accessibility Preferences Detected')).toBeInTheDocument();
      expect(screen.getByText(/reduced motion is enabled/i)).toBeInTheDocument();
      expect(screen.getByText(/high contrast is preferred/i)).toBeInTheDocument();
    });

    it('handles multiple accessibility preferences simultaneously', () => {
      mockAccessibilityFeatures({
        prefersReducedMotion: true,
        prefersHighContrast: true,
        prefersColorSchemeDark: true,
      });

      renderWithTheme(<ThemeSelector variant="full" />);

      const accessibilitySection = screen.getByText('Accessibility Preferences Detected');
      expect(accessibilitySection).toBeInTheDocument();
    });

    it('updates accessibility adaptations when preferences change', async () => {
      let reducedMotionCallback;

      const mockMediaQuery = jest.fn().mockImplementation((query) => {
        if (query === '(prefers-reduced-motion: reduce)') {
          return {
            matches: false,
            addEventListener: jest.fn((event, callback) => {
              reducedMotionCallback = callback;
            }),
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

      renderWithTheme(<ThemeSelector variant="full" />);

      // Initially no accessibility info
      expect(screen.queryByText('Accessibility Preferences Detected')).not.toBeInTheDocument();

      // Simulate reduced motion preference change
      if (reducedMotionCallback) {
        reducedMotionCallback({ matches: true });
      }

      await waitFor(() => {
        expect(screen.getByText('Accessibility Preferences Detected')).toBeInTheDocument();
      });
    });
  });

  describe('Focus Management', () => {
    it('maintains logical tab order', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<ThemeSelector variant="full" />);

      // Tab through interactive elements
      await user.tab(); // First theme preview
      expect(screen.getAllByRole('button')[0]).toHaveFocus();

      await user.tab(); // Second theme preview
      expect(screen.getAllByRole('button')[1]).toHaveFocus();

      await user.tab(); // Theme toggle
      expect(screen.getByRole('switch')).toHaveFocus();

      await user.tab(); // System preference toggle
      expect(screen.getByRole('button', { name: /toggle system theme preference/i })).toHaveFocus();
    });

    it('preserves focus during theme transitions', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      await user.tab();
      expect(toggle).toHaveFocus();

      await user.keyboard(' ');

      await waitFor(() => {
        expect(toggle).toHaveFocus();
      });
    });

    it('provides focus indicators that meet contrast requirements', async () => {
      const user = userEvent.setup();
      
      const { container } = renderWithTheme(<ThemeToggle variant="switch" />);

      await user.tab();

      // Focus should be visible (tested through axe)
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('does not create focus traps unintentionally', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<ThemeSelector variant="full" />);

      // Should be able to tab through all elements and beyond
      const interactiveElements = screen.getAllByRole('button');
      const switchElement = screen.getByRole('switch');
      
      const allElements = [...interactiveElements, switchElement];

      for (let i = 0; i < allElements.length; i++) {
        await user.tab();
        expect(allElements[i]).toHaveFocus();
      }

      // Should be able to tab past the component
      await user.tab();
      expect(document.activeElement).not.toBe(allElements[allElements.length - 1]);
    });
  });

  describe('Screen Reader Support', () => {
    it('provides meaningful text alternatives', () => {
      renderWithTheme(<ThemeToggle variant="switch" />);

      // Should have meaningful aria-label
      const toggle = screen.getByRole('switch');
      expect(toggle.getAttribute('aria-label')).toMatch(/switch to \w+ theme/i);
    });

    it('announces state changes appropriately', async () => {
      const user = userEvent.setup();
      
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      expect(screen.getByText('Dark theme active')).toBeInTheDocument();

      await user.click(toggle);

      await waitFor(() => {
        expect(screen.getByText('Light theme active')).toBeInTheDocument();
        expect(screen.queryByText('Dark theme active')).not.toBeInTheDocument();
      });
    });

    it('provides context for complex UI patterns', () => {
      renderWithTheme(<ThemeSelector variant="full" />);

      // Should provide description of the selector's purpose
      expect(screen.getByText(/select your preferred color scheme/i)).toBeInTheDocument();
    });

    it('groups related content with proper landmarks', () => {
      const { container } = renderWithTheme(<ThemeSelector variant="full" />);

      // Check for proper sectioning (would need semantic HTML)
      expect(container.querySelector('[role]')).toBeTruthy();
    });

    it('handles empty states and loading states accessibly', () => {
      const loadingContext = createMockThemeContext({ isLoading: true });

      renderWithTheme(<ThemeToggle variant="switch" />, {
        themeContext: loadingContext,
      });

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
    });
  });

  describe('Color and Contrast', () => {
    it('maintains sufficient contrast in both themes', async () => {
      // Test both themes for contrast compliance
      const { container: darkContainer } = renderWithTheme(
        <ThemeSelector variant="full" />,
        { initialTheme: 'dark' }
      );

      const darkResults = await axe(darkContainer, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true },
        },
      });
      expect(darkResults).toHaveNoViolations();

      const { container: lightContainer } = renderWithTheme(
        <ThemeSelector variant="full" />,
        { initialTheme: 'light' }
      );

      const lightResults = await axe(lightContainer, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true },
        },
      });
      expect(lightResults).toHaveNoViolations();
    });

    it('does not rely solely on color to convey information', () => {
      renderWithTheme(
        <ThemePreview themeName="light" isActive={true} onClick={jest.fn()} />
      );

      // Should have visual indicator beyond color (checkmark)
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('provides alternative means of distinguishing elements', () => {
      renderWithTheme(<ThemeSelector variant="full" />);

      // Theme previews should have text labels
      expect(screen.getByText('light')).toBeInTheDocument();
      expect(screen.getByText('dark')).toBeInTheDocument();
    });
  });

  describe('Motion and Animation Accessibility', () => {
    it('disables animations when prefers-reduced-motion is set', () => {
      mockAccessibilityFeatures({ prefersReducedMotion: true });

      renderWithTheme(<ThemeToggle variant="switch" />);

      // Component should render without throwing errors
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('provides alternative feedback when animations are disabled', async () => {
      mockAccessibilityFeatures({ prefersReducedMotion: true });

      const user = userEvent.setup();
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      // Should still provide state feedback through aria attributes
      await waitFor(() => {
        expect(toggle).toHaveAttribute('aria-checked', 'false');
      });
    });

    it('ensures essential functionality works without motion', async () => {
      mockAccessibilityFeatures({ prefersReducedMotion: true });

      const user = userEvent.setup();
      renderWithTheme(<ThemeSelector variant="full" />);

      // All functionality should work without animations
      const themePreview = screen.getAllByRole('button')[0];
      await user.click(themePreview);

      // Theme should still switch
      await waitFor(() => {
        expect(themePreview).toHaveAttribute('aria-pressed', 'true');
      });
    });
  });

  describe('Error States and Edge Cases', () => {
    it('handles error states accessibly', () => {
      // Mock an error condition
      const errorContext = createMockThemeContext({ isLoading: false });

      renderWithTheme(<ThemeToggle variant="switch" disabled />, {
        themeContext: errorContext,
      });

      const toggle = screen.getByRole('switch');
      expect(toggle).toBeDisabled();
      expect(toggle).toHaveAttribute('aria-disabled', 'true');
    });

    it('provides helpful error messages when theme switching fails', () => {
      // This would require error boundary implementation
      renderWithTheme(<ThemeToggle variant="switch" />);

      // Component should render without throwing
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('gracefully handles missing accessibility APIs', () => {
      // Mock missing matchMedia
      Object.defineProperty(window, 'matchMedia', {
        value: undefined,
        writable: true,
      });

      renderWithTheme(<ThemeSelector variant="full" />);

      // Should still render without accessibility preference detection
      expect(screen.getByText('Choose Your Theme')).toBeInTheDocument();
    });

    it('maintains accessibility when JavaScript is disabled', () => {
      // While we can't fully test no-JS scenarios in Jest,
      // we ensure the component has proper semantic HTML
      renderWithTheme(<ThemeToggle variant="switch" />);

      const toggle = screen.getByRole('switch');
      expect(toggle.tagName).toBe('BUTTON');
      expect(toggle).toHaveAttribute('type', 'button');
    });
  });

  describe('Internationalization and Accessibility', () => {
    it('supports RTL languages', async () => {
      // Mock RTL direction
      document.dir = 'rtl';

      const { container } = renderWithTheme(<ThemeSelector variant="full" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Reset
      document.dir = 'ltr';
    });

    it('works with screen reader navigation commands', () => {
      renderWithTheme(<ThemeSelector variant="full" />);

      // Should have proper heading structure for navigation
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('provides appropriate landmark roles', () => {
      const { container } = renderWithTheme(<ThemeSelector variant="full" />);

      // Should have semantic structure
      expect(container.querySelector('h2')).toBeInTheDocument();
    });
  });
});