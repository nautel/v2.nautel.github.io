import {
  ThemeAPIService,
  ThemeCacheManager,
  CachedThemeAPIService,
} from '@services/themeAPI';
import { mockFetch, mockLocalStorage, waitForPromises } from '../test-utils';

describe('ThemeAPIService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getPreferences', () => {
    it('successfully fetches theme preferences', async () => {
      const mockResponse = {
        theme: 'dark',
        autoSwitch: true,
        reducedMotion: false,
        highContrast: false,
      };

      mockFetch(mockResponse, { ok: true, status: 200 });

      const result = await ThemeAPIService.getPreferences();

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/themes/preferences', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('handles API errors gracefully', async () => {
      mockFetch({}, { ok: false, status: 500, statusText: 'Internal Server Error' });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await ThemeAPIService.getPreferences();

      expect(result).toEqual({
        success: false,
        error: 'HTTP 500: Internal Server Error',
        fallback: true,
      });

      consoleSpy.mockRestore();
    });

    it('handles network errors gracefully', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await ThemeAPIService.getPreferences();

      expect(result).toEqual({
        success: false,
        error: 'Network error',
        fallback: true,
      });

      consoleSpy.mockRestore();
    });

    it('handles non-JSON responses', async () => {
      const mockResponse = 'Plain text response';
      
      global.fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'Content-Type': 'text/plain' }),
        text: () => Promise.resolve(mockResponse),
      });

      const result = await ThemeAPIService.getPreferences();

      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });
  });

  describe('updatePreferences', () => {
    it('successfully updates theme preferences', async () => {
      const preferences = {
        theme: 'light',
        autoSwitch: false,
        reducedMotion: true,
      };

      const mockResponse = { success: true, updated: preferences };
      mockFetch(mockResponse, { ok: true, status: 200 });

      const result = await ThemeAPIService.updatePreferences(preferences);

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/themes/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('handles update errors gracefully', async () => {
      const preferences = { theme: 'dark' };
      mockFetch({}, { ok: false, status: 400, statusText: 'Bad Request' });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await ThemeAPIService.updatePreferences(preferences);

      expect(result).toEqual({
        success: false,
        error: 'HTTP 400: Bad Request',
        fallback: true,
      });

      consoleSpy.mockRestore();
    });
  });

  describe('getAvailableThemes', () => {
    it('successfully fetches available themes', async () => {
      const mockResponse = {
        themes: ['light', 'dark', 'auto'],
        default: 'dark',
      };

      mockFetch(mockResponse, { ok: true, status: 200 });

      const result = await ThemeAPIService.getAvailableThemes();

      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('provides fallback themes on error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await ThemeAPIService.getAvailableThemes();

      expect(result).toEqual({
        success: false,
        error: 'Network error',
        fallback: {
          themes: ['light', 'dark'],
          default: 'dark',
        },
      });

      consoleSpy.mockRestore();
    });
  });

  describe('switchTheme', () => {
    it('successfully switches theme', async () => {
      const mockResponse = {
        theme: 'light',
        switched: true,
        timestamp: '2023-01-01T00:00:00Z',
      };

      mockFetch(mockResponse, { ok: true, status: 200 });

      const result = await ThemeAPIService.switchTheme('light');

      expect(global.fetch).toHaveBeenCalledWith('/api/v1/themes/switch', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: 'light' }),
      });

      expect(result).toEqual({
        success: true,
        data: mockResponse,
      });
    });

    it('handles switch errors gracefully', async () => {
      mockFetch({}, { ok: false, status: 422, statusText: 'Unprocessable Entity' });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await ThemeAPIService.switchTheme('invalid');

      expect(result).toEqual({
        success: false,
        error: 'HTTP 422: Unprocessable Entity',
        fallback: true,
      });

      consoleSpy.mockRestore();
    });
  });

  describe('syncPreferences', () => {
    it('syncs preferences with server when server has data', async () => {
      const localPreferences = { theme: 'dark', autoSwitch: false };
      const serverPreferences = { theme: 'light', autoSwitch: true };

      // Mock successful get preferences
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: () => Promise.resolve(serverPreferences),
        })
        // Mock successful update preferences
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: () => Promise.resolve({ success: true }),
        });

      const result = await ThemeAPIService.syncPreferences(localPreferences);

      expect(result.success).toBe(true);
      expect(result.source).toBe('server');
      expect(result.data).toMatchObject({
        ...localPreferences,
        ...serverPreferences,
        lastSynced: expect.any(String),
      });
    });

    it('uses local preferences when server is unavailable', async () => {
      const localPreferences = { theme: 'dark', autoSwitch: false };

      global.fetch.mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await ThemeAPIService.syncPreferences(localPreferences);

      expect(result.success).toBe(true);
      expect(result.source).toBe('local');
      expect(result.fallback).toBe(true);
      expect(result.data).toEqual(localPreferences);

      consoleSpy.mockRestore();
    });

    it('handles sync errors gracefully', async () => {
      const localPreferences = { theme: 'dark' };

      // Mock get preferences to succeed but update to fail
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          json: () => Promise.resolve({ theme: 'light' }),
        })
        .mockRejectedValueOnce(new Error('Update failed'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await ThemeAPIService.syncPreferences(localPreferences);

      expect(result.success).toBe(false);
      expect(result.source).toBe('local');
      expect(result.fallback).toBe(true);

      consoleSpy.mockRestore();
    });
  });
});

describe('ThemeCacheManager', () => {
  let mockLocalStorageInstance;

  beforeEach(() => {
    mockLocalStorageInstance = mockLocalStorage();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('get', () => {
    it('returns cached data when not expired', () => {
      const testData = { theme: 'dark', autoSwitch: true };
      const cachedData = {
        data: testData,
        timestamp: Date.now() - 60000, // 1 minute ago
      };

      mockLocalStorageInstance.getItem.mockReturnValue(JSON.stringify(cachedData));

      const result = ThemeCacheManager.get('test-key');

      expect(result).toEqual(testData);
      expect(mockLocalStorageInstance.getItem).toHaveBeenCalledWith('test-key');
    });

    it('returns null for expired data', () => {
      const testData = { theme: 'dark' };
      const cachedData = {
        data: testData,
        timestamp: Date.now() - (6 * 60 * 1000), // 6 minutes ago (expired)
      };

      mockLocalStorageInstance.getItem.mockReturnValue(JSON.stringify(cachedData));

      const result = ThemeCacheManager.get('test-key');

      expect(result).toBeNull();
      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('returns null when no cached data exists', () => {
      mockLocalStorageInstance.getItem.mockReturnValue(null);

      const result = ThemeCacheManager.get('test-key');

      expect(result).toBeNull();
    });

    it('handles invalid JSON gracefully', () => {
      mockLocalStorageInstance.getItem.mockReturnValue('invalid-json');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = ThemeCacheManager.get('test-key');

      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('handles localStorage errors gracefully', () => {
      mockLocalStorageInstance.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = ThemeCacheManager.get('test-key');

      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('returns null in SSR environment', () => {
      const originalWindow = global.window;
      delete global.window;

      const result = ThemeCacheManager.get('test-key');

      expect(result).toBeNull();

      global.window = originalWindow;
    });
  });

  describe('set', () => {
    it('caches data with timestamp', () => {
      const testData = { theme: 'light' };

      ThemeCacheManager.set('test-key', testData);

      const expectedCached = {
        data: testData,
        timestamp: Date.now(),
      };

      expect(mockLocalStorageInstance.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(expectedCached)
      );
    });

    it('handles localStorage errors gracefully', () => {
      mockLocalStorageInstance.setItem.mockImplementation(() => {
        throw new Error('localStorage full');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        ThemeCacheManager.set('test-key', { theme: 'dark' });
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('does nothing in SSR environment', () => {
      const originalWindow = global.window;
      delete global.window;

      expect(() => {
        ThemeCacheManager.set('test-key', { theme: 'dark' });
      }).not.toThrow();

      expect(mockLocalStorageInstance.setItem).not.toHaveBeenCalled();

      global.window = originalWindow;
    });
  });

  describe('remove', () => {
    it('removes cached data', () => {
      ThemeCacheManager.remove('test-key');

      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('handles localStorage errors gracefully', () => {
      mockLocalStorageInstance.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        ThemeCacheManager.remove('test-key');
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('clearAll', () => {
    it('removes all cached theme data', () => {
      ThemeCacheManager.clearAll();

      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith(
        ThemeCacheManager.CACHE_KEYS.PREFERENCES
      );
      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith(
        ThemeCacheManager.CACHE_KEYS.AVAILABLE_THEMES
      );
      expect(mockLocalStorageInstance.removeItem).toHaveBeenCalledWith(
        ThemeCacheManager.CACHE_KEYS.LAST_SYNC
      );
    });
  });
});

describe('CachedThemeAPIService', () => {
  let mockLocalStorageInstance;

  beforeEach(() => {
    mockLocalStorageInstance = mockLocalStorage();
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getPreferences with caching', () => {
    it('returns cached preferences when available', async () => {
      const cachedPreferences = { theme: 'dark', autoSwitch: true };

      // Mock cache hit
      jest.spyOn(ThemeCacheManager, 'get').mockReturnValue(cachedPreferences);

      const result = await CachedThemeAPIService.getPreferences();

      expect(result).toEqual({
        success: true,
        data: cachedPreferences,
        source: 'cache',
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('fetches from server when cache is empty', async () => {
      const serverPreferences = { theme: 'light', autoSwitch: false };

      // Mock cache miss
      jest.spyOn(ThemeCacheManager, 'get').mockReturnValue(null);
      jest.spyOn(ThemeCacheManager, 'set').mockImplementation();

      mockFetch(serverPreferences, { ok: true, status: 200 });

      const result = await CachedThemeAPIService.getPreferences();

      expect(result).toEqual({
        success: true,
        data: serverPreferences,
      });

      expect(ThemeCacheManager.set).toHaveBeenCalledWith(
        ThemeCacheManager.CACHE_KEYS.PREFERENCES,
        serverPreferences
      );
    });

    it('forces refresh when requested', async () => {
      const serverPreferences = { theme: 'light', autoSwitch: false };

      // Mock cache hit (should be ignored)
      jest.spyOn(ThemeCacheManager, 'get').mockReturnValue({ theme: 'dark' });
      jest.spyOn(ThemeCacheManager, 'set').mockImplementation();

      mockFetch(serverPreferences, { ok: true, status: 200 });

      const result = await CachedThemeAPIService.getPreferences(true);

      expect(result).toEqual({
        success: true,
        data: serverPreferences,
      });

      expect(global.fetch).toHaveBeenCalled();
      expect(ThemeCacheManager.set).toHaveBeenCalled();
    });

    it('does not cache on server error', async () => {
      jest.spyOn(ThemeCacheManager, 'get').mockReturnValue(null);
      jest.spyOn(ThemeCacheManager, 'set').mockImplementation();

      mockFetch({}, { ok: false, status: 500, statusText: 'Server Error' });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await CachedThemeAPIService.getPreferences();

      expect(result.success).toBe(false);
      expect(ThemeCacheManager.set).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('updatePreferences with cache invalidation', () => {
    it('updates cache when preferences are successfully updated', async () => {
      const preferences = { theme: 'light', autoSwitch: true };
      const serverResponse = { success: true };

      jest.spyOn(ThemeCacheManager, 'set').mockImplementation();
      mockFetch(serverResponse, { ok: true, status: 200 });

      const result = await CachedThemeAPIService.updatePreferences(preferences);

      expect(result).toEqual({
        success: true,
        data: serverResponse,
      });

      expect(ThemeCacheManager.set).toHaveBeenCalledWith(
        ThemeCacheManager.CACHE_KEYS.PREFERENCES,
        preferences
      );
    });

    it('does not update cache on server error', async () => {
      const preferences = { theme: 'light' };

      jest.spyOn(ThemeCacheManager, 'set').mockImplementation();
      mockFetch({}, { ok: false, status: 400, statusText: 'Bad Request' });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await CachedThemeAPIService.updatePreferences(preferences);

      expect(result.success).toBe(false);
      expect(ThemeCacheManager.set).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getAvailableThemes with caching', () => {
    it('returns cached themes when available', async () => {
      const cachedThemes = { themes: ['light', 'dark'], default: 'dark' };

      jest.spyOn(ThemeCacheManager, 'get').mockReturnValue(cachedThemes);

      const result = await CachedThemeAPIService.getAvailableThemes();

      expect(result).toEqual({
        success: true,
        data: cachedThemes,
        source: 'cache',
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('fetches from server and caches when cache is empty', async () => {
      const serverThemes = { themes: ['light', 'dark', 'auto'], default: 'auto' };

      jest.spyOn(ThemeCacheManager, 'get').mockReturnValue(null);
      jest.spyOn(ThemeCacheManager, 'set').mockImplementation();

      mockFetch(serverThemes, { ok: true, status: 200 });

      const result = await CachedThemeAPIService.getAvailableThemes();

      expect(result).toEqual({
        success: true,
        data: serverThemes,
      });

      expect(ThemeCacheManager.set).toHaveBeenCalledWith(
        ThemeCacheManager.CACHE_KEYS.AVAILABLE_THEMES,
        serverThemes
      );
    });
  });

  describe('Cache integration', () => {
    it('properly manages cache lifecycle', async () => {
      const preferences = { theme: 'dark' };

      jest.spyOn(ThemeCacheManager, 'get').mockReturnValue(null);
      jest.spyOn(ThemeCacheManager, 'set').mockImplementation();

      mockFetch(preferences, { ok: true, status: 200 });

      // First call should fetch from server
      await CachedThemeAPIService.getPreferences();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(ThemeCacheManager.set).toHaveBeenCalledTimes(1);

      // Mock cache hit for second call
      ThemeCacheManager.get.mockReturnValue(preferences);

      // Second call should use cache
      await CachedThemeAPIService.getPreferences();
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('handles cache manager errors gracefully', async () => {
      const preferences = { theme: 'dark' };

      jest.spyOn(ThemeCacheManager, 'get').mockImplementation(() => {
        throw new Error('Cache error');
      });
      jest.spyOn(ThemeCacheManager, 'set').mockImplementation(() => {
        throw new Error('Cache error');
      });

      mockFetch(preferences, { ok: true, status: 200 });

      const result = await CachedThemeAPIService.getPreferences();

      expect(result).toEqual({
        success: true,
        data: preferences,
      });
    });
  });
});