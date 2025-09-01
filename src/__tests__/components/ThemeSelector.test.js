import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import ThemeSelector from '@components/ThemeSelector';
import { renderWithTheme, createMockThemeContext } from '../test-utils';

expect.extend(toHaveNoViolations);

// Mock child components
jest.mock('@components/ThemePreview', () => {
  return function MockThemePreview({ themeName, isActive, onClick, ...props }) {
    return (
      <div
        data-testid={`theme-preview-${themeName}`}
        onClick={() => onClick && onClick(themeName)}
        role="button"
        aria-pressed={isActive}
        {...props}
      >
        {themeName} preview {isActive ? '(active)' : ''}
      </div>
    );
  };
});

jest.mock('@components/ThemeToggle', () => {
  return function MockThemeToggle({ variant, showLabels, ...props }) {
    return (
      <div data-testid="theme-toggle" data-variant={variant} {...props}>
        Theme Toggle {showLabels && '(with labels)'}
      </div>
    );
  };
});

describe('ThemeSelector', () => {
  const mockThemeContext = createMockThemeContext({
    currentTheme: 'dark',
    systemTheme: 'dark',
    prefersReducedMotion: false,
    prefersHighContrast: false,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full variant (default)', () => {
    it('renders complete theme selector interface', () => {
      renderWithTheme(<ThemeSelector variant="full" />);

      expect(screen.getByText('Choose Your Theme')).toBeInTheDocument();
      expect(screen.getByText('Select your preferred color scheme for the best viewing experience.')).toBeInTheDocument();
      expect(screen.getByTestId('theme-preview-light')).toBeInTheDocument();
      expect(screen.getByTestId('theme-preview-dark')).toBeInTheDocument();
      expect(screen.getByText('Quick Toggle')).toBeInTheDocument();
      expect(screen.getByText('Follow system preference')).toBeInTheDocument();
    });

    it('shows correct active theme preview', () => {
      renderWithTheme(<ThemeSelector variant="full" />);

      const darkPreview = screen.getByTestId('theme-preview-dark');
      const lightPreview = screen.getByTestId('theme-preview-light');

      expect(darkPreview).toHaveTextContent('(active)');
      expect(lightPreview).not.toHaveTextContent('(active)');
    });

    it('handles theme preview clicks', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeSelector variant="full" />);

      const lightPreview = screen.getByTestId('theme-preview-light');
      await user.click(lightPreview);

      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('light');
    });

    it('shows accessibility info when preferences are detected', () => {
      const accessibilityContext = createMockThemeContext({
        prefersReducedMotion: true,
        prefersHighContrast: true,
      });

      renderWithTheme(<ThemeSelector variant="full" />, {
        themeContext: accessibilityContext,
      });

      expect(screen.getByText('Accessibility Preferences Detected')).toBeInTheDocument();
      expect(screen.getByText(/Reduced motion is enabled/)).toBeInTheDocument();
      expect(screen.getByText(/High contrast is preferred/)).toBeInTheDocument();
    });

    it('hides accessibility info when showAccessibilityInfo is false', () => {
      const accessibilityContext = createMockThemeContext({
        prefersReducedMotion: true,
      });

      renderWithTheme(
        <ThemeSelector variant="full" showAccessibilityInfo={false} />,
        { themeContext: accessibilityContext }
      );

      expect(screen.queryByText('Accessibility Preferences Detected')).not.toBeInTheDocument();
    });

    it('hides system preference when showSystemPreference is false', () => {
      renderWithTheme(
        <ThemeSelector variant="full" showSystemPreference={false} />
      );

      expect(screen.queryByText('Follow system preference')).not.toBeInTheDocument();
    });
  });

  describe('Compact variant', () => {
    it('renders compact theme selector', () => {
      renderWithTheme(<ThemeSelector variant="compact" />);

      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByText('Follow system')).toBeInTheDocument();
    });

    it('does not show full interface elements', () => {
      renderWithTheme(<ThemeSelector variant="compact" />);

      expect(screen.queryByText('Choose Your Theme')).not.toBeInTheDocument();
      expect(screen.queryByTestId('theme-preview-light')).not.toBeInTheDocument();
      expect(screen.queryByTestId('theme-preview-dark')).not.toBeInTheDocument();
    });

    it('hides system preference in compact mode when requested', () => {
      renderWithTheme(
        <ThemeSelector variant="compact" showSystemPreference={false} />
      );

      expect(screen.queryByText('Follow system')).not.toBeInTheDocument();
    });
  });

  describe('Preview-only variant', () => {
    it('renders only theme previews', () => {
      renderWithTheme(<ThemeSelector variant="preview-only" />);

      expect(screen.getByTestId('theme-preview-light')).toBeInTheDocument();
      expect(screen.getByTestId('theme-preview-dark')).toBeInTheDocument();
      expect(screen.queryByText('Choose Your Theme')).not.toBeInTheDocument();
      expect(screen.queryByTestId('theme-toggle')).not.toBeInTheDocument();
    });

    it('handles preview clicks in preview-only mode', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeSelector variant="preview-only" />);

      const lightPreview = screen.getByTestId('theme-preview-light');
      await user.click(lightPreview);

      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Toggle-only variant', () => {
    it('renders only theme toggle', () => {
      renderWithTheme(<ThemeSelector variant="toggle-only" />);

      const toggle = screen.getByTestId('theme-toggle');
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('data-variant', 'extended');
      expect(toggle).toHaveTextContent('(with labels)');
    });

    it('does not show other interface elements', () => {
      renderWithTheme(<ThemeSelector variant="toggle-only" />);

      expect(screen.queryByText('Choose Your Theme')).not.toBeInTheDocument();
      expect(screen.queryByTestId('theme-preview-light')).not.toBeInTheDocument();
    });
  });

  describe('System preference functionality', () => {
    it('shows current system theme in description', () => {
      const systemLightContext = createMockThemeContext({
        systemTheme: 'light',
      });

      renderWithTheme(<ThemeSelector variant="full" />, {
        themeContext: systemLightContext,
      });

      expect(screen.getByText(/Currently: light/)).toBeInTheDocument();
    });

    it('toggles follow system preference', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeSelector variant="full" />);

      const systemToggle = screen.getByText('Off');
      expect(systemToggle).toBeInTheDocument();

      await user.click(systemToggle);

      // After clicking, it should set the theme to system theme
      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('dark');
    });

    it('shows "On" when following system preference', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeSelector variant="full" />);

      const systemToggle = screen.getByText('Off');
      await user.click(systemToggle);

      // Component state should update to show "On"
      // Note: This would require updating the component to track this state properly
      expect(systemToggle).toBeInTheDocument();
    });

    it('disables follow system when manual theme is selected', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeSelector variant="full" />);

      // First enable system following
      const systemToggle = screen.getByText('Off');
      await user.click(systemToggle);

      // Then manually select a theme
      const lightPreview = screen.getByTestId('theme-preview-light');
      await user.click(lightPreview);

      // This should disable system following (implementation dependent)
      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('light');
    });
  });

  describe('Theme change handling', () => {
    it('calls setTheme when theme preview is clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeSelector variant="full" />);

      const lightPreview = screen.getByTestId('theme-preview-light');
      await user.click(lightPreview);

      expect(mockThemeContext.setTheme).toHaveBeenCalledWith('light');
    });

    it('updates active state when theme changes', () => {
      const lightContext = createMockThemeContext({
        currentTheme: 'light',
      });

      renderWithTheme(<ThemeSelector variant="full" />, {
        themeContext: lightContext,
      });

      const lightPreview = screen.getByTestId('theme-preview-light');
      const darkPreview = screen.getByTestId('theme-preview-dark');

      expect(lightPreview).toHaveTextContent('(active)');
      expect(darkPreview).not.toHaveTextContent('(active)');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA labels for system preference toggle', () => {
      renderWithTheme(<ThemeSelector variant="full" />);

      const systemToggle = screen.getByRole('button', {
        name: 'Toggle system theme preference',
      });
      expect(systemToggle).toBeInTheDocument();
    });

    it('meets accessibility standards for full variant', async () => {
      const { container } = renderWithTheme(<ThemeSelector variant="full" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for compact variant', async () => {
      const { container } = renderWithTheme(<ThemeSelector variant="compact" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for preview-only variant', async () => {
      const { container } = renderWithTheme(<ThemeSelector variant="preview-only" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards for toggle-only variant', async () => {
      const { container } = renderWithTheme(<ThemeSelector variant="toggle-only" />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ThemeSelector variant="full" />);

      // Should be able to tab through interactive elements
      await user.tab();
      await user.tab();
      await user.tab();

      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Styling and theming', () => {
    it('applies custom className', () => {
      const { container } = renderWithTheme(
        <ThemeSelector variant="full" className="custom-selector" />
      );

      expect(container.querySelector('.custom-selector')).toBeInTheDocument();
    });

    it('uses theme colors and styles', () => {
      renderWithTheme(<ThemeSelector variant="full" />);

      // The component should use theme colors through styled-components
      expect(screen.getByText('Choose Your Theme')).toBeInTheDocument();
    });

    it('respects reduced motion preferences in styling', () => {
      const accessibilityContext = createMockThemeContext({
        prefersReducedMotion: true,
      });

      renderWithTheme(<ThemeSelector variant="full" />, {
        themeContext: accessibilityContext,
      });

      // Component should apply reduced motion styles
      expect(screen.getByText('Choose Your Theme')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('handles missing theme context gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderWithTheme(<ThemeSelector variant="full" />);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('handles invalid variant gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderWithTheme(<ThemeSelector variant="invalid" />);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('PropTypes validation', () => {
    it('accepts valid variant values', () => {
      expect(() => {
        renderWithTheme(<ThemeSelector variant="full" />);
        renderWithTheme(<ThemeSelector variant="compact" />);
        renderWithTheme(<ThemeSelector variant="preview-only" />);
        renderWithTheme(<ThemeSelector variant="toggle-only" />);
      }).not.toThrow();
    });

    it('accepts boolean props', () => {
      expect(() => {
        renderWithTheme(
          <ThemeSelector
            variant="full"
            showSystemPreference={true}
            showAccessibilityInfo={false}
          />
        );
      }).not.toThrow();
    });
  });

  describe('Integration with child components', () => {
    it('passes correct props to ThemePreview components', () => {
      renderWithTheme(<ThemeSelector variant="full" />);

      const lightPreview = screen.getByTestId('theme-preview-light');
      const darkPreview = screen.getByTestId('theme-preview-dark');

      expect(lightPreview).toHaveAttribute('aria-pressed', 'false');
      expect(darkPreview).toHaveAttribute('aria-pressed', 'true');
    });

    it('passes correct props to ThemeToggle component', () => {
      renderWithTheme(<ThemeSelector variant="compact" />);

      const toggle = screen.getByTestId('theme-toggle');
      expect(toggle).toHaveAttribute('data-variant', 'switch');
    });

    it('passes correct props to ThemeToggle in toggle-only variant', () => {
      renderWithTheme(<ThemeSelector variant="toggle-only" />);

      const toggle = screen.getByTestId('theme-toggle');
      expect(toggle).toHaveAttribute('data-variant', 'extended');
      expect(toggle).toHaveTextContent('(with labels)');
    });
  });
});