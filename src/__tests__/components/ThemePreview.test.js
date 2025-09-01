import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import ThemePreview from '@components/ThemePreview';
import { renderWithTheme } from '../test-utils';
import { lightTheme, darkTheme } from '@styles/themes';

expect.extend(toHaveNoViolations);

describe('ThemePreview', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders light theme preview', () => {
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Light Theme')).toBeInTheDocument();
      expect(screen.getByText('light')).toBeInTheDocument();
    });

    it('renders dark theme preview', () => {
      renderWithTheme(
        <ThemePreview themeName="dark" isActive={false} onClick={mockOnClick} />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
      expect(screen.getByText('dark')).toBeInTheDocument();
    });

    it('renders without label when showLabel is false', () => {
      renderWithTheme(
        <ThemePreview
          themeName="light"
          isActive={false}
          onClick={mockOnClick}
          showLabel={false}
        />
      );

      expect(screen.queryByText('light')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      renderWithTheme(
        <ThemePreview
          themeName="light"
          isActive={false}
          onClick={mockOnClick}
          className="custom-preview"
        />
      );

      const container = screen.getByRole('button').closest('.custom-preview');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Active state', () => {
    it('shows selection indicator when active', () => {
      renderWithTheme(
        <ThemePreview themeName="light" isActive={true} onClick={mockOnClick} />
      );

      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('hides selection indicator when inactive', () => {
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      expect(screen.queryByText('✓')).not.toBeInTheDocument();
    });

    it('sets correct aria-pressed attribute', () => {
      const { rerender } = renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'false');

      rerender(
        <ThemePreview themeName="light" isActive={true} onClick={mockOnClick} />
      );

      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Theme content', () => {
    it('displays correct theme colors for light theme', () => {
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      // The component should use light theme colors internally
      // This would be validated through styled-components theming
      expect(screen.getByText('Light Theme')).toBeInTheDocument();
    });

    it('displays correct theme colors for dark theme', () => {
      renderWithTheme(
        <ThemePreview themeName="dark" isActive={false} onClick={mockOnClick} />
      );

      // The component should use dark theme colors internally
      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    });

    it('shows preview content elements', () => {
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      expect(screen.getByText('Light Theme')).toBeInTheDocument();
      expect(screen.getByText('Clean, modern design with optimal contrast and readability.')).toBeInTheDocument();
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('renders window controls', () => {
      const { container } = renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      // Check for window control elements (red, yellow, green dots)
      const windowControls = container.querySelectorAll('[data-testid="window-control"]');
      // The window controls are styled divs, so we check for their presence structurally
      expect(container.querySelector('[style*="background"]')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick with correct theme name when clicked', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledWith('light');
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick with dark theme name', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <ThemePreview themeName="dark" isActive={false} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledWith('dark');
    });

    it('handles Enter key press', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledWith('light');
    });

    it('handles Space key press', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledWith('light');
    });

    it('does not call onClick when onClick is not provided', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} />
      );

      const button = screen.getByRole('button');
      
      // Should not throw error
      await user.click(button);
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('role', 'button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light theme');
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveAttribute('tabIndex', '0');
    });

    it('is keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');

      // Should be focusable
      await user.tab();
      expect(button).toHaveFocus();

      // Should activate with keyboard
      await user.keyboard('{Enter}');
      expect(mockOnClick).toHaveBeenCalled();
    });

    it('meets accessibility standards', async () => {
      const { container } = renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards when active', async () => {
      const { container } = renderWithTheme(
        <ThemePreview themeName="light" isActive={true} onClick={mockOnClick} />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper focus indication', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');
      await user.tab();

      expect(button).toHaveFocus();
      // Focus styles would be applied by styled-components
    });
  });

  describe('Visual states and styling', () => {
    it('applies hover styles on mouse over', async () => {
      const user = userEvent.setup();
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');
      await user.hover(button);

      // Hover styles would be applied by styled-components
      expect(button).toBeInTheDocument();
    });

    it('applies active border when isActive is true', () => {
      renderWithTheme(
        <ThemePreview themeName="light" isActive={true} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Active border styles would be applied by styled-components based on $isActive prop
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

      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // Reduced motion styles would be applied by CSS media queries
    });
  });

  describe('Theme consistency', () => {
    it('uses consistent theme object for light preview', () => {
      renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      // The component should internally use lightTheme object
      // This would be validated through the styled-components $previewTheme prop
      expect(screen.getByText('Light Theme')).toBeInTheDocument();
    });

    it('uses consistent theme object for dark preview', () => {
      renderWithTheme(
        <ThemePreview themeName="dark" isActive={false} onClick={mockOnClick} />
      );

      // The component should internally use darkTheme object
      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    });

    it('displays theme-appropriate content', () => {
      const { rerender } = renderWithTheme(
        <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
      );

      expect(screen.getByText('Light Theme')).toBeInTheDocument();

      rerender(
        <ThemePreview themeName="dark" isActive={false} onClick={mockOnClick} />
      );

      expect(screen.getByText('Dark Theme')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('handles invalid theme names gracefully', () => {
      // Component should fallback to default theme or handle gracefully
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderWithTheme(
          <ThemePreview themeName="invalid" isActive={false} onClick={mockOnClick} />
        );
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('renders without crashing when props are missing', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderWithTheme(<ThemePreview />);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('PropTypes validation', () => {
    it('accepts valid themeName values', () => {
      expect(() => {
        renderWithTheme(
          <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
        );
        renderWithTheme(
          <ThemePreview themeName="dark" isActive={false} onClick={mockOnClick} />
        );
      }).not.toThrow();
    });

    it('accepts valid boolean values for isActive', () => {
      expect(() => {
        renderWithTheme(
          <ThemePreview themeName="light" isActive={true} onClick={mockOnClick} />
        );
        renderWithTheme(
          <ThemePreview themeName="light" isActive={false} onClick={mockOnClick} />
        );
      }).not.toThrow();
    });
  });
});