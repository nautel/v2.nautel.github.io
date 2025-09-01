# Dual-Theme System Documentation

A comprehensive theme system for your Gatsby portfolio website, inspired by Claude's interface design. This system provides seamless switching between light and dark themes with smooth transitions and full accessibility support.

## Features

- 🌓 **Dual-theme support** (light/dark) with Claude-inspired design
- 🎨 **Smooth transitions** with CSS custom properties and View Transitions API
- 🔄 **System preference detection** and auto-switching
- 💾 **Theme persistence** with localStorage and server sync
- ♿ **Full accessibility** support (reduced motion, high contrast)
- 🎭 **Multiple UI variants** for different use cases
- 🚀 **Performance optimized** with caching and lazy loading
- 📱 **Responsive design** across all screen sizes

## Quick Start

### 1. Basic Theme Toggle

Add a simple theme toggle anywhere in your app:

```jsx
import { ThemeToggle } from '@components';

function MyComponent() {
  return (
    <div>
      <ThemeToggle variant="switch" />
    </div>
  );
}
```

### 2. Theme Selector with Previews

For a full theme selection interface:

```jsx
import { ThemeSelector } from '@components';

function SettingsPage() {
  return (
    <div>
      <ThemeSelector 
        variant="full" 
        showSystemPreference={true}
        showAccessibilityInfo={true}
      />
    </div>
  );
}
```

### 3. Using Theme in Components

Access theme values in your styled components:

```jsx
import styled from 'styled-components';
import { useTheme } from '@contexts/ThemeContext';

const StyledComponent = styled.div`
  background: ${({ theme }) => theme.colors.backgrounds.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.borders.default};
  transition: ${({ theme }) => theme.animations.transition};
`;

// Or use CSS custom properties
const AlternativeComponent = styled.div`
  background: var(--color-backgrounds-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-borders-default);
  transition: var(--transition);
`;

function MyComponent() {
  const { currentTheme, isLight, isDark } = useTheme();
  
  return (
    <StyledComponent>
      Current theme: {currentTheme}
    </StyledComponent>
  );
}
```

## Components

### ThemeToggle

A compact toggle switch for quick theme switching.

```jsx
<ThemeToggle 
  variant="switch" // 'switch' | 'extended'
  showLabels={false} 
  disabled={false}
/>
```

**Props:**
- `variant`: Toggle style ('switch' for compact, 'extended' for labeled)
- `showLabels`: Show theme labels (for extended variant)
- `disabled`: Disable the toggle
- `className`: Additional CSS classes

### ThemePreview

Visual preview cards showing how themes look.

```jsx
<ThemePreview 
  themeName="light" // 'light' | 'dark'
  isActive={currentTheme === 'light'}
  onClick={handleThemeChange}
  showLabel={true}
/>
```

**Props:**
- `themeName`: Theme to preview
- `isActive`: Whether this theme is currently active
- `onClick`: Callback when preview is clicked
- `showLabel`: Show theme name label

### ThemeSelector

Complete theme selection interface with all options.

```jsx
<ThemeSelector 
  variant="full" // 'full' | 'compact' | 'preview-only' | 'toggle-only'
  showSystemPreference={true}
  showAccessibilityInfo={true}
/>
```

**Props:**
- `variant`: Interface complexity level
- `showSystemPreference`: Show system preference toggle
- `showAccessibilityInfo`: Show accessibility preference info

## Theme Configuration

### Color Palette

The theme system uses a structured color palette:

```typescript
interface ThemeColors {
  backgrounds: {
    primary: string;    // Main background
    secondary: string;  // Secondary background
    tertiary: string;   // Tertiary background
    elevated: string;   // Cards, modals
    overlay: string;    // Overlays, backdrops
  };
  text: {
    primary: string;    // Primary text
    secondary: string;  // Secondary text
    tertiary: string;   // Tertiary text
    muted: string;      // Muted text
    inverse: string;    // Inverse text (for dark backgrounds)
  };
  accents: {
    primary: string;    // Primary accent (red)
    secondary: string;  // Secondary accent
    success: string;    // Success states
    warning: string;    // Warning states
    error: string;      // Error states
    info: string;       // Info states
  };
  borders: {
    default: string;    // Default borders
    hover: string;      // Hover state borders
    focus: string;      // Focus state borders
    subtle: string;     // Subtle borders
  };
  shadows: {
    default: string;    // Default shadows
    elevated: string;   // Elevated element shadows
    focus: string;      // Focus shadows
  };
  states: {
    hover: string;      // Hover state overlay
    active: string;     // Active state overlay
    selected: string;   // Selected state overlay
    disabled: string;   // Disabled state overlay
  };
}
```

### Light Theme Colors

```scss
// Clean, Claude-inspired light theme
--color-backgrounds-primary: #ffffff;
--color-backgrounds-secondary: #f8f9fa;
--color-text-primary: #202124;
--color-text-secondary: #5f6368;
--color-accents-primary: #ff3333; // Maintains red accent
```

### Dark Theme Colors

```scss
// Original red-black theme maintained
--color-backgrounds-primary: #0d0404;
--color-backgrounds-secondary: #1a0a0a;
--color-text-primary: #ffe6e6;
--color-text-secondary: #d1b8b8;
--color-accents-primary: #ff3333; // Maintains red accent
```

## Custom Hooks

### useTheme

Main hook for accessing theme state and controls:

```jsx
import { useTheme } from '@contexts/ThemeContext';

function MyComponent() {
  const {
    currentTheme,        // 'light' | 'dark'
    theme,               // Complete theme object
    setTheme,            // Function to set theme
    toggleTheme,         // Function to toggle theme
    isLight,             // boolean
    isDark,              // boolean
    isLoading,           // boolean
    systemTheme,         // 'light' | 'dark'
    prefersReducedMotion, // boolean
    prefersHighContrast   // boolean
  } = useTheme();
  
  return <div>Current theme: {currentTheme}</div>;
}
```

### useThemeTransition

Hook for managing smooth theme transitions:

```jsx
import { useThemeTransition } from '@hooks/useThemeTransition';

function MyComponent() {
  const { 
    isTransitioning,      // boolean
    transitionPhase,      // 'idle' | 'preparing' | 'transitioning' | 'completing'
    executeTransition,    // Function to execute custom transitions
    supportsViewTransition // boolean
  } = useThemeTransition();
  
  return (
    <div>
      {isTransitioning && <div>Theme switching...</div>}
    </div>
  );
}
```

### useThemeAPI

Hook for server synchronization:

```jsx
import { useThemeAPI } from '@hooks/useThemeAPI';

function MyComponent() {
  const {
    isOnline,             // boolean
    syncStatus,           // 'idle' | 'syncing' | 'success' | 'error'
    syncPreferences,      // Function to sync with server
    updateServerPreferences // Function to update server
  } = useThemeAPI();
  
  return <div>Sync status: {syncStatus}</div>;
}
```

## API Integration

The theme system integrates with backend endpoints:

### GET /api/v1/themes/preferences
Get user theme preferences from server.

### PUT /api/v1/themes/preferences
Update theme preferences on server.

### PATCH /api/v1/themes/switch
Real-time theme switching with server notification.

### GET /api/v1/themes/available
Get list of available themes.

## CSS Custom Properties

The system provides CSS custom properties for direct styling:

```css
/* Use in any CSS/SCSS file */
.my-component {
  background: var(--color-backgrounds-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-borders-default);
  transition: var(--transition);
}

/* Theme-specific overrides */
[data-theme='light'] .my-component {
  box-shadow: 0 2px 8px var(--color-shadows-default);
}

[data-theme='dark'] .my-component {
  box-shadow: 0 4px 16px var(--color-shadows-elevated);
}
```

## Accessibility

### Reduced Motion Support

The system automatically detects and respects `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --animation-duration: 0s;
    --transition: none;
  }
}
```

### High Contrast Support

Automatically adjusts for `prefers-contrast: high`:

```css
@media (prefers-contrast: high) {
  :root {
    --color-borders-default: var(--color-text-primary);
    --color-shadows-default: transparent;
  }
}
```

### Keyboard Navigation

All theme controls are keyboard accessible:
- `Tab` to focus theme toggle
- `Enter` or `Space` to activate
- `Escape` to close theme selector

### Screen Reader Support

- Proper ARIA labels and roles
- Live regions for theme changes
- Descriptive button text

## Performance Optimizations

### Caching

- Theme preferences cached in localStorage
- Server responses cached for 5 minutes
- Automatic cache invalidation on updates

### Lazy Loading

- Theme components loaded only when needed
- Progressive enhancement approach
- Minimal initial bundle impact

### Smooth Transitions

- Uses View Transitions API when available
- Fallback to CSS transitions
- Respects user motion preferences

## Browser Support

- **Modern browsers**: Full feature support including View Transitions
- **IE11+**: Basic theme switching without advanced transitions
- **Mobile**: Full support with touch-friendly controls
- **SSR**: Proper hydration without flash of unstyled content

## Migration Guide

### From Existing Theme

To migrate from your existing theme system:

1. **Keep existing variables** - All original CSS variables are maintained
2. **Add new components** - Integrate new theme components gradually  
3. **Update Layout** - Use new Layout component with ThemeProvider
4. **Test thoroughly** - Ensure all existing styles work with both themes

### Example Migration

```jsx
// Before
import { ThemeProvider } from 'styled-components';
import { theme } from '@styles';

function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
}

// After
import { ThemeProvider } from '@contexts/ThemeContext';
import { Layout } from '@components';

function App({ children, location }) {
  return (
    <Layout location={location}>
      {children}
    </Layout>
  );
}
```

## Troubleshooting

### Common Issues

1. **Flash of unstyled content**: Ensure ThemeProvider wraps your entire app
2. **Transitions not working**: Check for `prefers-reduced-motion` setting
3. **Server sync failing**: System gracefully falls back to local storage
4. **Theme not persisting**: Check localStorage permissions

### Debug Mode

Enable debug mode for development:

```jsx
// Add to your development environment
window.THEME_DEBUG = true;
```

This will log theme changes and API calls to the console.

## Examples

See the `/src/components/` directory for complete implementation examples of all components and patterns described in this documentation.