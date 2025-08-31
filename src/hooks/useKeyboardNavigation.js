import { useCallback } from 'react';
import { KEY_CODES } from '@utils';

/**
 * Custom hook for handling keyboard navigation with arrow keys
 * @param {number} tabFocus - Current focused tab index
 * @param {Function} setTabFocus - Function to update focused tab
 * @returns {Function} - Keyboard event handler
 */
const useKeyboardNavigation = (tabFocus, setTabFocus) => {
  const handleKeyDown = useCallback(
    e => {
      switch (e.key) {
        case KEY_CODES.ARROW_UP:
        case KEY_CODES.ARROW_UP_IE11: {
          e.preventDefault();
          setTabFocus(tabFocus - 1);
          break;
        }

        case KEY_CODES.ARROW_DOWN:
        case KEY_CODES.ARROW_DOWN_IE11: {
          e.preventDefault();
          setTabFocus(tabFocus + 1);
          break;
        }

        default:
          break;
      }
    },
    [tabFocus, setTabFocus],
  );

  return handleKeyDown;
};

export default useKeyboardNavigation;
