// Theme API Service Layer
// Integrates with backend theme management endpoints

const API_BASE_URL = process.env.GATSBY_API_BASE_URL || '/api/v1';

// API Endpoints
const ENDPOINTS = {
  GET_PREFERENCES: `${API_BASE_URL}/themes/preferences`,
  UPDATE_PREFERENCES: `${API_BASE_URL}/themes/preferences`,
  GET_AVAILABLE_THEMES: `${API_BASE_URL}/themes/available`,
  SWITCH_THEME: `${API_BASE_URL}/themes/switch`,
};

// HTTP Client with error handling
class HTTPClient {
  static async request(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, mergedOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error(`API Request failed for ${url}:`, error);
      throw error;
    }
  }

  static async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  static async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async patch(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Theme API Service
export class ThemeAPIService {
  /**
   * Get user theme preferences
   * @returns {Promise<Object>} User theme preferences
   */
  static async getPreferences() {
    try {
      const preferences = await HTTPClient.get(ENDPOINTS.GET_PREFERENCES);
      return {
        success: true,
        data: preferences,
      };
    } catch (error) {
      console.warn('Failed to fetch theme preferences from server:', error);
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }

  /**
   * Update user theme preferences
   * @param {Object} preferences - Theme preferences to update
   * @param {string} preferences.theme - Theme name ('light' | 'dark')
   * @param {boolean} preferences.autoSwitch - Auto-switch based on system preference
   * @param {boolean} preferences.reducedMotion - Prefer reduced motion
   * @param {boolean} preferences.highContrast - Prefer high contrast
   * @returns {Promise<Object>} Update result
   */
  static async updatePreferences(preferences) {
    try {
      const result = await HTTPClient.put(ENDPOINTS.UPDATE_PREFERENCES, preferences);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.warn('Failed to update theme preferences on server:', error);
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }

  /**
   * Get available themes
   * @returns {Promise<Object>} Available themes
   */
  static async getAvailableThemes() {
    try {
      const themes = await HTTPClient.get(ENDPOINTS.GET_AVAILABLE_THEMES);
      return {
        success: true,
        data: themes,
      };
    } catch (error) {
      console.warn('Failed to fetch available themes from server:', error);
      return {
        success: false,
        error: error.message,
        fallback: {
          themes: ['light', 'dark'],
          default: 'dark',
        },
      };
    }
  }

  /**
   * Real-time theme switching
   * @param {string} theme - Theme to switch to
   * @returns {Promise<Object>} Switch result
   */
  static async switchTheme(theme) {
    try {
      const result = await HTTPClient.patch(ENDPOINTS.SWITCH_THEME, { theme });
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.warn('Failed to switch theme on server:', error);
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }

  /**
   * Sync theme preferences with server
   * @param {Object} localPreferences - Local theme preferences
   * @returns {Promise<Object>} Sync result
   */
  static async syncPreferences(localPreferences) {
    try {
      // First, try to get server preferences
      const serverResult = await this.getPreferences();
      
      if (serverResult.success) {
        // Server preferences exist, merge with local
        const mergedPreferences = {
          ...localPreferences,
          ...serverResult.data,
          lastSynced: new Date().toISOString(),
        };

        // Update server with merged preferences
        const updateResult = await this.updatePreferences(mergedPreferences);
        
        return {
          success: true,
          data: mergedPreferences,
          source: 'server',
        };
      } else {
        // Server unavailable, use local preferences
        return {
          success: true,
          data: localPreferences,
          source: 'local',
          fallback: true,
        };
      }
    } catch (error) {
      console.warn('Failed to sync theme preferences:', error);
      return {
        success: false,
        error: error.message,
        data: localPreferences,
        source: 'local',
        fallback: true,
      };
    }
  }
}

// Theme Cache Management
export class ThemeCacheManager {
  static CACHE_KEYS = {
    PREFERENCES: 'theme_preferences_cache',
    AVAILABLE_THEMES: 'available_themes_cache',
    LAST_SYNC: 'theme_last_sync',
  };

  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null if expired/not found
   */
  static get(key) {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp > this.CACHE_DURATION) {
        this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Failed to get cached theme data:', error);
      return null;
    }
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   */
  static set(key, data) {
    if (typeof window === 'undefined') return;

    try {
      const cached = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cached));
    } catch (error) {
      console.warn('Failed to cache theme data:', error);
    }
  }

  /**
   * Remove cached data
   * @param {string} key - Cache key
   */
  static remove(key) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cached theme data:', error);
    }
  }

  /**
   * Clear all theme cache
   */
  static clearAll() {
    if (typeof window === 'undefined') return;

    Object.values(this.CACHE_KEYS).forEach(key => {
      this.remove(key);
    });
  }
}

// Enhanced Theme API Service with caching
export class CachedThemeAPIService extends ThemeAPIService {
  /**
   * Get user theme preferences with caching
   * @param {boolean} forceRefresh - Force refresh from server
   * @returns {Promise<Object>} User theme preferences
   */
  static async getPreferences(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = ThemeCacheManager.get(ThemeCacheManager.CACHE_KEYS.PREFERENCES);
      if (cached) {
        return {
          success: true,
          data: cached,
          source: 'cache',
        };
      }
    }

    const result = await super.getPreferences();
    
    if (result.success) {
      ThemeCacheManager.set(ThemeCacheManager.CACHE_KEYS.PREFERENCES, result.data);
    }

    return result;
  }

  /**
   * Update user theme preferences with cache invalidation
   * @param {Object} preferences - Theme preferences to update
   * @returns {Promise<Object>} Update result
   */
  static async updatePreferences(preferences) {
    const result = await super.updatePreferences(preferences);
    
    if (result.success) {
      // Update cache with new preferences
      ThemeCacheManager.set(ThemeCacheManager.CACHE_KEYS.PREFERENCES, preferences);
    }

    return result;
  }

  /**
   * Get available themes with caching
   * @param {boolean} forceRefresh - Force refresh from server
   * @returns {Promise<Object>} Available themes
   */
  static async getAvailableThemes(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = ThemeCacheManager.get(ThemeCacheManager.CACHE_KEYS.AVAILABLE_THEMES);
      if (cached) {
        return {
          success: true,
          data: cached,
          source: 'cache',
        };
      }
    }

    const result = await super.getAvailableThemes();
    
    if (result.success) {
      ThemeCacheManager.set(ThemeCacheManager.CACHE_KEYS.AVAILABLE_THEMES, result.data);
    }

    return result;
  }
}

export default CachedThemeAPIService;