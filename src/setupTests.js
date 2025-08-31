import '@testing-library/jest-dom';
import React from 'react';

// Mock gatsby modules
global.___loader = {
  enqueue: jest.fn(),
};

// Mock StaticImage component from gatsby-plugin-image
jest.mock('gatsby-plugin-image', () => ({
  StaticImage: ({ alt, ...props }) => <img alt={alt} {...props} data-testid="static-image" />,
  GatsbyImage: ({ alt, ...props }) => <img alt={alt} {...props} data-testid="gatsby-image" />,
}));

// Mock gatsby
jest.mock('gatsby', () => ({
  graphql: jest.fn(),
  Link: ({ children, to, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
  useStaticQuery: jest.fn(),
  navigate: jest.fn(),
}));

// Mock ScrollReveal
jest.mock('scrollreveal', () => ({
  __esModule: true,
  default: {
    reveal: jest.fn(),
  },
}));

// Mock animejs
jest.mock('animejs', () => ({
  __esModule: true,
  default: jest.fn(),
}));
