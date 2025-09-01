import { renderHook, act } from '@testing-library/react-hooks';
import { useThemeAPI } from '@hooks/useThemeAPI';
import { CachedThemeAPIService } from '@services/themeAPI';
import { mockFetch, waitForPromises } from '../test-utils';

// Mock the theme API service
jest.mock('@services/themeAPI', () => ({
  CachedThemeAPIService: {
    syncPreferences: jest.fn(),
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
    switchTheme: jest.fn(),
  },
}));

describe('useThemeAPI', () => {
  let mockNavigator;

  beforeEach(() => {
    // Mock navigator.onLine
    mockNavigator = {
      onLine: true,
    };
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    });

    // Mock window.addEventListener
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();
    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    });
    Object.defineProperty(window, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Online status monitoring', () => {
    it('initializes with online status', () => {
      const { result } = renderHook(() => useThemeAPI());

      expect(result.current.isOnline).toBe(true);
    });

    it('initializes with offline status', () => {
      mockNavigator.onLine = false;

      const { result } = renderHook(() => useThemeAPI());

      expect(result.current.isOnline).toBe(false);
    });

    it('sets up online/offline event listeners', () => {
      renderHook(() => useThemeAPI());

      expect(window.addEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      );
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount } = renderHook(() => useThemeAPI());

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'online',
        expect.any(Function)
      );
      expect(window.removeEventListener).toHaveBeenCalledWith(
        'offline',
        expect.any(Function)
      );
    });

    it('handles SSR environment gracefully', () => {
      const originalWindow = global.window;
      delete global.window;

      expect(() => {
        renderHook(() => useThemeAPI());
      }).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('syncPreferences', () => {
    it('returns offline error when not online', async () => {
      mockNavigator.onLine = false;

      const { result } = renderHook(() => useThemeAPI());
      
      const preferences = { theme: 'dark', autoSwitch: false };
      let syncResult;

      await act(async () => {
        syncResult = await result.current.syncPreferences(preferences);
      });

      expect(syncResult).toEqual({
        success: false,
        error: 'Offline - preferences saved locally',
        data: preferences,
        source: 'local',
      });
    });

    it('successfully syncs preferences when online', async () => {
      const mockResponse = {
        success: true,
        data: { theme: 'dark', autoSwitch: true },
      };

      CachedThemeAPIService.syncPreferences.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useThemeAPI());

      const preferences = { theme: 'dark', autoSwitch: false };
      let syncResult;

      await act(async () => {
        syncResult = await result.current.syncPreferences(preferences);
      });

      expect(CachedThemeAPIService.syncPreferences).toHaveBeenCalledWith(preferences);
      expect(syncResult).toEqual(mockResponse);
      expect(result.current.syncStatus).toBe('idle');
      expect(result.current.lastSyncTime).toBeDefined();
    });

    it('handles sync errors and retries', async () => {
      const mockError = new Error('Network error');
      CachedThemeAPIService.syncPreferences
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValue({
          success: true,
          data: { theme: 'dark' },
        });

      const { result } = renderHook(() => useThemeAPI());

      const preferences = { theme: 'dark' };
      let syncResult;

      await act(async () => {
        syncResult = await result.current.syncPreferences(preferences);
        // Wait for retry attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(result.current.syncStatus).toBe('error');
      expect(syncResult.success).toBe(false);
    });

    it('sets sync status during operation', async () => {
      CachedThemeAPIService.syncPreferences.mockImplementation(
        () => new Promise(resolve => {
          setTimeout(() => resolve({ success: true, data: {} }), 100);
        })
      );

      const { result } = renderHook(() => useThemeAPI());

      act(() => {
        result.current.syncPreferences({ theme: 'dark' });
      });

      expect(result.current.syncStatus).toBe('syncing');

      await act(async () => {
        await waitForPromises();
      });
    });

    it('implements exponential backoff for retries', async () => {
      jest.useFakeTimers();

      const mockError = new Error('Network error');
      CachedThemeAPIService.syncPreferences.mockRejectedValue(mockError);

      const { result } = renderHook(() => useThemeAPI());

      act(() => {
        result.current.syncPreferences({ theme: 'dark' });
      });

      // First retry after 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(CachedThemeAPIService.syncPreferences).toHaveBeenCalledTimes(2);

      // Second retry after 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(CachedThemeAPIService.syncPreferences).toHaveBeenCalledTimes(3);

      jest.useRealTimers();
    });
  });

  describe('getServerPreferences', () => {
    it('returns offline error when not online', async () => {
      mockNavigator.onLine = false;

      const { result } = renderHook(() => useThemeAPI());

      let preferencesResult;

      await act(async () => {
        preferencesResult = await result.current.getServerPreferences();
      });

      expect(preferencesResult).toEqual({
        success: false,
        error: 'Offline',
        fallback: true,
      });
    });

    it('fetches preferences when online', async () => {
      const mockResponse = {
        success: true,
        data: { theme: 'light', autoSwitch: true },
      };

      CachedThemeAPIService.getPreferences.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useThemeAPI());

      let preferencesResult;

      await act(async () => {
        preferencesResult = await result.current.getServerPreferences();
      });

      expect(CachedThemeAPIService.getPreferences).toHaveBeenCalledWith(false);
      expect(preferencesResult).toEqual(mockResponse);
    });

    it('forces refresh when requested', async () => {
      const mockResponse = { success: true, data: {} };
      CachedThemeAPIService.getPreferences.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useThemeAPI());

      await act(async () => {
        await result.current.getServerPreferences(true);
      });

      expect(CachedThemeAPIService.getPreferences).toHaveBeenCalledWith(true);
    });

    it('handles API errors gracefully', async () => {
      const mockError = new Error('API error');
      CachedThemeAPIService.getPreferences.mockRejectedValue(mockError);

      const { result } = renderHook(() => useThemeAPI());

      let preferencesResult;

      await act(async () => {
        preferencesResult = await result.current.getServerPreferences();
      });

      expect(preferencesResult).toEqual({
        success: false,
        error: 'API error',
        fallback: true,
      });
    });
  });

  describe('updateServerPreferences', () => {
    it('returns offline error when not online', async () => {
      mockNavigator.onLine = false;

      const { result } = renderHook(() => useThemeAPI());

      const preferences = { theme: 'dark' };
      let updateResult;

      await act(async () => {
        updateResult = await result.current.updateServerPreferences(preferences);
      });

      expect(updateResult).toEqual({
        success: false,
        error: 'Offline - preferences saved locally',
        fallback: true,
      });
    });

    it('updates preferences when online', async () => {
      const mockResponse = { success: true, data: {} };
      CachedThemeAPIService.updatePreferences.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useThemeAPI());

      const preferences = { theme: 'dark' };
      let updateResult;

      await act(async () => {
        updateResult = await result.current.updateServerPreferences(preferences);
      });

      expect(CachedThemeAPIService.updatePreferences).toHaveBeenCalledWith(preferences);
      expect(updateResult).toEqual(mockResponse);
      expect(result.current.lastSyncTime).toBeDefined();
    });

    it('handles update errors gracefully', async () => {
      const mockError = new Error('Update failed');
      CachedThemeAPIService.updatePreferences.mockRejectedValue(mockError);

      const { result } = renderHook(() => useThemeAPI());

      let updateResult;

      await act(async () => {
        updateResult = await result.current.updateServerPreferences({ theme: 'light' });
      });

      expect(updateResult).toEqual({
        success: false,
        error: 'Update failed',
        fallback: true,
      });
    });
  });

  describe('switchServerTheme', () => {
    it('returns offline error when not online', async () => {
      mockNavigator.onLine = false;

      const { result } = renderHook(() => useThemeAPI());

      let switchResult;

      await act(async () => {
        switchResult = await result.current.switchServerTheme('light');
      });

      expect(switchResult).toEqual({
        success: false,
        error: 'Offline - theme switched locally',
        fallback: true,
      });
    });

    it('switches theme when online', async () => {
      const mockResponse = { success: true, data: { theme: 'light' } };
      CachedThemeAPIService.switchTheme.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useThemeAPI());

      let switchResult;

      await act(async () => {
        switchResult = await result.current.switchServerTheme('light');
      });

      expect(CachedThemeAPIService.switchTheme).toHaveBeenCalledWith('light');
      expect(switchResult).toEqual(mockResponse);
    });

    it('handles switch errors gracefully', async () => {
      const mockError = new Error('Switch failed');
      CachedThemeAPIService.switchTheme.mockRejectedValue(mockError);

      const { result } = renderHook(() => useThemeAPI());

      let switchResult;

      await act(async () => {
        switchResult = await result.current.switchServerTheme('dark');
      });

      expect(switchResult).toEqual({
        success: false,
        error: 'Switch failed',
        fallback: true,
      });
    });
  });

  describe('Timeout and cleanup', () => {
    it('clears retry timeout on unmount', () => {
      jest.useFakeTimers();

      const mockError = new Error('Network error');
      CachedThemeAPIService.syncPreferences.mockRejectedValue(mockError);

      const { result, unmount } = renderHook(() => useThemeAPI());

      act(() => {
        result.current.syncPreferences({ theme: 'dark' });
      });

      // Start the retry timeout
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Unmount should clear the timeout
      unmount();

      // Advance past the retry time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not have made additional calls after unmount
      expect(CachedThemeAPIService.syncPreferences).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });
});