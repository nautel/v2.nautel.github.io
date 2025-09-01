import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { lightTheme, darkTheme } from '@styles/themes';

// Preview Card Container
const PreviewCard = styled.div`
  border-radius: 8px;
  border: 2px solid ${({ $isActive, theme }) => 
    $isActive ? theme.colors.accents.primary : theme.colors.borders.default
  };
  overflow: hidden;
  cursor: pointer;
  transition: ${({ theme }) => theme.animations.transition};
  background: ${({ $previewTheme }) => $previewTheme.colors.backgrounds.primary};
  box-shadow: 0 4px 12px ${({ theme }) => theme.colors.shadows.default};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.borders.hover};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.colors.shadows.elevated};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.colors.accents.primary};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover {
      transform: none;
    }
  }
`;

// Preview Header
const PreviewHeader = styled.div`
  height: 40px;
  background: ${({ $previewTheme }) => $previewTheme.colors.backgrounds.secondary};
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
`;

// Window Controls (fake browser buttons)
const WindowControl = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color, $previewTheme }) => {
    switch ($color) {
      case 'red': return '#ff5f57';
      case 'yellow': return '#ffbd2e';
      case 'green': return '#28ca42';
      default: return $previewTheme.colors.borders.default;
    }
  }};
`;

// Preview Content
const PreviewContent = styled.div`
  padding: 16px;
  min-height: 120px;
  background: ${({ $previewTheme }) => $previewTheme.colors.backgrounds.primary};
`;

// Preview Text Elements
const PreviewTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ $previewTheme }) => $previewTheme.colors.text.primary};
`;

const PreviewText = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  color: ${({ $previewTheme }) => $previewTheme.colors.text.secondary};
  line-height: 1.5;
`;

// Preview Button
const PreviewButton = styled.div`
  display: inline-block;
  padding: 8px 16px;
  border-radius: 4px;
  background: ${({ $previewTheme }) => $previewTheme.colors.accents.primary};
  color: ${({ $previewTheme }) => $previewTheme.colors.text.inverse};
  font-size: 12px;
  font-weight: 500;
`;

// Preview Accent Bar
const PreviewAccent = styled.div`
  height: 4px;
  background: ${({ $previewTheme }) => $previewTheme.colors.accents.primary};
  margin: 12px 0 0 0;
`;

// Theme Label
const ThemeLabel = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.backgrounds.elevated};
  border: 1px solid ${({ theme }) => theme.colors.borders.default};
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: capitalize;
`;

// Selection Indicator
const SelectionIndicator = styled.div`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accents.primary};
  display: ${({ $isActive }) => $isActive ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

// Container for theme preview
const PreviewContainer = styled.div`
  position: relative;
  width: 200px;
  height: auto;
`;

// Main Theme Preview Component
const ThemePreview = ({ 
  themeName, 
  isActive = false, 
  onClick, 
  showLabel = true,
  className = '' 
}) => {
  const previewTheme = themeName === 'light' ? lightTheme : darkTheme;
  
  const handleClick = () => {
    if (onClick) {
      onClick(themeName);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <PreviewContainer className={className}>
      <PreviewCard
        $previewTheme={previewTheme}
        $isActive={isActive}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Switch to ${themeName} theme`}
        aria-pressed={isActive}
      >
        {showLabel && <ThemeLabel>{themeName}</ThemeLabel>}
        <SelectionIndicator $isActive={isActive}>✓</SelectionIndicator>
        
        <PreviewHeader $previewTheme={previewTheme}>
          <WindowControl $color="red" $previewTheme={previewTheme} />
          <WindowControl $color="yellow" $previewTheme={previewTheme} />
          <WindowControl $color="green" $previewTheme={previewTheme} />
        </PreviewHeader>
        
        <PreviewContent $previewTheme={previewTheme}>
          <PreviewTitle $previewTheme={previewTheme}>
            {themeName === 'light' ? 'Light Theme' : 'Dark Theme'}
          </PreviewTitle>
          <PreviewText $previewTheme={previewTheme}>
            Clean, modern design with optimal contrast and readability.
          </PreviewText>
          <PreviewButton $previewTheme={previewTheme}>
            Get Started
          </PreviewButton>
          <PreviewAccent $previewTheme={previewTheme} />
        </PreviewContent>
      </PreviewCard>
    </PreviewContainer>
  );
};

ThemePreview.propTypes = {
  themeName: PropTypes.oneOf(['light', 'dark']).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};

export default ThemePreview;