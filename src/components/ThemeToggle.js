import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTheme } from '@contexts/ThemeContext';

// Toggle Switch Container
const ToggleContainer = styled.button`
  position: relative;
  width: 56px;
  height: 28px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  background: ${({ $isDark, theme }) => 
    $isDark 
      ? theme.colors.borders.default
      : theme.colors.backgrounds.tertiary
  };
  transition: ${({ theme }) => theme.animations.transition};
  padding: 0;
  overflow: hidden;
  
  &:hover {
    background: ${({ $isDark, theme }) => 
      $isDark 
        ? theme.colors.borders.hover
        : theme.colors.borders.default
    };
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accents.primary};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Toggle Switch Handle
const ToggleHandle = styled.div`
  position: absolute;
  top: 2px;
  left: ${({ $isDark }) => $isDark ? '2px' : '26px'};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.backgrounds.primary};
  box-shadow: 0 2px 4px ${({ theme }) => theme.colors.shadows.default};
  transition: ${({ theme }) => theme.animations.transition};
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(${({ $isDark }) => $isDark ? '0' : '0'});

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Icon styles for sun/moon
const Icon = styled.div`
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
    fill: ${({ theme }) => theme.colors.text.primary};
    transition: ${({ theme }) => theme.animations.transition};
  }

  @media (prefers-reduced-motion: reduce) {
    svg {
      transition: none;
    }
  }
`;

// Sun Icon Component
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41L6.17 7.58c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zM18.36 16.95c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.59 1.59c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.59-1.59zm0-11.37c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.59 1.59c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.59-1.59zm-11.37 11.37c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0L4.04 17.12c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.54-1.58z"/>
  </svg>
);

// Moon Icon Component
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.43 2.3c-2.38-.59-4.68-.27-6.63.64-.35.16-.41.64-.1.86C8.3 5.6 10 8.6 10 12c0 3.4-1.7 6.4-4.3 8.2-.31.22-.25.7.1.86 1.95.91 4.25 1.23 6.63.64 4.54-1.13 7.73-5.19 7.73-9.7 0-4.51-3.19-8.57-7.73-9.7z"/>
  </svg>
);

// Accessibility label for screen readers
const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// Extended Toggle with text labels (optional variant)
const ExtendedToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.layout.borderRadius};
  background: ${({ theme }) => theme.colors.backgrounds.elevated};
  border: 1px solid ${({ theme }) => theme.colors.borders.default};
  transition: ${({ theme }) => theme.animations.transition};

  &:hover {
    background: ${({ theme }) => theme.colors.states.hover};
    border-color: ${({ theme }) => theme.colors.borders.hover};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const ToggleLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  user-select: none;
`;

// Main Theme Toggle Component
const ThemeToggle = ({ 
  variant = 'switch', 
  showLabels = false, 
  className = '',
  disabled = false,
  ...props 
}) => {
  const { currentTheme, toggleTheme, isLoading } = useTheme();
  const isDark = currentTheme === 'dark';

  const handleToggle = () => {
    if (!disabled && !isLoading) {
      toggleTheme();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  // Switch variant (compact toggle)
  if (variant === 'switch') {
    return (
      <ToggleContainer
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        $isDark={isDark}
        disabled={disabled || isLoading}
        className={className}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        {...props}
      >
        <VisuallyHidden>
          {isDark ? 'Dark theme active' : 'Light theme active'}
        </VisuallyHidden>
        <ToggleHandle $isDark={isDark}>
          <Icon>
            {isDark ? <MoonIcon /> : <SunIcon />}
          </Icon>
        </ToggleHandle>
      </ToggleContainer>
    );
  }

  // Extended variant (with labels)
  if (variant === 'extended') {
    return (
      <ExtendedToggle className={className}>
        {showLabels && <ToggleLabel>Theme</ToggleLabel>}
        <ToggleContainer
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          $isDark={isDark}
          disabled={disabled || isLoading}
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          {...props}
        >
          <VisuallyHidden>
            {isDark ? 'Dark theme active' : 'Light theme active'}
          </VisuallyHidden>
          <ToggleHandle $isDark={isDark}>
            <Icon>
              {isDark ? <MoonIcon /> : <SunIcon />}
            </Icon>
          </ToggleHandle>
        </ToggleContainer>
        {showLabels && (
          <ToggleLabel>
            {isDark ? 'Dark' : 'Light'}
          </ToggleLabel>
        )}
      </ExtendedToggle>
    );
  }

  return null;
};

ThemeToggle.propTypes = {
  variant: PropTypes.oneOf(['switch', 'extended']),
  showLabels: PropTypes.bool,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default ThemeToggle;