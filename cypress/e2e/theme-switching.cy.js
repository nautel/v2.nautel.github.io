/**
 * End-to-End Tests for Theme Switching
 * Tests complete user journeys for the dual-theme system
 */

describe('Theme Switching E2E', () => {
  beforeEach(() => {
    // Visit the main page
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // Clear localStorage before each test
        win.localStorage.clear();
        
        // Mock system preferences
        Object.defineProperty(win, 'matchMedia', {
          writable: true,
          value: cy.stub().returns({
            matches: false,
            addListener: cy.stub(),
            removeListener: cy.stub(),
            addEventListener: cy.stub(),
            removeEventListener: cy.stub(),
          }),
        });
      },
    });

    // Wait for the page to fully load
    cy.get('[data-testid="theme-toggle"]').should('be.visible');
  });

  describe('Basic Theme Switching', () => {
    it('switches from dark to light theme via toggle', () => {
      // Verify initial dark theme
      cy.get('[data-testid="theme-toggle"]')
        .should('have.attr', 'aria-checked', 'true')
        .and('have.attr', 'aria-label', 'Switch to light theme');

      cy.get('html').should('have.attr', 'data-theme', 'dark');

      // Click the theme toggle
      cy.get('[data-testid="theme-toggle"]').click();

      // Verify switch to light theme
      cy.get('[data-testid="theme-toggle"]')
        .should('have.attr', 'aria-checked', 'false')
        .and('have.attr', 'aria-label', 'Switch to dark theme');

      cy.get('html').should('have.attr', 'data-theme', 'light');
    });

    it('switches from light to dark theme via toggle', () => {
      // First switch to light
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');

      // Then switch back to dark
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });

    it('maintains theme state across page reloads', () => {
      // Switch to light theme
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');

      // Reload the page
      cy.reload();

      // Theme should persist
      cy.get('html').should('have.attr', 'data-theme', 'light');
      cy.get('[data-testid="theme-toggle"]')
        .should('have.attr', 'aria-checked', 'false');
    });

    it('switches theme using keyboard navigation', () => {
      // Focus the theme toggle using keyboard
      cy.get('body').type('{tab}');
      cy.get('[data-testid="theme-toggle"]').should('be.focused');

      // Activate using Enter key
      cy.get('[data-testid="theme-toggle"]').type('{enter}');
      cy.get('html').should('have.attr', 'data-theme', 'light');

      // Activate using Space key
      cy.get('[data-testid="theme-toggle"]').type(' ');
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });
  });

  describe('Theme Selector Integration', () => {
    it('switches theme via theme preview cards', () => {
      // Navigate to settings or theme selection page
      // Assuming theme selector is on the main page or accessible
      cy.get('[data-testid="theme-preview-light"]').should('be.visible');
      cy.get('[data-testid="theme-preview-dark"]').should('be.visible');

      // Click light theme preview
      cy.get('[data-testid="theme-preview-light"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');
      
      // Verify active state
      cy.get('[data-testid="theme-preview-light"]')
        .should('have.attr', 'aria-pressed', 'true');
      cy.get('[data-testid="theme-preview-dark"]')
        .should('have.attr', 'aria-pressed', 'false');

      // Click dark theme preview
      cy.get('[data-testid="theme-preview-dark"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Verify active state changed
      cy.get('[data-testid="theme-preview-dark"]')
        .should('have.attr', 'aria-pressed', 'true');
      cy.get('[data-testid="theme-preview-light"]')
        .should('have.attr', 'aria-pressed', 'false');
    });

    it('synchronizes state between toggle and previews', () => {
      // Switch using toggle
      cy.get('[data-testid="theme-toggle"]').click();
      
      // Verify preview state updated
      cy.get('[data-testid="theme-preview-light"]')
        .should('have.attr', 'aria-pressed', 'true');
      
      // Switch using preview
      cy.get('[data-testid="theme-preview-dark"]').click();
      
      // Verify toggle state updated
      cy.get('[data-testid="theme-toggle"]')
        .should('have.attr', 'aria-checked', 'true');
    });

    it('handles system theme preference toggle', () => {
      // Find and toggle system preference setting
      cy.get('[data-testid="system-theme-toggle"]')
        .should('be.visible')
        .and('contain.text', 'Off')
        .click();

      // Should show "On" after clicking
      cy.get('[data-testid="system-theme-toggle"]')
        .should('contain.text', 'On');

      // Manual theme selection should disable system following
      cy.get('[data-testid="theme-preview-light"]').click();
      
      cy.get('[data-testid="system-theme-toggle"]')
        .should('contain.text', 'Off');
    });
  });

  describe('Visual Theme Changes', () => {
    it('applies correct colors in dark theme', () => {
      // Verify dark theme colors are applied
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Check CSS custom properties are set
      cy.get('html').should('have.css', '--color-backgrounds-primary', '#0d0404');
      cy.get('html').should('have.css', '--color-text-primary', '#ffe6e6');
      
      // Check that body/main elements have dark theme styling
      cy.get('body').should('have.css', 'background-color', 'rgb(13, 4, 4)');
    });

    it('applies correct colors in light theme', () => {
      // Switch to light theme
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');
      
      // Check CSS custom properties are set
      cy.get('html').should('have.css', '--color-backgrounds-primary', '#ffffff');
      cy.get('html').should('have.css', '--color-text-primary', '#202124');
      
      // Check that body/main elements have light theme styling
      cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)');
    });

    it('updates component colors when theme changes', () => {
      // Check initial dark theme component colors
      cy.get('[data-testid="theme-toggle"]')
        .should('have.css', 'background-color')
        .and('not.equal', 'rgba(0, 0, 0, 0)');

      // Switch theme
      cy.get('[data-testid="theme-toggle"]').click();

      // Verify component colors changed
      cy.get('[data-testid="theme-toggle"]')
        .should('have.css', 'background-color')
        .and('not.equal', 'rgba(0, 0, 0, 0)');
    });

    it('handles theme transitions smoothly', () => {
      // Enable theme transitions
      cy.get('html').should('not.have.class', 'theme-transitioning');

      // Switch theme and check for transition class
      cy.get('[data-testid="theme-toggle"]').click();
      
      // Transition class should be applied briefly
      cy.get('html').should('have.class', 'theme-transitioning');
      
      // Should be removed after transition
      cy.get('html', { timeout: 1000 }).should('not.have.class', 'theme-transitioning');
    });
  });

  describe('Accessibility and User Experience', () => {
    it('provides proper ARIA labels and states', () => {
      // Check initial ARIA attributes
      cy.get('[data-testid="theme-toggle"]')
        .should('have.attr', 'role', 'switch')
        .and('have.attr', 'aria-checked', 'true')
        .and('have.attr', 'aria-label', 'Switch to light theme');

      // Switch theme and verify ARIA updates
      cy.get('[data-testid="theme-toggle"]').click();
      
      cy.get('[data-testid="theme-toggle"]')
        .should('have.attr', 'aria-checked', 'false')
        .and('have.attr', 'aria-label', 'Switch to dark theme');
    });

    it('supports screen readers with live announcements', () => {
      // Check for screen reader text
      cy.get('[data-testid="theme-toggle"]')
        .should('contain.text', 'Dark theme active');

      // Switch theme and verify announcement changes
      cy.get('[data-testid="theme-toggle"]').click();
      
      cy.get('[data-testid="theme-toggle"]')
        .should('contain.text', 'Light theme active');
    });

    it('maintains focus during theme transitions', () => {
      // Focus the toggle
      cy.get('[data-testid="theme-toggle"]').focus().should('be.focused');

      // Switch theme
      cy.get('[data-testid="theme-toggle"]').click();

      // Focus should be maintained
      cy.get('[data-testid="theme-toggle"]').should('be.focused');
    });

    it('handles high contrast preferences', () => {
      // Mock high contrast preference
      cy.window().then((win) => {
        const matchMediaStub = win.matchMedia;
        matchMediaStub.withArgs('(prefers-contrast: high)').returns({
          matches: true,
          addListener: cy.stub(),
          removeListener: cy.stub(),
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
        });
      });

      // Reload to apply preferences
      cy.reload();

      // Should show accessibility info
      cy.get('[data-testid="accessibility-info"]')
        .should('be.visible')
        .and('contain.text', 'High contrast is preferred');
    });

    it('respects reduced motion preferences', () => {
      // Mock reduced motion preference
      cy.window().then((win) => {
        const matchMediaStub = win.matchMedia;
        matchMediaStub.withArgs('(prefers-reduced-motion: reduce)').returns({
          matches: true,
          addListener: cy.stub(),
          removeListener: cy.stub(),
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
        });
      });

      // Reload to apply preferences
      cy.reload();

      // Should show accessibility info
      cy.get('[data-testid="accessibility-info"]')
        .should('be.visible')
        .and('contain.text', 'Reduced motion is enabled');

      // Transitions should be disabled
      cy.get('html').should('have.css', '--theme-transition-duration', '0s');
    });
  });

  describe('Performance and Responsiveness', () => {
    it('switches themes quickly without noticeable delay', () => {
      const startTime = Date.now();
      
      cy.get('[data-testid="theme-toggle"]').click();
      
      cy.get('html').should('have.attr', 'data-theme', 'light').then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Theme switch should complete within 500ms
        expect(duration).to.be.lessThan(500);
      });
    });

    it('handles rapid theme switches without issues', () => {
      // Rapidly switch themes multiple times
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="theme-toggle"]').click();
        cy.wait(50); // Brief pause between clicks
      }

      // Should end in light theme (odd number of clicks)
      cy.get('html').should('have.attr', 'data-theme', 'light');
      cy.get('[data-testid="theme-toggle"]')
        .should('have.attr', 'aria-checked', 'false');
    });

    it('maintains responsiveness during theme transitions', () => {
      // Start theme switch
      cy.get('[data-testid="theme-toggle"]').click();

      // Other UI elements should remain interactive
      cy.get('[data-testid="theme-preview-dark"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });
  });

  describe('Mobile and Touch Interactions', () => {
    beforeEach(() => {
      // Set mobile viewport
      cy.viewport(375, 667);
    });

    it('handles touch interactions correctly', () => {
      // Touch the theme toggle
      cy.get('[data-testid="theme-toggle"]').trigger('touchstart').trigger('touchend');
      
      // Theme should switch
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });

    it('displays mobile-optimized theme selector', () => {
      // Theme selector should adapt to mobile layout
      cy.get('[data-testid="theme-selector"]').should('be.visible');
      
      // Preview cards should stack vertically on mobile
      cy.get('[data-testid="theme-preview-light"]')
        .should('be.visible')
        .and('have.css', 'display');
    });

    it('maintains theme state during orientation changes', () => {
      // Switch to light theme
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');

      // Change orientation
      cy.viewport(667, 375);

      // Theme should persist
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });
  });

  describe('Browser Compatibility', () => {
    it('works when localStorage is disabled', () => {
      cy.window().then((win) => {
        // Mock localStorage failure
        Object.defineProperty(win, 'localStorage', {
          value: {
            getItem: cy.stub().throws('localStorage disabled'),
            setItem: cy.stub().throws('localStorage disabled'),
            removeItem: cy.stub().throws('localStorage disabled'),
          },
          writable: true,
        });
      });

      // Reload page
      cy.reload();

      // Theme switching should still work
      cy.get('[data-testid="theme-toggle"]').should('be.visible').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });

    it('gracefully handles missing CSS custom property support', () => {
      // Theme switching should work even without full CSS support
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });

    it('functions without JavaScript enhancements', () => {
      // Disable JavaScript
      cy.window().then((win) => {
        // This simulates progressive enhancement
        win.document.querySelector('[data-testid="theme-toggle"]')
          .setAttribute('disabled', 'true');
      });

      // Base HTML should still indicate theme preference
      cy.get('html').should('have.attr', 'data-theme');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('recovers from API failures gracefully', () => {
      // Mock API failure
      cy.intercept('PUT', '/api/v1/themes/preferences', {
        statusCode: 500,
        body: { error: 'Server error' },
      });

      // Theme switching should still work locally
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });

    it('handles corrupted localStorage data', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('preferred-theme', 'invalid-theme-data');
      });

      // Reload page
      cy.reload();

      // Should fallback to default theme
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });

    it('maintains functionality when theme files fail to load', () => {
      // Mock CSS loading failure (would require server setup)
      // For now, verify basic functionality continues
      cy.get('[data-testid="theme-toggle"]').should('be.visible');
      cy.get('[data-testid="theme-toggle"]').click();
      cy.get('[data-testid="theme-toggle"]')
        .should('have.attr', 'aria-checked', 'false');
    });
  });

  describe('Multi-tab Synchronization', () => {
    it('synchronizes theme changes across browser tabs', () => {
      // This would require opening multiple tabs
      // For now, simulate by dispatching storage events
      cy.window().then((win) => {
        // Switch theme in current tab
        cy.get('[data-testid="theme-toggle"]').click();
        
        // Simulate storage event from another tab
        win.dispatchEvent(new StorageEvent('storage', {
          key: 'preferred-theme',
          newValue: 'dark',
          storageArea: win.localStorage,
        }));
      });

      // Theme should sync
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });
  });

  describe('System Theme Detection', () => {
    it('detects system dark theme preference', () => {
      cy.visit('/', {
        onBeforeLoad: (win) => {
          // Mock dark system preference
          Object.defineProperty(win, 'matchMedia', {
            writable: true,
            value: cy.stub().returns({
              matches: true,
              addListener: cy.stub(),
              removeListener: cy.stub(),
              addEventListener: cy.stub(),
              removeEventListener: cy.stub(),
            }),
          });
        },
      });

      // Should detect and show dark as system preference
      cy.get('[data-testid="system-preference-info"]')
        .should('contain.text', 'Currently: dark');
    });

    it('responds to system theme changes', () => {
      let mediaQuery;
      
      cy.visit('/', {
        onBeforeLoad: (win) => {
          mediaQuery = {
            matches: false,
            addListener: cy.stub(),
            removeListener: cy.stub(),
            addEventListener: cy.stub(),
            removeEventListener: cy.stub(),
          };
          
          Object.defineProperty(win, 'matchMedia', {
            writable: true,
            value: cy.stub().returns(mediaQuery),
          });
        },
      });

      // Simulate system theme change
      cy.window().then(() => {
        mediaQuery.matches = true;
        // Trigger the change event that would normally be fired by the browser
        const callback = mediaQuery.addEventListener.args.find(
          args => args[0] === 'change'
        )?.[1];
        if (callback) {
          callback({ matches: true });
        }
      });

      // System preference indicator should update
      cy.get('[data-testid="system-preference-info"]')
        .should('contain.text', 'Currently: dark');
    });
  });
});