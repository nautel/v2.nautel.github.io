/**
 * Safe theme mixin accessor
 * Prevents errors during SSR when theme might not be available
 */
export const getMixin = (theme, mixinName) => {
  if (!theme || !theme.mixins || !theme.mixins[mixinName]) {
    // Return empty string during SSR or when mixin is not available
    return '';
  }
  return theme.mixins[mixinName];
};

// Export individual mixin getters for convenience
export const getFlexCenter = theme => getMixin(theme, 'flexCenter');
export const getFlexBetween = theme => getMixin(theme, 'flexBetween');
export const getLink = theme => getMixin(theme, 'link');
export const getInlineLink = theme => getMixin(theme, 'inlineLink');
export const getButton = theme => getMixin(theme, 'button');
export const getBigButton = theme => getMixin(theme, 'bigButton');
export const getSmallButton = theme => getMixin(theme, 'smallButton');
export const getBoxShadow = theme => getMixin(theme, 'boxShadow');
export const getResetList = theme => getMixin(theme, 'resetList');
export const getFadeIn = theme => getMixin(theme, 'fadeIn');
export const getFadeUpIn = theme => getMixin(theme, 'fadeUpIn');