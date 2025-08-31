/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

export const onInitialClientRender = () => {
  // GitHub Pages SPA fix for F5/refresh
  if (typeof window !== 'undefined') {
    // Handle URL parameter-based redirect (from 404.html)
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get('p');

    if (redirectPath) {
      // Remove the query parameter and redirect to the clean path
      const cleanPath = decodeURIComponent(redirectPath);
      window.history.replaceState(null, null, cleanPath);
      // Remove from session storage to prevent loops
      window.sessionStorage.removeItem('spa-redirect-path');
      return;
    }

    // Handle session storage-based redirect (fallback)
    const storedPath = window.sessionStorage.getItem('spa-redirect-path');
    if (storedPath && storedPath !== window.location.pathname) {
      window.sessionStorage.removeItem('spa-redirect-path');
      window.history.replaceState(null, null, storedPath);
    }
  }
};
