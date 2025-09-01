module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:9000',
        'http://localhost:9000/404/',
      ],
      startServerCommand: 'npm run serve',
      startServerReadyPattern: 'Local:.*:\\d+',
      startServerReadyTimeout: 20000,
      numberOfRuns: 3,
    },
    assert: {
      // Performance budgets for theme system
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Network performance
        'server-response-time': ['warn', { maxNumericValue: 600 }],
        'interactive': ['error', { maxNumericValue: 3500 }],
        
        // Theme-specific performance metrics
        'unused-css-rules': ['warn', { maxNumericValue: 20000 }],
        'unused-javascript': ['warn', { maxNumericValue: 30000 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
        
        // Accessibility for theme system
        'color-contrast': 'error',
        'focus-traps': 'error',
        'focusable-controls': 'error',
        'interactive-element-affordance': 'error',
        'logical-tab-order': 'error',
        
        // PWA for offline theme support
        'installable-manifest': 'warn',
        'splash-screen': 'warn',
        'themed-omnibox': 'warn',
        'content-width': 'error',
        'apple-touch-icon': 'warn',
        
        // Security
        'is-on-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    // Optional: Upload to LHCI server if configured
    // upload: {
    //   target: 'lhci',
    //   serverBaseUrl: process.env.LHCI_SERVER_BASE_URL,
    //   token: process.env.LHCI_GITHUB_APP_TOKEN,
    // },
  },
};