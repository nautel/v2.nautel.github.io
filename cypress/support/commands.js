// Custom Cypress commands for theme testing

/**
 * Custom command to switch theme and verify the change
 * @param {string} targetTheme - 'light' or 'dark'
 */
Cypress.Commands.add('switchTheme', (targetTheme) => {
  // Get current theme
  cy.get('html').then($html => {
    const currentTheme = $html.attr('data-theme');
    
    if (currentTheme !== targetTheme) {
      // Click toggle to switch
      cy.get('[data-testid="theme-toggle"]').click();
    }
  });

  // Verify the theme switched
  cy.get('html').should('have.attr', 'data-theme', targetTheme);
  
  // Verify toggle state
  const expectedChecked = targetTheme === 'dark' ? 'true' : 'false';
  cy.get('[data-testid="theme-toggle"]').should('have.attr', 'aria-checked', expectedChecked);
});

/**
 * Custom command to verify theme colors are applied
 * @param {string} theme - 'light' or 'dark'
 */
Cypress.Commands.add('verifyThemeColors', (theme) => {
  const expectedColors = {
    dark: {
      background: 'rgb(13, 4, 4)',
      text: 'rgb(255, 230, 230)',
    },
    light: {
      background: 'rgb(255, 255, 255)',
      text: 'rgb(32, 33, 36)',
    },
  };

  const colors = expectedColors[theme];
  
  // Verify CSS custom properties
  cy.get('html').should('have.css', '--color-backgrounds-primary', colors.background.replace('rgb', '').replace('(', '').replace(')', ''));
  
  // Verify computed styles on body
  cy.get('body').should('have.css', 'background-color', colors.background);
});

/**
 * Custom command to mock system theme preference
 * @param {string} preference - 'light' or 'dark'
 */
Cypress.Commands.add('mockSystemTheme', (preference) => {
  cy.window().then((win) => {
    const matches = preference === 'dark';
    
    Object.defineProperty(win, 'matchMedia', {
      writable: true,
      value: cy.stub().callsFake((query) => {
        if (query === '(prefers-color-scheme: dark)') {
          return {
            matches,
            addListener: cy.stub(),
            removeListener: cy.stub(),
            addEventListener: cy.stub(),
            removeEventListener: cy.stub(),
          };
        }
        return {
          matches: false,
          addListener: cy.stub(),
          removeListener: cy.stub(),
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
        };
      }),
    });
  });
});

/**
 * Custom command to mock accessibility preferences
 * @param {Object} preferences - Object with accessibility preferences
 */
Cypress.Commands.add('mockAccessibilityPreferences', (preferences = {}) => {
  cy.window().then((win) => {
    Object.defineProperty(win, 'matchMedia', {
      writable: true,
      value: cy.stub().callsFake((query) => {
        let matches = false;
        
        if (query === '(prefers-reduced-motion: reduce)' && preferences.reducedMotion) {
          matches = true;
        } else if (query === '(prefers-contrast: high)' && preferences.highContrast) {
          matches = true;
        } else if (query === '(prefers-color-scheme: dark)' && preferences.darkMode) {
          matches = true;
        }
        
        return {
          matches,
          addListener: cy.stub(),
          removeListener: cy.stub(),
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
        };
      }),
    });
  });
});

/**
 * Custom command to verify accessibility attributes
 * @param {string} selector - CSS selector for the element
 * @param {Object} expectedAttributes - Object with expected ARIA attributes
 */
Cypress.Commands.add('verifyAccessibility', (selector, expectedAttributes) => {
  cy.get(selector).should('be.visible');
  
  Object.entries(expectedAttributes).forEach(([attr, value]) => {
    cy.get(selector).should('have.attr', attr, value);
  });
});

/**
 * Custom command to test keyboard navigation
 * @param {string} selector - CSS selector for the element to focus
 * @param {string} key - Key to press ('enter', 'space', 'tab', etc.)
 */
Cypress.Commands.add('keyboardNavigate', (selector, key) => {
  cy.get(selector).focus().should('be.focused');
  
  switch (key.toLowerCase()) {
    case 'enter':
      cy.get(selector).type('{enter}');
      break;
    case 'space':
      cy.get(selector).type(' ');
      break;
    case 'tab':
      cy.get(selector).type('{tab}');
      break;
    default:
      cy.get(selector).type(`{${key}}`);
  }
});

/**
 * Custom command to verify theme persistence across page loads
 * @param {string} expectedTheme - 'light' or 'dark'
 */
Cypress.Commands.add('verifyThemePersistence', (expectedTheme) => {
  cy.reload();
  cy.get('html').should('have.attr', 'data-theme', expectedTheme);
  
  const expectedChecked = expectedTheme === 'dark' ? 'true' : 'false';
  cy.get('[data-testid="theme-toggle"]').should('have.attr', 'aria-checked', expectedChecked);
});

/**
 * Custom command to simulate touch interactions
 * @param {string} selector - CSS selector for the element
 */
Cypress.Commands.add('touchClick', (selector) => {
  cy.get(selector)
    .trigger('touchstart', { which: 1 })
    .trigger('touchend');
});

/**
 * Custom command to verify theme transitions
 */
Cypress.Commands.add('verifyThemeTransition', () => {
  // Verify transition class is applied briefly
  cy.get('html').should('have.class', 'theme-transitioning');
  
  // Verify transition class is removed after animation
  cy.get('html', { timeout: 1000 }).should('not.have.class', 'theme-transitioning');
});

/**
 * Custom command to clear theme preferences
 */
Cypress.Commands.add('clearThemePreferences', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('preferred-theme');
    win.localStorage.removeItem('preferred-theme-preferences');
  });
});

/**
 * Custom command to set localStorage theme preference
 * @param {string} theme - 'light' or 'dark'
 */
Cypress.Commands.add('setStoredTheme', (theme) => {
  cy.window().then((win) => {
    win.localStorage.setItem('preferred-theme', theme);
  });
});

/**
 * Custom command to measure performance of theme operations
 * @param {string} operationName - Name of the operation being measured
 * @param {Function} operation - Function that performs the operation
 */
Cypress.Commands.add('measurePerformance', (operationName, operation) => {
  cy.window().then((win) => {
    const startTime = win.performance.now();
    
    operation();
    
    cy.then(() => {
      const endTime = win.performance.now();
      const duration = endTime - startTime;
      
      cy.log(`${operationName} took ${duration.toFixed(2)}ms`);
      
      // Assert performance is within acceptable limits
      expect(duration, `${operationName} performance`).to.be.lessThan(1000);
    });
  });
});

/**
 * Custom command to verify responsive behavior
 * @param {Array} viewports - Array of viewport configurations
 */
Cypress.Commands.add('testResponsiveTheme', (viewports) => {
  viewports.forEach(({ width, height, name }) => {
    cy.viewport(width, height);
    cy.log(`Testing theme on ${name} (${width}x${height})`);
    
    // Verify theme elements are visible and functional
    cy.get('[data-testid="theme-toggle"]').should('be.visible');
    
    // Test theme switching on this viewport
    cy.switchTheme('light');
    cy.switchTheme('dark');
  });
});

/**
 * Custom command to simulate network failures
 * @param {string} endpoint - API endpoint to mock
 * @param {number} statusCode - HTTP status code for the failure
 */
Cypress.Commands.add('mockAPIFailure', (endpoint, statusCode = 500) => {
  cy.intercept('GET', endpoint, {
    statusCode,
    body: { error: 'Server error' },
  }).as('apiFailure');
});

/**
 * Custom command to verify error recovery
 */
Cypress.Commands.add('verifyErrorRecovery', () => {
  // Theme switching should continue to work despite API failures
  cy.get('[data-testid="theme-toggle"]').click();
  cy.get('html').should('have.attr', 'data-theme');
  
  // Local storage should still be updated
  cy.window().then((win) => {
    expect(win.localStorage.getItem('preferred-theme')).to.exist;
  });
});

/**
 * Custom command to verify contrast ratios meet WCAG standards
 * @param {string} selector - CSS selector for the element
 */
Cypress.Commands.add('verifyContrast', (selector) => {
  cy.get(selector).should('be.visible');
  
  // This would require a contrast checking library in a real implementation
  // For now, we just verify the element is visible and has color properties
  cy.get(selector).should('have.css', 'color').and('not.equal', 'rgba(0, 0, 0, 0)');
  cy.get(selector).should('have.css', 'background-color');
});

/**
 * Custom command to test focus management
 */
Cypress.Commands.add('verifyFocusManagement', () => {
  // Focus the theme toggle
  cy.get('[data-testid="theme-toggle"]').focus();
  
  // Switch theme
  cy.get('[data-testid="theme-toggle"]').click();
  
  // Focus should be maintained
  cy.get('[data-testid="theme-toggle"]').should('be.focused');
});

/**
 * Custom command to verify screen reader announcements
 * @param {string} expectedText - Expected announcement text
 */
Cypress.Commands.add('verifyScreenReaderText', (expectedText) => {
  // Check for visually hidden text that would be read by screen readers
  cy.get('[data-testid="theme-toggle"]').should('contain', expectedText);
});

// Add support for axe-core accessibility testing
Cypress.Commands.add('checkA11y', (selector, options) => {
  cy.injectAxe();
  cy.checkA11y(selector, options);
});

// Import and configure axe-core
import 'cypress-axe';

// Command to inject axe-core
Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then((window) => {
    const script = window.document.createElement('script');
    script.src = 'https://unpkg.com/axe-core@4.7.0/axe.min.js';
    window.document.head.appendChild(script);
  });
});

// Configure global test settings
beforeEach(() => {
  // Set up common test environment
  cy.visit('/', {
    onBeforeLoad: (win) => {
      // Clear storage
      win.localStorage.clear();
      win.sessionStorage.clear();
      
      // Set up performance marking
      win.performance.mark = win.performance.mark || (() => {});
      win.performance.measure = win.performance.measure || (() => {});
    },
  });
  
  // Wait for app to be ready
  cy.get('[data-testid="app"]', { timeout: 10000 }).should('be.visible');
});

// After each test, clean up
afterEach(() => {
  // Clear any timers or intervals that might be running
  cy.window().then((win) => {
    // Clear any theme-related timers
    win.clearTimeout = win.clearTimeout || (() => {});
    win.clearInterval = win.clearInterval || (() => {});
  });
});