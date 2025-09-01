import { useState, useEffect, useCallback, useRef } from 'react';
import { CachedThemeAPIService } from '@services/themeAPI';

/**
 * Custom hook for theme API interactions
 * Provides methods to sync theme preferences with backend
 */
export const useThemeAPI = () => {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const retryTimeoutRef = useRef(null);

  // Monitor online status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Sync preferences with server
  const syncPreferences = useCallback(async (localPreferences, retryCount = 0) => {
    if (!isOnline) {
      return {
        success: false,
        error: 'Offline - preferences saved locally',
        data: localPreferences,
        source: 'local',
      };
    }

    setSyncStatus('syncing');

    try {
      const result = await CachedThemeAPIService.syncPreferences(localPreferences);
      
      if (result.success) {
        setLastSyncTime(new Date());
        setSyncStatus('success');
        
        // Clear success status after 3 seconds
        setTimeout(() => {
          setSyncStatus('idle');
        }, 3000);
        
        return result;
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      console.warn('Theme sync failed:', error);
      setSyncStatus('error');

      // Retry logic for transient failures
      if (retryCount < 2) {
        retryTimeoutRef.current = setTimeout(() => {
          syncPreferences(localPreferences, retryCount + 1);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      } else {
        // Clear error status after 5 seconds
        setTimeout(() => {
          setSyncStatus('idle');
        }, 5000);
      }

      return {
        success: false,
        error: error.message,
        data: localPreferences,
        source: 'local',
      };
    }
  }, [isOnline]);

  // Get server preferences
  const getServerPreferences = useCallback(async (forceRefresh = false) => {
    if (!isOnline && !forceRefresh) {
      return {
        success: false,
        error: 'Offline',
        fallback: true,
      };
    }

    try {
      return await CachedThemeAPIService.getPreferences(forceRefresh);
    } catch (error) {
      console.warn('Failed to get server preferences:', error);
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }, [isOnline]);

  // Update server preferences
  const updateServerPreferences = useCallback(async (preferences) => {
    if (!isOnline) {
      return {
        success: false,
        error: 'Offline - preferences saved locally',
        fallback: true,
      };
    }

    try {
      const result = await CachedThemeAPIService.updatePreferences(preferences);
      
      if (result.success) {
        setLastSyncTime(new Date());
      }
      
      return result;
    } catch (error) {
      console.warn('Failed to update server preferences:', error);
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }, [isOnline]);

  // Switch theme on server
  const switchServerTheme = useCallback(async (theme) => {
    if (!isOnline) {
      return {
        success: false,
        error: 'Offline - theme switched locally',
        fallback: true,
      };
    }

    try {
      return await CachedThemeAPIService.switchTheme(theme);
    } catch (error) {
      console.warn('Failed to switch theme on server:', error);
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }, [isOnline]);

  return {
    isOnline,
    lastSyncTime,
    syncStatus,
    syncPreferences,
    getServerPreferences,
    updateServerPreferences,
    switchServerTheme,
  };
};