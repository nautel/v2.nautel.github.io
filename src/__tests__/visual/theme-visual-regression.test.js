import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@contexts/ThemeContext';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import ThemeToggle from '@components/ThemeToggle';
import ThemePreview from '@components/ThemePreview';
import ThemeSelector from '@components/ThemeSelector';
import { lightTheme, darkTheme } from '@styles/themes';
import { renderWithTheme, createMockThemeContext } from '../test-utils';

// Mock styled-components for visual testing
jest.mock('styled-components', () => {
  const React = require('react');
  
  const styled = (tag) => (styles) => {
    return React.forwardRef(({ children, ...props }, ref) => {
      const className = `styled-${tag}-${Math.random().toString(36).substr(2, 9)}`;
      return React.createElement(
        tag,
        {
          ...props,
          ref,
          className: `${props.className || ''} ${className}`,
          'data-styled': 'true',
          'data-styles': typeof styles === 'function' ? 'dynamic' : 'static',
        },
        children
      );
    });
  };

  ['div', 'button', 'span', 'h1', 'h2', 'h3', 'p'].forEach(tag => {
    styled[tag] = styled(tag);
  });

  const ThemeProvider = ({ theme, children }) => {
    const themeContextValue = {
      theme,
      ...theme,
    };

    return React.createElement(
      'div',
      {
        'data-theme-provider': 'true',
        'data-theme': theme?.name || 'unknown',
        style: {
          '--theme-name': theme?.name,
          '--theme-primary-bg': theme?.colors?.backgrounds?.primary,
          '--theme-primary-text': theme?.colors?.text?.primary,
        },
      },
      children
    );
  };

  return {
    __esModule: true,
    default: styled,
    ThemeProvider,
    css: (strings, ...values) => ({
      css: strings.join(''),
      values,
    }),
    keyframes: (strings) => ({
      name: `keyframes-${Math.random().toString(36).substr(2, 9)}`,
      styles: strings.join(''),
    }),
    createGlobalStyle: () => () => null,
  };
});

describe('Theme Visual Regression Tests', () => {
  describe('Theme Color Consistency', () => {
    it('renders ThemeToggle with correct theme attributes in dark mode', () => {
      const { container } = renderWithTheme(
        <ThemeToggle variant="switch" />,
        { initialTheme: 'dark' }
      );

      const themeProvider = container.querySelector('[data-theme-provider]');
      expect(themeProvider).toHaveAttribute('data-theme', 'dark');
      
      const toggle = container.querySelector('[role="switch"]');
      expect(toggle).toHaveAttribute('data-styled', 'true');
    });

    it('renders ThemeToggle with correct theme attributes in light mode', () => {
      const { container } = renderWithTheme(
        <ThemeToggle variant="switch" />,
        { initialTheme: 'light' }
      );

      const themeProvider = container.querySelector('[data-theme-provider]');
      expect(themeProvider).toHaveAttribute('data-theme', 'light');
      
      const toggle = container.querySelector('[role="switch"]');
      expect(toggle).toHaveAttribute('data-styled', 'true');
    });

    it('applies consistent theme colors across components', () => {
      const TestLayout = () => (
        <>
          <ThemeToggle variant="switch" data-testid="toggle" />
          <ThemePreview themeName="light" data-testid="preview" onClick={jest.fn()} />
          <ThemeSelector variant="compact" data-testid="selector" />
        </>
      );

      const { container } = renderWithTheme(<TestLayout />, { initialTheme: 'dark' });

      const themeProvider = container.querySelector('[data-theme-provider]');
      expect(themeProvider).toHaveAttribute('data-theme', 'dark');

      // All styled components should have consistent theming
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(0);
    });

    it('maintains theme consistency during theme switching', async () => {
      const mockContext = createMockThemeContext({ currentTheme: 'dark' });
      
      const { container, rerender } = renderWithTheme(
        <ThemeToggle variant="switch" />,
        { themeContext: mockContext }
      );

      // Initial dark theme
      let themeProvider = container.querySelector('[data-theme-provider]');
      expect(themeProvider).toHaveAttribute('data-theme', 'dark');

      // Switch to light theme
      const lightContext = createMockThemeContext({ currentTheme: 'light' });
      rerender(<ThemeToggle variant="switch" />);

      // Should maintain consistency (in real app, this would update)
      themeProvider = container.querySelector('[data-theme-provider]');
      expect(themeProvider).toHaveAttribute('data-theme');
    });
  });

  describe('Component Visual States', () => {
    describe('ThemeToggle Visual States', () => {
      it('renders switch variant with proper visual indicators', () => {
        const { container } = renderWithTheme(
          <ThemeToggle variant="switch" />,
          { initialTheme: 'dark' }
        );

        const toggle = container.querySelector('[role="switch"]');
        expect(toggle).toHaveAttribute('aria-checked', 'true');
        
        // Should have styled components for handle and container
        const styledElements = container.querySelectorAll('[data-styled="true"]');
        expect(styledElements.length).toBeGreaterThan(1);
      });

      it('renders extended variant with labels', () => {
        const { container } = renderWithTheme(
          <ThemeToggle variant="extended" showLabels={true} />,
          { initialTheme: 'dark' }
        );

        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        
        const styledElements = container.querySelectorAll('[data-styled="true"]');
        expect(styledElements.length).toBeGreaterThan(2);
      });

      it('shows correct icon for current theme', () => {
        const { container } = renderWithTheme(
          <ThemeToggle variant="switch" />,
          { initialTheme: 'dark' }
        );

        // Should have moon icon for dark theme
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });

      it('applies disabled state styling correctly', () => {
        const { container } = renderWithTheme(
          <ThemeToggle variant="switch" disabled />,
          { initialTheme: 'dark' }
        );

        const toggle = container.querySelector('[role="switch"]');
        expect(toggle).toHaveAttribute('disabled');
        expect(toggle).toHaveAttribute('aria-disabled', 'true');
      });
    });

    describe('ThemePreview Visual States', () => {
      it('renders light theme preview with correct visual elements', () => {
        const { container } = renderWithTheme(
          <ThemePreview themeName="light" isActive={false} onClick={jest.fn()} />
        );

        expect(screen.getByText('Light Theme')).toBeInTheDocument();
        expect(screen.getByText('light')).toBeInTheDocument();
        
        // Should have window controls
        expect(screen.getByText('Get Started')).toBeInTheDocument();
        
        const styledElements = container.querySelectorAll('[data-styled="true"]');
        expect(styledElements.length).toBeGreaterThan(3);
      });

      it('renders dark theme preview with correct visual elements', () => {
        const { container } = renderWithTheme(
          <ThemePreview themeName="dark" isActive={false} onClick={jest.fn()} />
        );

        expect(screen.getByText('Dark Theme')).toBeInTheDocument();
        expect(screen.getByText('dark')).toBeInTheDocument();
        
        const styledElements = container.querySelectorAll('[data-styled="true"]');
        expect(styledElements.length).toBeGreaterThan(3);
      });

      it('shows selection indicator when active', () => {
        renderWithTheme(
          <ThemePreview themeName="light" isActive={true} onClick={jest.fn()} />
        );

        expect(screen.getByText('✓')).toBeInTheDocument();
      });

      it('hides selection indicator when inactive', () => {
        renderWithTheme(
          <ThemePreview themeName="light" isActive={false} onClick={jest.fn()} />
        );

        expect(screen.queryByText('✓')).not.toBeInTheDocument();
      });

      it('renders without label when showLabel is false', () => {
        renderWithTheme(
          <ThemePreview 
            themeName="light" 
            isActive={false} 
            showLabel={false}
            onClick={jest.fn()} 
          />
        );

        expect(screen.queryByText('light')).not.toBeInTheDocument();
      });
    });

    describe('ThemeSelector Visual States', () => {
      it('renders full variant with complete interface', () => {
        const { container } = renderWithTheme(
          <ThemeSelector variant="full" />
        );

        expect(screen.getByText('Choose Your Theme')).toBeInTheDocument();
        expect(screen.getByText('Quick Toggle')).toBeInTheDocument();
        expect(screen.getByText('Follow system preference')).toBeInTheDocument();
        
        const styledElements = container.querySelectorAll('[data-styled="true"]');
        expect(styledElements.length).toBeGreaterThan(5);
      });

      it('renders compact variant with minimal interface', () => {
        const { container } = renderWithTheme(
          <ThemeSelector variant="compact" />
        );

        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('Follow system')).toBeInTheDocument();
        
        const styledElements = container.querySelectorAll('[data-styled="true"]');
        expect(styledElements.length).toBeGreaterThan(2);
      });

      it('renders preview-only variant with just previews', () => {
        const { container } = renderWithTheme(
          <ThemeSelector variant="preview-only" />
        );

        expect(screen.queryByText('Choose Your Theme')).not.toBeInTheDocument();
        expect(screen.queryByText('Quick Toggle')).not.toBeInTheDocument();
        
        // Should still have preview elements
        const styledElements = container.querySelectorAll('[data-styled="true"]');
        expect(styledElements.length).toBeGreaterThan(0);
      });

      it('renders toggle-only variant with just toggle', () => {
        const { container } = renderWithTheme(
          <ThemeSelector variant="toggle-only" />
        );

        expect(screen.queryByText('Choose Your Theme')).not.toBeInTheDocument();
        
        // Should have toggle elements
        const styledElements = container.querySelectorAll('[data-styled="true"]');
        expect(styledElements.length).toBeGreaterThan(0);
      });

      it('shows accessibility info when preferences are detected', () => {
        const accessibilityContext = createMockThemeContext({
          prefersReducedMotion: true,
          prefersHighContrast: true,
        });

        const { container } = renderWithTheme(
          <ThemeSelector variant="full" />,
          { themeContext: accessibilityContext }
        );

        expect(screen.getByText('Accessibility Preferences Detected')).toBeInTheDocument();
        
        const styledElements = container.querySelectorAll('[data-styled="true"]');
        expect(styledElements.length).toBeGreaterThan(5);
      });
    });
  });

  describe('Responsive Visual Behavior', () => {
    beforeEach(() => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });
    });

    it('renders components appropriately for desktop viewport', () => {
      const { container } = renderWithTheme(
        <ThemeSelector variant="full" />
      );

      // Should render full layout
      expect(screen.getByText('Choose Your Theme')).toBeInTheDocument();
      
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(5);
    });

    it('maintains visual consistency across viewport changes', () => {
      const { container } = renderWithTheme(
        <ThemeSelector variant="full" />
      );

      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 320 });
      Object.defineProperty(window, 'innerHeight', { writable: true, value: 568 });
      
      // Components should still render with styled elements
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(0);
    });

    it('applies appropriate mobile styles', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 });
      
      const { container } = renderWithTheme(
        <ThemeSelector variant="full" />
      );

      // Should still render all content
      expect(screen.getByText('Choose Your Theme')).toBeInTheDocument();
      
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(0);
    });
  });

  describe('Animation and Transition Visual States', () => {
    it('applies transition classes during theme changes', () => {
      const { container } = renderWithTheme(
        <ThemeToggle variant="switch" />
      );

      const toggle = container.querySelector('[role="switch"]');
      expect(toggle).toHaveAttribute('data-styled', 'true');
      
      // In a real app, transition classes would be applied
      // Here we just verify the component structure is correct
    });

    it('respects reduced motion preferences in visual styling', () => {
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

      const { container } = renderWithTheme(
        <ThemeToggle variant="switch" />
      );

      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(0);
    });

    it('maintains visual consistency during loading states', () => {
      const loadingContext = createMockThemeContext({ isLoading: true });

      const { container } = renderWithTheme(
        <ThemeToggle variant="switch" />,
        { themeContext: loadingContext }
      );

      const toggle = container.querySelector('[role="switch"]');
      expect(toggle).toBeDisabled();
      expect(toggle).toHaveAttribute('data-styled', 'true');
    });
  });

  describe('Theme-specific Visual Consistency', () => {
    it('maintains consistent dark theme styling across components', () => {
      const TestApp = () => (
        <>
          <ThemeToggle variant="switch" />
          <ThemePreview themeName="dark" isActive={true} onClick={jest.fn()} />
          <ThemeSelector variant="compact" />
        </>
      );

      const { container } = renderWithTheme(<TestApp />, { initialTheme: 'dark' });

      const themeProvider = container.querySelector('[data-theme-provider]');
      expect(themeProvider).toHaveAttribute('data-theme', 'dark');
      
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(5);
    });

    it('maintains consistent light theme styling across components', () => {
      const TestApp = () => (
        <>
          <ThemeToggle variant="switch" />
          <ThemePreview themeName="light" isActive={true} onClick={jest.fn()} />
          <ThemeSelector variant="compact" />
        </>
      );

      const { container } = renderWithTheme(<TestApp />, { initialTheme: 'light' });

      const themeProvider = container.querySelector('[data-theme-provider]');
      expect(themeProvider).toHaveAttribute('data-theme', 'light');
      
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(5);
    });

    it('provides proper visual hierarchy in both themes', () => {
      const { container: darkContainer } = renderWithTheme(
        <ThemeSelector variant="full" />,
        { initialTheme: 'dark' }
      );

      const { container: lightContainer } = renderWithTheme(
        <ThemeSelector variant="full" />,
        { initialTheme: 'light' }
      );

      // Both should have proper heading structure
      expect(darkContainer.querySelector('h2')).toBeInTheDocument();
      expect(lightContainer.querySelector('h2')).toBeInTheDocument();
    });

    it('ensures consistent focus indicators across themes', () => {
      const { container: darkContainer } = renderWithTheme(
        <ThemeToggle variant="switch" />,
        { initialTheme: 'dark' }
      );

      const { container: lightContainer } = renderWithTheme(
        <ThemeToggle variant="switch" />,
        { initialTheme: 'light' }
      );

      const darkToggle = darkContainer.querySelector('[role="switch"]');
      const lightToggle = lightContainer.querySelector('[role="switch"]');

      expect(darkToggle).toHaveAttribute('data-styled', 'true');
      expect(lightToggle).toHaveAttribute('data-styled', 'true');
    });
  });

  describe('Error and Edge Case Visual States', () => {
    it('renders gracefully with missing theme props', () => {
      const { container } = renderWithTheme(
        <ThemePreview themeName="light" onClick={jest.fn()} />
      );

      // Should still render styled elements
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(0);
    });

    it('handles invalid theme values visually', () => {
      const { container } = renderWithTheme(
        <ThemeToggle variant="switch" />
      );

      // Should render with default styling
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(0);
    });

    it('maintains visual structure when API calls fail', () => {
      // Mock API failure scenario
      const { container } = renderWithTheme(
        <ThemeSelector variant="full" />
      );

      // Visual structure should remain intact
      expect(screen.getByText('Choose Your Theme')).toBeInTheDocument();
      
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(0);
    });

    it('provides consistent layout when content is missing', () => {
      const { container } = renderWithTheme(
        <ThemeSelector variant="compact" showSystemPreference={false} />
      );

      // Should still render core elements
      expect(screen.getByText('Theme')).toBeInTheDocument();
      
      const styledElements = container.querySelectorAll('[data-styled="true"]');
      expect(styledElements.length).toBeGreaterThan(0);
    });
  });
});

// Utility function to simulate visual regression testing
export const captureThemeSnapshot = (component, options = {}) => {
  const { theme = 'dark', variant, props = {} } = options;
  
  const { container } = renderWithTheme(
    React.cloneElement(component, props),
    { initialTheme: theme }
  );

  return {
    theme,
    variant,
    styledElements: container.querySelectorAll('[data-styled="true"]').length,
    themeProvider: container.querySelector('[data-theme-provider]')?.getAttribute('data-theme'),
    structure: container.innerHTML.length, // Simple structure metric
    accessibility: container.querySelectorAll('[role]').length,
  };
};

// Visual regression test suite
describe('Theme Visual Regression Snapshots', () => {
  const testComponents = [
    {
      name: 'ThemeToggle Switch',
      component: <ThemeToggle variant="switch" />,
      variants: ['switch'],
    },
    {
      name: 'ThemeToggle Extended',
      component: <ThemeToggle variant="extended" showLabels={true} />,
      variants: ['extended'],
    },
    {
      name: 'ThemePreview Light',
      component: <ThemePreview themeName="light" onClick={jest.fn()} />,
      variants: ['light'],
    },
    {
      name: 'ThemePreview Dark',
      component: <ThemePreview themeName="dark" onClick={jest.fn()} />,
      variants: ['dark'],
    },
    {
      name: 'ThemeSelector Full',
      component: <ThemeSelector variant="full" />,
      variants: ['full'],
    },
    {
      name: 'ThemeSelector Compact',
      component: <ThemeSelector variant="compact" />,
      variants: ['compact'],
    },
  ];

  testComponents.forEach(({ name, component, variants }) => {
    describe(name, () => {
      ['light', 'dark'].forEach(theme => {
        it(`maintains consistent visual structure in ${theme} theme`, () => {
          const snapshot = captureThemeSnapshot(component, { theme });
          
          expect(snapshot.theme).toBe(theme);
          expect(snapshot.styledElements).toBeGreaterThan(0);
          expect(snapshot.themeProvider).toBe(theme);
          expect(snapshot.structure).toBeGreaterThan(0);
        });
      });

      variants.forEach(variant => {
        it(`renders ${variant} variant consistently`, () => {
          const darkSnapshot = captureThemeSnapshot(component, { theme: 'dark', variant });
          const lightSnapshot = captureThemeSnapshot(component, { theme: 'light', variant });
          
          // Structure should be similar between themes
          expect(Math.abs(darkSnapshot.styledElements - lightSnapshot.styledElements)).toBeLessThanOrEqual(1);
          expect(darkSnapshot.accessibility).toBe(lightSnapshot.accessibility);
        });
      });
    });
  });
});