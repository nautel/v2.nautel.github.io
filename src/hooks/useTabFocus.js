import { useEffect } from 'react';

/**
 * Custom hook for managing tab focus behavior
 * @param {number} tabFocus - Current focused tab index
 * @param {Function} setTabFocus - Function to update focused tab
 * @param {Object} tabs - Ref object containing tab elements
 */
const useTabFocus = (tabFocus, setTabFocus, tabs) => {
  useEffect(() => {
    const focusTab = () => {
      if (tabs.current[tabFocus]) {
        tabs.current[tabFocus].focus();
        return;
      }

      if (tabFocus >= tabs.current.length) {
        setTabFocus(0);
      }

      if (tabFocus < 0) {
        setTabFocus(tabs.current.length - 1);
      }
    };

    focusTab();
  }, [tabFocus, setTabFocus, tabs]);
};

export default useTabFocus;
