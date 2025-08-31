import { throttle, debounce, createMemoizedSelector } from '../performance';

describe('Performance Utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('throttle', () => {
    it('should call function immediately on first invocation', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('test');

      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should throttle subsequent calls', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('test1');
      throttledFn('test2');
      throttledFn('test3');

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test1');
    });

    it('should call function again after delay period', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('test1');

      jest.advanceTimersByTime(150);

      throttledFn('test2');

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenLastCalledWith('test2');
    });
  });

  describe('debounce', () => {
    it('should not call function immediately', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');

      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should call function after delay', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test');

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('test1');

      jest.advanceTimersByTime(50);

      debouncedFn('test2');

      jest.advanceTimersByTime(50);

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledWith('test2');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('createMemoizedSelector', () => {
    it('should return same result for same inputs', () => {
      const selector = jest.fn((x, y) => x + y);
      const memoizedSelector = createMemoizedSelector(selector);

      const result1 = memoizedSelector(1, 2);
      const result2 = memoizedSelector(1, 2);

      expect(result1).toBe(3);
      expect(result2).toBe(3);
      expect(selector).toHaveBeenCalledTimes(1);
    });

    it('should recalculate for different inputs', () => {
      const selector = jest.fn((x, y) => x + y);
      const memoizedSelector = createMemoizedSelector(selector);

      const result1 = memoizedSelector(1, 2);
      const result2 = memoizedSelector(2, 3);

      expect(result1).toBe(3);
      expect(result2).toBe(5);
      expect(selector).toHaveBeenCalledTimes(2);
    });

    it('should use custom equality check', () => {
      const selector = jest.fn(obj => obj.value);
      const memoizedSelector = createMemoizedSelector(selector, (a, b) => a.id === b.id);

      const obj1 = { id: 1, value: 'test' };
      const obj2 = { id: 1, value: 'different' };

      const result1 = memoizedSelector(obj1);
      const result2 = memoizedSelector(obj2);

      expect(result1).toBe('test');
      expect(result2).toBe('test'); // Should use cached result
      expect(selector).toHaveBeenCalledTimes(1);
    });
  });
});
