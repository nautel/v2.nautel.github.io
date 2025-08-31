import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import Contact from '../contact';

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
  email: 'letuan@example.com',
}));

// Mock theme for styled-components
const mockTheme = {
  mixins: {
    bigButton: `
      color: var(--green);
      background-color: transparent;
      border: 1px solid var(--green);
      border-radius: var(--border-radius);
      padding: 1.25rem 1.75rem;
      font-size: var(--fz-sm);
      font-family: var(--font-mono);
      line-height: 1;
      text-decoration: none;
      cursor: pointer;
      transition: var(--transition);
    `,
  },
};

// Wrapper component with theme provider
const renderWithTheme = component => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

describe('Contact Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Content Display', () => {
    test('renders collaboration heading correctly', () => {
      renderWithTheme(<Contact />);
      expect(screen.getByText("Let's Collaborate")).toBeInTheDocument();
    });

    test('displays main contact heading', () => {
      renderWithTheme(<Contact />);
      expect(screen.getByRole('heading', { name: /Get In Touch/ })).toBeInTheDocument();
    });

    test('shows collaboration-focused messaging', () => {
      renderWithTheme(<Contact />);

      const collaborationText = screen.getByText(
        /I'm always interested in discussing research collaborations/,
      );
      expect(collaborationText).toBeInTheDocument();

      expect(screen.getByText(/AI projects/)).toBeInTheDocument();
      expect(screen.getByText(/autonomous systems/)).toBeInTheDocument();
      expect(screen.getByText(/multimodal learning/)).toBeInTheDocument();
      expect(screen.getByText(/anomaly detection/)).toBeInTheDocument();
    });

    test('displays research-focused contact message', () => {
      renderWithTheme(<Contact />);

      expect(screen.getByText(/research question/)).toBeInTheDocument();
      expect(screen.getByText(/want to collaborate/)).toBeInTheDocument();
      expect(screen.getByText(/feel free to reach out/)).toBeInTheDocument();
    });
  });

  describe('Email Functionality', () => {
    test('renders email link with correct href', () => {
      renderWithTheme(<Contact />);

      const emailLink = screen.getByRole('link', { name: /Say Hello/ });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:letuan@example.com');
    });

    test('email link has correct styling class', () => {
      renderWithTheme(<Contact />);

      const emailLink = screen.getByRole('link', { name: /Say Hello/ });
      expect(emailLink).toHaveClass('email-link');
    });

    test('email link is accessible', () => {
      renderWithTheme(<Contact />);

      const emailLink = screen.getByRole('link', { name: /Say Hello/ });
      expect(emailLink).toBeVisible();
      expect(emailLink).toHaveAttribute('href');
    });
  });

  describe('Component Structure', () => {
    test('has correct section id and structure', () => {
      renderWithTheme(<Contact />);

      const section = document.querySelector('#contact');
      expect(section).toBeInTheDocument();
    });

    test('contains numbered heading with overline class', () => {
      renderWithTheme(<Contact />);

      const overlineHeading = screen.getByText("Let's Collaborate");
      expect(overlineHeading.closest('h2')).toHaveClass('numbered-heading');
      expect(overlineHeading.closest('h2')).toHaveClass('overline');
    });

    test('main title has correct class', () => {
      renderWithTheme(<Contact />);

      const mainTitle = screen.getByText('Get In Touch');
      expect(mainTitle.closest('h2')).toHaveClass('title');
    });

    test('section has centered layout styling', () => {
      renderWithTheme(<Contact />);

      const section = document.querySelector('#contact');
      expect(section).toHaveStyle('text-align: center');
      expect(section).toHaveStyle('max-width: 600px');
    });
  });

  describe('Professional Focus Areas', () => {
    test('mentions AI research areas relevant to Le Tuan', () => {
      renderWithTheme(<Contact />);

      expect(screen.getByText(/autonomous systems/)).toBeInTheDocument();
      expect(screen.getByText(/multimodal learning/)).toBeInTheDocument();
      expect(screen.getByText(/anomaly detection/)).toBeInTheDocument();
    });

    test('emphasizes research collaboration opportunities', () => {
      renderWithTheme(<Contact />);

      expect(screen.getByText(/research collaborations/)).toBeInTheDocument();
      expect(screen.getByText(/AI projects/)).toBeInTheDocument();
      expect(screen.getByText(/research question/)).toBeInTheDocument();
    });

    test('includes various contact motivations', () => {
      renderWithTheme(<Contact />);

      const contactText = screen.getByText(
        /research question, want to collaborate, or just want to connect/,
      );
      expect(contactText).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('heading hierarchy is correct', () => {
      renderWithTheme(<Contact />);

      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings).toHaveLength(2);

      expect(headings[0]).toHaveTextContent("Let's Collaborate");
      expect(headings[1]).toHaveTextContent('Get In Touch');
    });

    test('email link is keyboard accessible', () => {
      renderWithTheme(<Contact />);

      const emailLink = screen.getByRole('link', { name: /Say Hello/ });
      expect(emailLink).toBeInTheDocument();

      // Should be focusable
      emailLink.focus();
      expect(document.activeElement).toBe(emailLink);
    });

    test('text content has good readability structure', () => {
      renderWithTheme(<Contact />);

      const paragraph = screen.getByText(/I'm always interested in discussing/);
      expect(paragraph.tagName).toBe('P');
    });

    test('section has proper landmark role', () => {
      renderWithTheme(<Contact />);

      const section = document.querySelector('section#contact');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    test('overline heading has correct styling classes', () => {
      renderWithTheme(<Contact />);

      const overlineHeading = screen.getByText("Let's Collaborate").closest('h2');
      expect(overlineHeading).toHaveClass('numbered-heading');
      expect(overlineHeading).toHaveClass('overline');
    });

    test('email button has proper styling', () => {
      renderWithTheme(<Contact />);

      const emailLink = screen.getByRole('link', { name: /Say Hello/ });
      expect(emailLink).toHaveClass('email-link');
    });

    test('section has centered and constrained layout', () => {
      renderWithTheme(<Contact />);

      const section = document.querySelector('#contact');
      expect(section).toHaveStyle('max-width: 600px');
      expect(section).toHaveStyle('text-align: center');
    });
  });

  describe('Motion and Animation', () => {
    test('initializes ScrollReveal when motion is not reduced', () => {
      const mockSr = require('@utils/sr').default;
      renderWithTheme(<Contact />);

      expect(mockSr.reveal).toHaveBeenCalled();
    });

    test('does not initialize ScrollReveal when motion is reduced', () => {
      // Mock reduced motion preference
      jest.mocked(require('@hooks').usePrefersReducedMotion).mockReturnValue(true);

      const mockSr = require('@utils/sr').default;
      renderWithTheme(<Contact />);

      expect(mockSr.reveal).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Integration', () => {
    test('uses email from config correctly', () => {
      renderWithTheme(<Contact />);

      const emailLink = screen.getByRole('link', { name: /Say Hello/ });
      expect(emailLink).toHaveAttribute('href', 'mailto:letuan@example.com');
    });

    test('handles missing email config gracefully', () => {
      // Mock missing email config
      jest.mocked(require('@config')).email = '';

      renderWithTheme(<Contact />);

      const emailLink = screen.getByRole('link', { name: /Say Hello/ });
      expect(emailLink).toHaveAttribute('href', 'mailto:');
    });
  });

  describe('Content Personalization', () => {
    test("contact message reflects Le Tuan's research focus", () => {
      renderWithTheme(<Contact />);

      // The message should be personalized for AI research
      const message = screen.getByText(
        /I'm always interested in discussing research collaborations, AI projects, and opportunities/,
      );
      expect(message).toBeInTheDocument();
    });

    test('uses professional collaboration tone', () => {
      renderWithTheme(<Contact />);

      // Should use collaborative, professional language
      expect(screen.getByText(/Let's Collaborate/)).toBeInTheDocument();
      expect(screen.getByText(/research collaborations/)).toBeInTheDocument();
      expect(screen.getByText(/opportunities/)).toBeInTheDocument();
    });

    test('mentions specific AI domains of expertise', () => {
      renderWithTheme(<Contact />);

      const domains = ['autonomous systems', 'multimodal learning', 'anomaly detection'];

      domains.forEach(domain => {
        expect(screen.getByText(new RegExp(domain))).toBeInTheDocument();
      });
    });
  });
});
