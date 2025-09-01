// Sentry configuration for error tracking and performance monitoring

const { withSentryConfig } = require('@sentry/nextjs');

// Sentry webpack plugin options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  
  // Organization and project for Sentry
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Source maps configuration
  include: './public',
  ignore: ['node_modules', 'webpack.config.js'],
  
  // Release configuration
  setCommits: {
    auto: true,
  },
  deploy: {
    env: process.env.NODE_ENV || 'development',
  },
};

// Base Sentry configuration
const sentryConfig = {
  dsn: process.env.GATSBY_SENTRY_DSN,
  
  // Environment and release tracking
  environment: process.env.NODE_ENV || 'development',
  release: process.env.SENTRY_RELEASE || 'unknown',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay for debugging
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Enhanced error context
  beforeSend(event, hint) {
    // Filter out theme-related non-critical errors
    if (event.exception && event.exception.values) {
      const error = event.exception.values[0];
      
      // Skip theme transition errors that are recoverable
      if (error.value && error.value.includes('Theme transition')) {
        return null;
      }
      
      // Skip localStorage errors in incognito mode
      if (error.value && error.value.includes('localStorage')) {
        return null;
      }
    }
    
    // Add theme context to all errors
    if (typeof window !== 'undefined') {
      event.contexts = event.contexts || {};
      event.contexts.theme = {
        current_theme: localStorage.getItem('theme') || 'system',
        system_theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        theme_support: 'prefers-color-scheme' in window.matchMedia('').media,
      };
    }
    
    return event;
  },
  
  // Enhanced performance monitoring
  beforeTransaction(context) {
    // Add theme information to performance transactions
    if (typeof window !== 'undefined') {
      context.tags = context.tags || {};
      context.tags.theme = localStorage.getItem('theme') || 'system';
      context.tags.system_theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return context;
  },
  
  // Custom error filtering
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    
    // Random plugins/extensions
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    
    // Network errors that are expected
    'NetworkError',
    'ChunkLoadError',
    
    // Theme-related recoverable errors
    /Theme.*transition.*failed/i,
    /CSS.*animation.*interrupted/i,
  ],
  
  // URLs to ignore
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
  
  // Integration configurations
  integrations: [
    // Enhanced error tracking
    {
      name: 'HttpClient',
      options: {
        breadcrumbsEnabled: true,
        requestBreadcrumbsEnabled: true,
        responseBreadcrumbsEnabled: true,
      },
    },
  ],
  
  // Custom tags for better organization
  initialScope: {
    tags: {
      component: 'portfolio',
      feature: 'theme-system',
    },
    contexts: {
      app: {
        app_name: 'Portfolio Website',
        app_version: process.env.npm_package_version || 'unknown',
      },
    },
  },
};

// Environment-specific configurations
if (process.env.NODE_ENV === 'production') {
  // Production-specific settings
  sentryConfig.normalizeDepth = 6;
  sentryConfig.maxBreadcrumbs = 50;
  
  // Add user context for authenticated users (if applicable)
  sentryConfig.beforeSend = (event, hint) => {
    // Add user ID if available (theme preferences might be user-specific)
    if (typeof window !== 'undefined' && window.localStorage) {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        event.user = { id: userId };
      }
    }
    
    return sentryConfig.beforeSend(event, hint);
  };
} else {
  // Development-specific settings
  sentryConfig.debug = true;
  sentryConfig.normalizeDepth = 10;
  sentryConfig.maxBreadcrumbs = 100;
}

// Theme-specific error tracking helpers
const themeErrorTracking = {
  // Track theme-related errors with additional context
  trackThemeError: (error, context = {}) => {
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.withScope((scope) => {
        scope.setTag('error_type', 'theme_system');
        scope.setContext('theme_error', {
          ...context,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        });
        window.Sentry.captureException(error);
      });
    }
  },
  
  // Track performance metrics for theme transitions
  trackThemePerformance: (transitionType, duration, success = true) => {
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.addBreadcrumb({
        message: `Theme transition: ${transitionType}`,
        category: 'theme',
        data: {
          duration,
          success,
          timestamp: Date.now(),
        },
        level: success ? 'info' : 'warning',
      });
      
      // Send custom metric
      window.Sentry.metrics.increment('theme.transition.count', 1, {
        tags: {
          type: transitionType,
          success: success.toString(),
        },
      });
      
      window.Sentry.metrics.distribution('theme.transition.duration', duration, {
        tags: {
          type: transitionType,
        },
        unit: 'millisecond',
      });
    }
  },
  
  // Track theme usage analytics
  trackThemeUsage: (theme, source = 'manual') => {
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.addBreadcrumb({
        message: `Theme changed to: ${theme}`,
        category: 'user_action',
        data: {
          theme,
          source, // 'manual', 'system', 'auto'
          timestamp: Date.now(),
        },
        level: 'info',
      });
      
      window.Sentry.metrics.increment('theme.usage.count', 1, {
        tags: {
          theme,
          source,
        },
      });
    }
  },
};

module.exports = {
  sentryConfig,
  sentryWebpackPluginOptions,
  themeErrorTracking,
};