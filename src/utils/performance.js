/**
 * Throttles a function to execute at most once per specified delay
 * @param {Function} func - The function to throttle
 * @param {number} delay - The throttle delay in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;

  return function (...args) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

/**
 * Debounces a function to execute only after a delay period of inactivity
 * @param {Function} func - The function to debounce
 * @param {number} delay - The debounce delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Creates a memoized selector function to prevent unnecessary re-renders
 * @param {Function} selector - The selector function
 * @param {Function} equalityCheck - Custom equality check function
 * @returns {Function} - The memoized selector
 */
export const createMemoizedSelector = (selector, equalityCheck = (a, b) => a === b) => {
  let lastArgs = [];
  let lastResult;

  return (...args) => {
    const argsChanged =
      args.length !== lastArgs.length ||
      args.some((arg, index) => !equalityCheck(arg, lastArgs[index]));

    if (argsChanged) {
      lastResult = selector(...args);
      lastArgs = args;
    }

    return lastResult;
  };
};
