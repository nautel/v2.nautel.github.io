import React, { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { themeConfig, lightTheme, darkTheme } from '@styles/themes';

// Theme Context
const ThemeContext = createContext();

// Theme Actions
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_SYSTEM_THEME: 'SET_SYSTEM_THEME',
  SET_LOADING: 'SET_LOADING',
  SET_REDUCED_MOTION: 'SET_REDUCED_MOTION',
  SET_HIGH_CONTRAST: 'SET_HIGH_CONTRAST',
};

// Theme Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        currentTheme: action.payload,
        isLoading: false,
      };

    case THEME_ACTIONS.TOGGLE_THEME:
      const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        currentTheme: newTheme,
      };

    case THEME_ACTIONS.SET_SYSTEM_THEME:
      return {
        ...state,
        systemTheme: action.payload,
      };

    case THEME_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case THEME_ACTIONS.SET_REDUCED_MOTION:
      return {
        ...state,
        prefersReducedMotion: action.payload,
      };

    case THEME_ACTIONS.SET_HIGH_CONTRAST:
      return {
        ...state,
        prefersHighContrast: action.payload,
      };

    default:
      return state;
  }
};

// Initial State
const initialState = {
  currentTheme: themeConfig.default,
  systemTheme: 'dark',
  isLoading: true,
  prefersReducedMotion: false,
  prefersHighContrast: false,
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Get theme object based on current theme name
  const getThemeObject = (themeName) => {
    return themeName === 'light' ? lightTheme : darkTheme;
  };

  // Detect system theme preference
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      return mediaQuery.matches ? 'dark' : 'light';
    }
    return 'dark';
  };

  // Detect reduced motion preference
  const detectReducedMotion = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      return mediaQuery.matches;
    }
    return false;
  };

  // Detect high contrast preference
  const detectHighContrast = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-contrast: high)');
      return mediaQuery.matches;
    }
    return false;
  };

  // Load theme from localStorage
  const loadStoredTheme = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(themeConfig.storageKey);
      return stored || themeConfig.default;
    }
    return themeConfig.default;
  };

  // Save theme to localStorage
  const saveTheme = (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(themeConfig.storageKey, theme);
    }
  };

  // Apply CSS custom properties
  const applyCSSVariables = (theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const themeObj = getThemeObject(theme);
      
      // Apply all theme colors as CSS custom properties
      Object.entries(themeObj.colors).forEach(([category, colors]) => {
        if (typeof colors === 'object') {
          Object.entries(colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${category}-${key}`, value);
          });
        }
      });

      // Apply theme name for conditional styling
      root.setAttribute('data-theme', theme);
      
      // Apply accessibility preferences
      root.style.setProperty('--animation-duration', state.prefersReducedMotion ? '0s' : themeObj.animations.duration.normal);
    }
  };

  // Set theme
  const setTheme = (theme) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme });
    saveTheme(theme);
    applyCSSVariables(theme);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = state.currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Initialize theme system
  useEffect(() => {
    // Detect system preferences
    const systemTheme = detectSystemTheme();
    const reducedMotion = detectReducedMotion();
    const highContrast = detectHighContrast();

    dispatch({ type: THEME_ACTIONS.SET_SYSTEM_THEME, payload: systemTheme });
    dispatch({ type: THEME_ACTIONS.SET_REDUCED_MOTION, payload: reducedMotion });
    dispatch({ type: THEME_ACTIONS.SET_HIGH_CONTRAST, payload: highContrast });

    // Load stored theme or use system theme
    const storedTheme = loadStoredTheme();
    setTheme(storedTheme);

    // Set up media query listeners
    if (typeof window !== 'undefined' && window.matchMedia) {
      const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

      const handleColorSchemeChange = (e) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        dispatch({ type: THEME_ACTIONS.SET_SYSTEM_THEME, payload: newSystemTheme });
      };

      const handleReducedMotionChange = (e) => {
        dispatch({ type: THEME_ACTIONS.SET_REDUCED_MOTION, payload: e.matches });
      };

      const handleHighContrastChange = (e) => {
        dispatch({ type: THEME_ACTIONS.SET_HIGH_CONTRAST, payload: e.matches });
      };

      colorSchemeQuery.addListener(handleColorSchemeChange);
      reducedMotionQuery.addListener(handleReducedMotionChange);
      highContrastQuery.addListener(handleHighContrastChange);

      // Cleanup listeners
      return () => {
        colorSchemeQuery.removeListener(handleColorSchemeChange);
        reducedMotionQuery.removeListener(handleReducedMotionChange);
        highContrastQuery.removeListener(handleHighContrastChange);
      };
    }
  }, []);

  // Apply CSS variables when theme changes
  useEffect(() => {
    applyCSSVariables(state.currentTheme);
  }, [state.currentTheme, state.prefersReducedMotion]);

  // Context value
  const value = {
    ...state,
    theme: getThemeObject(state.currentTheme),
    setTheme,
    toggleTheme,
    isLight: state.currentTheme === 'light',
    isDark: state.currentTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;