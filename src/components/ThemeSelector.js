import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from '@contexts/ThemeContext';
import ThemePreview from './ThemePreview';
import ThemeToggle from './ThemeToggle';

// Main Container
const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.backgrounds.elevated};
  border: 1px solid ${({ theme }) => theme.colors.borders.default};
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadows.default};
`;

// Header Section
const SelectorHeader = styled.div`
  text-align: center;
`;

const SelectorTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SelectorDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

// Theme Options Container
const ThemeOptions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

// Quick Toggle Section
const QuickToggleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.backgrounds.secondary};
  border: 1px solid ${({ theme }) => theme.colors.borders.subtle};
`;

const QuickToggleLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// System Preference Section
const SystemPreferenceSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.backgrounds.tertiary};
  border: 1px solid ${({ theme }) => theme.colors.borders.subtle};
  margin-top: 16px;
`;

const SystemPreferenceLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SystemPreferenceTitle = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SystemPreferenceDescription = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const SystemPreferenceToggle = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.borders.default};
  background: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.accents.primary : theme.colors.backgrounds.primary
  };
  color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.text.inverse : theme.colors.text.primary
  };
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.transition};

  &:hover {
    background: ${({ $isActive, theme }) => 
      $isActive ? theme.colors.accents.primary : theme.colors.states.hover
    };
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accents.primary};
    outline-offset: 2px;
  }
`;

// Accessibility Info Section
const AccessibilityInfo = styled.div`
  padding: 12px 16px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.backgrounds.tertiary};
  border-left: 3px solid ${({ theme }) => theme.colors.accents.info};
  margin-top: 16px;
`;

const AccessibilityTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 4px;
`;

const AccessibilityText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.4;
`;

// Main Theme Selector Component
const ThemeSelector = ({ 
  variant = 'full', // 'full', 'compact', 'preview-only', 'toggle-only'
  showSystemPreference = true,
  showAccessibilityInfo = true,
  className = ''
}) => {
  const { currentTheme, setTheme, systemTheme, prefersReducedMotion, prefersHighContrast } = useTheme();
  const [followSystemTheme, setFollowSystemTheme] = useState(false);

  const handleThemeChange = (themeName) => {
    setTheme(themeName);
    if (followSystemTheme) {
      setFollowSystemTheme(false);
    }
  };

  const handleSystemPreferenceToggle = () => {
    const newFollowSystem = !followSystemTheme;
    setFollowSystemTheme(newFollowSystem);
    
    if (newFollowSystem) {
      setTheme(systemTheme);
    }
  };

  // Compact variant - just the toggle
  if (variant === 'toggle-only') {
    return (
      <ThemeToggle 
        variant="extended" 
        showLabels={true}
        className={className}
      />
    );
  }

  // Preview only variant
  if (variant === 'preview-only') {
    return (
      <ThemeOptions className={className}>
        <ThemePreview
          themeName="light"
          isActive={currentTheme === 'light'}
          onClick={handleThemeChange}
        />
        <ThemePreview
          themeName="dark"
          isActive={currentTheme === 'dark'}
          onClick={handleThemeChange}
        />
      </ThemeOptions>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <SelectorContainer className={className}>
        <QuickToggleSection>
          <QuickToggleLabel>Theme</QuickToggleLabel>
          <ThemeToggle variant="switch" />
        </QuickToggleSection>
        
        {showSystemPreference && (
          <SystemPreferenceSection>
            <SystemPreferenceLabel>
              <SystemPreferenceTitle>Follow system</SystemPreferenceTitle>
              <SystemPreferenceDescription>
                Auto-switch based on system preference
              </SystemPreferenceDescription>
            </SystemPreferenceLabel>
            <SystemPreferenceToggle
              $isActive={followSystemTheme}
              onClick={handleSystemPreferenceToggle}
              aria-label="Toggle system theme preference"
            >
              {followSystemTheme ? 'On' : 'Off'}
            </SystemPreferenceToggle>
          </SystemPreferenceSection>
        )}
      </SelectorContainer>
    );
  }

  // Full variant (default)
  return (
    <SelectorContainer className={className}>
      <SelectorHeader>
        <SelectorTitle>Choose Your Theme</SelectorTitle>
        <SelectorDescription>
          Select your preferred color scheme for the best viewing experience.
        </SelectorDescription>
      </SelectorHeader>

      <ThemeOptions>
        <ThemePreview
          themeName="light"
          isActive={currentTheme === 'light'}
          onClick={handleThemeChange}
        />
        <ThemePreview
          themeName="dark"
          isActive={currentTheme === 'dark'}
          onClick={handleThemeChange}
        />
      </ThemeOptions>

      <QuickToggleSection>
        <QuickToggleLabel>Quick Toggle</QuickToggleLabel>
        <ThemeToggle variant="switch" />
      </QuickToggleSection>

      {showSystemPreference && (
        <SystemPreferenceSection>
          <SystemPreferenceLabel>
            <SystemPreferenceTitle>Follow system preference</SystemPreferenceTitle>
            <SystemPreferenceDescription>
              Automatically switch themes based on your system setting (Currently: {systemTheme})
            </SystemPreferenceDescription>
          </SystemPreferenceLabel>
          <SystemPreferenceToggle
            $isActive={followSystemTheme}
            onClick={handleSystemPreferenceToggle}
            aria-label="Toggle system theme preference"
          >
            {followSystemTheme ? 'On' : 'Off'}
          </SystemPreferenceToggle>
        </SystemPreferenceSection>
      )}

      {showAccessibilityInfo && (prefersReducedMotion || prefersHighContrast) && (
        <AccessibilityInfo>
          <AccessibilityTitle>Accessibility Preferences Detected</AccessibilityTitle>
          <AccessibilityText>
            {prefersReducedMotion && 'Reduced motion is enabled. '}
            {prefersHighContrast && 'High contrast is preferred. '}
            Theme transitions and animations have been adjusted accordingly.
          </AccessibilityText>
        </AccessibilityInfo>
      )}
    </SelectorContainer>
  );
};

ThemeSelector.propTypes = {
  variant: PropTypes.oneOf(['full', 'compact', 'preview-only', 'toggle-only']),
  showSystemPreference: PropTypes.bool,
  showAccessibilityInfo: PropTypes.bool,
  className: PropTypes.string,
};

export default ThemeSelector;