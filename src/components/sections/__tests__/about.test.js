import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import About from '../about';

// Mock custom hooks and utilities
jest.mock('@hooks', () => ({
  usePrefersReducedMotion: () => false,
}));

jest.mock('@utils/sr', () => ({
  __esModule: true,
  default: {
    reveal: jest.fn(),
  },
}));

jest.mock('@config', () => ({
  srConfig: () => ({ delay: 100 }),
}));

// Mock theme for styled-components
const mockTheme = {
  mixins: {
    boxShadow: 'box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);',
    fancyList: 'list-style: none;',
    flexCenter: 'display: flex; justify-content: center; align-items: center;',
    link: 'color: var(--green);',
  },
};

// Wrapper component with theme provider
const renderWithTheme = component => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

describe('About Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Content Display', () => {
    test("renders Le Tuan's name correctly", () => {
      renderWithTheme(<About />);
      expect(screen.getByText(/My name is Le Tuan/)).toBeInTheDocument();
    });

    test('displays AI Research Scientist profile information', () => {
      renderWithTheme(<About />);
      expect(screen.getByText(/AI Research Scientist/)).toBeInTheDocument();
      expect(screen.getByText(/artificial intelligence/)).toBeInTheDocument();
      expect(
        screen.getByText(/machine learning for complex systems optimization/),
      ).toBeInTheDocument();
    });

    test('shows correct professional experience mentions', () => {
      renderWithTheme(<About />);

      // Check for key institutions mentioned
      expect(screen.getByText(/Heudiasyc Lab/)).toBeInTheDocument();
      expect(screen.getByText(/UTC/)).toBeInTheDocument();
      expect(screen.getByText(/VATEC Energy/)).toBeInTheDocument();
      expect(screen.getByText(/Vietnam Electricity/)).toBeInTheDocument();
    });

    test('displays research focus areas', () => {
      renderWithTheme(<About />);
      expect(screen.getByText(/foundation models/)).toBeInTheDocument();
      expect(screen.getByText(/multimodal learning/)).toBeInTheDocument();
      expect(screen.getByText(/unsupervised anomaly detection/)).toBeInTheDocument();
    });

    test('shows publication information', () => {
      renderWithTheme(<About />);
      expect(screen.getByText(/Neurocomputing/)).toBeInTheDocument();
      expect(screen.getByText(/RCLED/)).toBeInTheDocument();
      expect(screen.getByText(/93%\+ accuracy/)).toBeInTheDocument();
    });
  });

  describe('Skills Section', () => {
    test('renders all AI/ML technologies in skills list', () => {
      renderWithTheme(<About />);

      const expectedSkills = [
        'PyTorch',
        'TensorFlow',
        'Python',
        'CUDA',
        'Docker',
        'Foundation Models',
        'Anomaly Detection',
        'Multimodal AI',
      ];

      expectedSkills.forEach(skill => {
        expect(screen.getByText(skill)).toBeInTheDocument();
      });
    });

    test('skills list has correct structure', () => {
      renderWithTheme(<About />);
      const skillsList = screen.getByRole('list');
      expect(skillsList).toHaveClass('skills-list');

      const skillItems = screen.getAllByRole('listitem');
      expect(skillItems).toHaveLength(8);
    });

    test('each skill item has the correct styling structure', () => {
      renderWithTheme(<About />);
      const skillItems = screen.getAllByRole('listitem');

      skillItems.forEach(item => {
        expect(item).toHaveStyle('position: relative');
        expect(item).toHaveStyle('padding-left: 20px');
      });
    });
  });

  describe('Image Section', () => {
    test('renders profile image with correct attributes', () => {
      renderWithTheme(<About />);
      const image = screen.getByTestId('static-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Headshot');
    });

    test('image wrapper has correct CSS classes', () => {
      renderWithTheme(<About />);
      const imageWrapper = screen.getByTestId('static-image').parentElement;
      expect(imageWrapper).toHaveClass('wrapper');
    });
  });

  describe('Links and External References', () => {
    test('contains links to institutions with correct URLs', () => {
      renderWithTheme(<About />);

      const heudiasycLink = screen.getByRole('link', { name: /Heudiasyc Lab/ });
      expect(heudiasycLink).toHaveAttribute('href', 'https://www.hds.utc.fr/');

      const utcLink = screen.getByRole('link', { name: /UTC/ });
      expect(utcLink).toHaveAttribute('href', 'https://www.utc.fr/');

      const publicationLink = screen.getByRole('link', { name: /Neurocomputing/ });
      expect(publicationLink).toHaveAttribute(
        'href',
        'https://doi.org/10.1016/j.neucom.2024.127791',
      );
    });

    test('all external links have correct accessibility attributes', () => {
      renderWithTheme(<About />);
      const externalLinks = screen.getAllByRole('link');

      externalLinks.forEach(link => {
        // Links should be accessible
        expect(link).toBeVisible();
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Component Structure', () => {
    test('has correct section id and structure', () => {
      renderWithTheme(<About />);
      const section = screen.getByRole('region', { name: /about/i });
      expect(section).toHaveAttribute('id', 'about');
    });

    test('contains numbered heading', () => {
      renderWithTheme(<About />);
      const heading = screen.getByRole('heading', { name: /About Me/ });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('numbered-heading');
    });

    test('has correct grid layout structure', () => {
      renderWithTheme(<About />);
      const innerDiv = screen.getByText(/My name is Le Tuan/).closest('.inner');
      expect(innerDiv).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('heading hierarchy is correct', () => {
      renderWithTheme(<About />);
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('About Me');
    });

    test('image has descriptive alt text', () => {
      renderWithTheme(<About />);
      const image = screen.getByAltText('Headshot');
      expect(image).toBeInTheDocument();
    });

    test('skills list is properly structured for screen readers', () => {
      renderWithTheme(<About />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('Motion and Animation', () => {
    test('initializes ScrollReveal when motion is not reduced', () => {
      const mockSr = require('@utils/sr').default;
      renderWithTheme(<About />);

      // ScrollReveal should be called
      expect(mockSr.reveal).toHaveBeenCalled();
    });

    test('does not initialize ScrollReveal when motion is reduced', () => {
      // Mock reduced motion preference
      jest.mocked(require('@hooks').usePrefersReducedMotion).mockReturnValue(true);

      const mockSr = require('@utils/sr').default;
      renderWithTheme(<About />);

      // ScrollReveal should not be called when motion is reduced
      expect(mockSr.reveal).not.toHaveBeenCalled();
    });
  });
});
