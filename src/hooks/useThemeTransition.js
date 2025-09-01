import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@contexts/ThemeContext';

/**
 * Custom hook for smooth theme transitions
 * Provides transition state and controls for theme switching animations
 */
export const useThemeTransition = (options = {}) => {
  const {
    duration = 250,
    easing = 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    enableViewTransition = true,
  } = options;

  const { currentTheme, prefersReducedMotion } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState('idle'); // idle, preparing, transitioning, completing
  const transitionTimeoutRef = useRef(null);
  const previousThemeRef = useRef(currentTheme);

  // Check if browser supports View Transitions API
  const supportsViewTransition = useCallback(() => {
    return enableViewTransition && 
           typeof document !== 'undefined' && 
           'startViewTransition' in document;
  }, [enableViewTransition]);

  // Apply CSS transition properties
  const applyTransitionStyles = useCallback(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const transitionDuration = prefersReducedMotion ? '0s' : `${duration}ms`;
    
    root.style.setProperty('--theme-transition-duration', transitionDuration);
    root.style.setProperty('--theme-transition-easing', easing);
    
    // Add transition class for CSS-based transitions
    root.classList.add('theme-transitioning');
  }, [duration, easing, prefersReducedMotion]);

  // Remove transition styles
  const removeTransitionStyles = useCallback(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('theme-transitioning');
    
    // Clean up transition properties after delay
    setTimeout(() => {
      root.style.removeProperty('--theme-transition-duration');
      root.style.removeProperty('--theme-transition-easing');
    }, 50);
  }, []);

  // Execute theme transition with View Transitions API
  const executeViewTransition = useCallback((transitionFn) => {
    if (!supportsViewTransition()) {
      transitionFn();
      return Promise.resolve();
    }

    return document.startViewTransition(() => {
      transitionFn();
    }).finished.catch((error) => {
      console.warn('View transition failed:', error);
    });
  }, [supportsViewTransition]);

  // Main transition handler
  const executeTransition = useCallback(async (transitionFn) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setTransitionPhase('preparing');

    try {
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Apply transition styles
      applyTransitionStyles();
      
      setTransitionPhase('transitioning');

      if (supportsViewTransition()) {
        // Use View Transitions API
        await executeViewTransition(transitionFn);
      } else {
        // Fallback to manual transition
        transitionFn();
        
        // Wait for transition duration if not reduced motion
        if (!prefersReducedMotion) {
          await new Promise(resolve => {
            transitionTimeoutRef.current = setTimeout(resolve, duration);
          });
        }
      }

      setTransitionPhase('completing');
      
      // Clean up transition styles
      setTimeout(() => {
        removeTransitionStyles();
        setTransitionPhase('idle');
        setIsTransitioning(false);
      }, 50);

    } catch (error) {
      console.error('Theme transition failed:', error);
      setTransitionPhase('idle');
      setIsTransitioning(false);
      removeTransitionStyles();
    }
  }, [
    isTransitioning,
    applyTransitionStyles,
    removeTransitionStyles,
    executeViewTransition,
    supportsViewTransition,
    prefersReducedMotion,
    duration,
  ]);

  // Detect theme changes and trigger transitions
  useEffect(() => {
    if (currentTheme !== previousThemeRef.current) {
      previousThemeRef.current = currentTheme;
      
      // Only trigger transition if it's an actual theme change (not initial load)
      if (previousThemeRef.current !== undefined) {
        executeTransition(() => {
          // The actual theme change is handled by the ThemeProvider
          // This is just for transition coordination
        });
      }
    }
  }, [currentTheme, executeTransition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      removeTransitionStyles();
    };
  }, [removeTransitionStyles]);

  return {
    isTransitioning,
    transitionPhase,
    executeTransition,
    supportsViewTransition: supportsViewTransition(),
  };
};

/**
 * Custom hook for theme-aware animations
 * Provides utilities for creating theme-sensitive animations
 */
export const useThemeAnimation = () => {
  const { theme, prefersReducedMotion } = useTheme();
  const [animationsEnabled, setAnimationsEnabled] = useState(!prefersReducedMotion);

  useEffect(() => {
    setAnimationsEnabled(!prefersReducedMotion);
  }, [prefersReducedMotion]);

  // Get animation duration based on user preferences
  const getAnimationDuration = useCallback((baseDuration) => {
    if (!animationsEnabled || prefersReducedMotion) return 0;
    return typeof baseDuration === 'string' ? baseDuration : `${baseDuration}ms`;
  }, [animationsEnabled, prefersReducedMotion]);

  // Get easing function
  const getEasing = useCallback(() => {
    return theme.animations.easing;
  }, [theme.animations.easing]);

  // Create animation styles object
  const createAnimationStyles = useCallback((animations) => {
    if (!animationsEnabled) {
      return {};
    }

    const styles = {};
    Object.entries(animations).forEach(([property, config]) => {
      if (typeof config === 'object') {
        const { duration, easing = getEasing(), delay = 0 } = config;
        styles[property] = {
          transition: `${property} ${getAnimationDuration(duration)} ${easing} ${delay}ms`,
        };
      } else {
        styles[property] = {
          transition: `${property} ${getAnimationDuration(config)} ${getEasing()}`,
        };
      }
    });

    return styles;
  }, [animationsEnabled, getAnimationDuration, getEasing]);

  return {
    animationsEnabled,
    getAnimationDuration,
    getEasing,
    createAnimationStyles,
    theme,
  };
};