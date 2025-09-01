import { useState, useEffect } from 'react';

/**
 * Custom hook for system theme detection
 * Monitors system color scheme preference changes
 */
export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [supportsColorScheme, setSupportsColorScheme] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia && typeof window.matchMedia('(prefers-color-scheme: dark)').matches === 'boolean';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      setSupportsColorScheme(false);
      return;
    }

    setSupportsColorScheme(true);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    // Set initial theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return {
    systemTheme,
    supportsColorScheme,
  };
};

/**
 * Custom hook for accessibility preferences detection
 * Monitors reduced motion and high contrast preferences
 */
export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState(() => ({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    supportsReducedMotion: false,
    supportsHighContrast: false,
  }));

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: reducedMotionQuery.matches,
        prefersHighContrast: highContrastQuery.matches,
        supportsReducedMotion: typeof reducedMotionQuery.matches === 'boolean',
        supportsHighContrast: typeof highContrastQuery.matches === 'boolean',
      });
    };

    // Set initial values
    updatePreferences();

    const handleReducedMotionChange = () => updatePreferences();
    const handleHighContrastChange = () => updatePreferences();

    // Listen for changes
    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
      highContrastQuery.addEventListener('change', handleHighContrastChange);
    } else {
      // Fallback for older browsers
      reducedMotionQuery.addListener(handleReducedMotionChange);
      highContrastQuery.addListener(handleHighContrastChange);
    }

    return () => {
      if (reducedMotionQuery.removeEventListener) {
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
        highContrastQuery.removeEventListener('change', handleHighContrastChange);
      } else {
        // Fallback for older browsers
        reducedMotionQuery.removeListener(handleReducedMotionChange);
        highContrastQuery.removeListener(handleHighContrastChange);
      }
    };
  }, []);

  return preferences;
};

/**
 * Custom hook for theme persistence
 * Handles localStorage operations for theme preferences
 */
export const useThemePersistence = (storageKey = 'preferred-theme') => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydration check for SSR compatibility
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getStoredTheme = () => {
    if (typeof window === 'undefined' || !isHydrated) return null;
    
    try {
      return localStorage.getItem(storageKey);
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      return null;
    }
  };

  const setStoredTheme = (theme) => {
    if (typeof window === 'undefined' || !isHydrated) return false;
    
    try {
      localStorage.setItem(storageKey, theme);
      return true;
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
      return false;
    }
  };

  const removeStoredTheme = () => {
    if (typeof window === 'undefined' || !isHydrated) return false;
    
    try {
      localStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.warn('Failed to remove theme from localStorage:', error);
      return false;
    }
  };

  const getStoredPreferences = () => {
    if (typeof window === 'undefined' || !isHydrated) return null;
    
    try {
      const stored = localStorage.getItem(`${storageKey}-preferences`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to read theme preferences from localStorage:', error);
      return null;
    }
  };

  const setStoredPreferences = (preferences) => {
    if (typeof window === 'undefined' || !isHydrated) return false;
    
    try {
      localStorage.setItem(`${storageKey}-preferences`, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.warn('Failed to save theme preferences to localStorage:', error);
      return false;
    }
  };

  return {
    isHydrated,
    getStoredTheme,
    setStoredTheme,
    removeStoredTheme,
    getStoredPreferences,
    setStoredPreferences,
  };
};