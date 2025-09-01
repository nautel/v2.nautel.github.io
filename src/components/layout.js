import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Head, Loader, Nav, Social, Email, Footer } from '@components';
import { GlobalStyle, theme as defaultTheme } from '@styles';
import { ThemeProvider, useTheme } from '@contexts/ThemeContext';
import { useThemeTransition } from '@hooks/useThemeTransition';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.backgrounds.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: ${({ theme, $enableTransitions }) => 
    $enableTransitions ? theme.animations.transition : 'none'
  };
`;

// Loading overlay for theme transitions
const ThemeTransitionOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.colors.backgrounds.primary};
  z-index: 9999;
  opacity: ${({ $isVisible }) => $isVisible ? 0.8 : 0};
  visibility: ${({ $isVisible }) => $isVisible ? 'visible' : 'hidden'};
  transition: opacity 0.15s ease-in-out, visibility 0.15s ease-in-out;
  pointer-events: none;
`;

// Inner Layout Component (needs access to theme context)
const LayoutInner = ({ children, location }) => {
  const isHome = location.pathname === '/';
  const [isLoading, setIsLoading] = useState(isHome);
  const { theme, isLoading: themeLoading, prefersReducedMotion } = useTheme();
  const { isTransitioning } = useThemeTransition();

  // Sets target="_blank" rel="noopener noreferrer" on external links
  const handleExternalLinks = () => {
    const allLinks = Array.from(document.querySelectorAll('a'));
    if (allLinks.length > 0) {
      allLinks.forEach(link => {
        if (link.host !== window.location.host) {
          link.setAttribute('rel', 'noopener noreferrer');
          link.setAttribute('target', '_blank');
        }
      });
    }
  };

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (location.hash) {
      const id = location.hash.substring(1); // location.hash without the '#'
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView();
          el.focus();
        }
      }, 0);
    }

    handleExternalLinks();
  }, [isLoading]);

  // Show loading screen while theme is initializing or during page load
  const shouldShowLoader = (isLoading && isHome) || themeLoading;

  return (
    <>
      <Head />

      <StyledThemeProvider theme={theme || defaultTheme}>
        <GlobalStyle />

        {/* Theme transition overlay */}
        <ThemeTransitionOverlay $isVisible={isTransitioning && !prefersReducedMotion} />

        <a className="skip-to-content" href="#content">
          Skip to Content
        </a>

        {shouldShowLoader ? (
          <Loader finishLoading={() => setIsLoading(false)} />
        ) : (
          <StyledContent $enableTransitions={!prefersReducedMotion}>
            <Nav isHome={isHome} />
            <Social isHome={isHome} />
            <Email isHome={isHome} />

            <div id="content">
              {children}
              <Footer />
            </div>
          </StyledContent>
        )}
      </StyledThemeProvider>
    </>
  );
};

// Main Layout Component (provides theme context)
const Layout = ({ children, location }) => {
  return (
    <ThemeProvider>
      <div id="root">
        <LayoutInner location={location}>
          {children}
        </LayoutInner>
      </div>
    </ThemeProvider>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
};

LayoutInner.propTypes = {
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
};

export default Layout;
