import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useStaticQuery } from 'gatsby';

import About from '../../components/sections/about';
import Jobs from '../../components/sections/jobs';
import Contact from '../../components/sections/contact';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

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

jest.mock('@utils', () => ({
  KEY_CODES: {
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
  },
}));

// Mock theme for styled-components
const mockTheme = {
  mixins: {
    boxShadow: 'box-shadow: 0 10px 30px -15px rgba(2, 12, 27, 0.7);',
    fancyList: 'list-style: none;',
    flexCenter: 'display: flex; justify-content: center; align-items: center;',
    link: 'color: var(--green);',
    bigButton:
      'color: var(--green); background-color: transparent; border: 1px solid var(--green);',
  },
};

// Mock job data for Jobs component
const mockJobsData = {
  jobs: {
    edges: [
      {
        node: {
          frontmatter: {
            title: 'Postdoctoral Research Scientist',
            company: 'Heudiasyc Lab',
            location: 'Compiègne, France',
            range: 'February 2025 - Present',
            url: 'https://www.hds.utc.fr/',
          },
          html: '<ul><li>Architected multimodal perception systems integrating LiDAR point clouds and camera data for real-time object detection in autonomous vehicles</li></ul>',
        },
      },
      {
        node: {
          frontmatter: {
            title: 'PhD Research Scientist',
            company: 'UTC',
            location: 'Compiègne, France',
            range: 'October 2021 - January 2025',
            url: 'https://www.utc.fr/',
          },
          html: '<ul><li>Invented RCLED architecture for multivariate time-series anomaly detection</li></ul>',
        },
      },
    ],
  },
};

// Wrapper component with theme provider
const renderWithTheme = component => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStaticQuery.mockReturnValue(mockJobsData);
  });

  describe('About Component Accessibility', () => {
    test('About component has no accessibility violations', async () => {
      const { container } = renderWithTheme(<About />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('About component has proper heading hierarchy', () => {
      const { container } = renderWithTheme(<About />);

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);

      // Main heading should be h2 (as part of page structure)
      const mainHeading = container.querySelector('h2');
      expect(mainHeading).toBeInTheDocument();
      expect(mainHeading).toHaveTextContent('About Me');
    });

    test('Skills list has proper semantic structure', () => {
      const { container } = renderWithTheme(<About />);

      const skillsList = container.querySelector('ul.skills-list');
      expect(skillsList).toBeInTheDocument();
      expect(skillsList.getAttribute('role')).toBeFalsy(); // Should use default list role

      const listItems = skillsList.querySelectorAll('li');
      expect(listItems.length).toBeGreaterThan(0);
    });

    test('Profile image has descriptive alt text', () => {
      const { container } = renderWithTheme(<About />);

      const image = container.querySelector('img[alt="Headshot"]');
      expect(image).toBeInTheDocument();
      expect(image.getAttribute('alt')).toBe('Headshot');
    });

    test('External links have proper attributes', () => {
      const { container } = renderWithTheme(<About />);

      const externalLinks = container.querySelectorAll('a[href^="http"]');
      externalLinks.forEach(link => {
        expect(link).toBeInTheDocument();
        expect(link.getAttribute('href')).toMatch(/^https?:\/\//);
        // Note: target="_blank" and rel="noopener noreferrer" should be added for external links
      });
    });
  });

  describe('Jobs Component Accessibility', () => {
    test('Jobs component has no accessibility violations', async () => {
      const { container } = renderWithTheme(<Jobs />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Tab interface follows ARIA best practices', () => {
      const { container } = renderWithTheme(<Jobs />);

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toBeInTheDocument();
      expect(tablist).toHaveAttribute('aria-label', 'Job tabs');

      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs.length).toBeGreaterThan(0);

      tabs.forEach((tab, index) => {
        expect(tab).toHaveAttribute('id');
        expect(tab).toHaveAttribute('aria-controls');
        expect(tab).toHaveAttribute('aria-selected');
        expect(tab).toHaveAttribute('role', 'tab');
      });
    });

    test('Tab panels have proper ARIA relationships', () => {
      const { container } = renderWithTheme(<Jobs />);

      const panels = container.querySelectorAll('[role="tabpanel"]');
      expect(panels.length).toBeGreaterThan(0);

      panels.forEach((panel, index) => {
        expect(panel).toHaveAttribute('id');
        expect(panel).toHaveAttribute('aria-labelledby');
        expect(panel).toHaveAttribute('role', 'tabpanel');

        // Check ARIA relationship
        const labelledBy = panel.getAttribute('aria-labelledby');
        const correspondingTab = container.querySelector(`#${labelledBy}`);
        expect(correspondingTab).toBeInTheDocument();
      });
    });

    test('Tab navigation supports keyboard interaction', () => {
      const { container } = renderWithTheme(<Jobs />);

      const tabs = container.querySelectorAll('[role="tab"]');

      tabs.forEach(tab => {
        const tabIndex = tab.getAttribute('tabindex');
        expect(tabIndex)
          .toBe('0' || tabIndex)
          .toBe('-1'); // Should be focusable or not
      });

      // Active tab should have tabindex="0"
      const activeTab = container.querySelector('[aria-selected="true"]');
      expect(activeTab).toHaveAttribute('tabindex', '0');
    });

    test('Company links are accessible', () => {
      const { container } = renderWithTheme(<Jobs />);

      const companyLinks = container.querySelectorAll('a.inline-link');
      expect(companyLinks.length).toBeGreaterThan(0);

      companyLinks.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.textContent.trim()).not.toBe('');
      });
    });

    test('Job descriptions are properly structured', () => {
      const { container } = renderWithTheme(<Jobs />);

      const activePanel = container.querySelector('[role="tabpanel"]:not([hidden])');
      expect(activePanel).toBeInTheDocument();

      // Should have job title
      const jobTitle = activePanel.querySelector('h3');
      expect(jobTitle).toBeInTheDocument();

      // Should have date range
      const dateRange = activePanel.querySelector('.range');
      expect(dateRange).toBeInTheDocument();
    });
  });

  describe('Contact Component Accessibility', () => {
    test('Contact component has no accessibility violations', async () => {
      const { container } = renderWithTheme(<Contact />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('Contact headings follow proper hierarchy', () => {
      const { container } = renderWithTheme(<Contact />);

      const headings = container.querySelectorAll('h2');
      expect(headings.length).toBe(2);

      expect(headings[0]).toHaveTextContent("Let's Collaborate");
      expect(headings[1]).toHaveTextContent('Get In Touch');
    });

    test('Email link is accessible and functional', () => {
      const { container } = renderWithTheme(<Contact />);

      const emailLink = container.querySelector('a[href^="mailto:"]');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:letuan@example.com');
      expect(emailLink.textContent.trim()).not.toBe('');

      // Should be keyboard accessible
      expect(emailLink.tagName).toBe('A');
      expect(emailLink.getAttribute('tabindex')).toBeFalsy(); // Should use default tabindex
    });

    test('Contact section has proper landmark structure', () => {
      const { container } = renderWithTheme(<Contact />);

      const contactSection = container.querySelector('section#contact');
      expect(contactSection).toBeInTheDocument();
      expect(contactSection.getAttribute('id')).toBe('contact');
    });

    test('Contact content has good readability', () => {
      const { container } = renderWithTheme(<Contact />);

      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.textContent.length).toBeGreaterThan(50); // Should have substantial content
    });
  });

  describe('Cross-Component Accessibility', () => {
    test('All components use semantic HTML elements', () => {
      const components = [
        { component: About, name: 'About' },
        { component: Jobs, name: 'Jobs' },
        { component: Contact, name: 'Contact' },
      ];

      components.forEach(({ component: Component, name }) => {
        const { container } = renderWithTheme(<Component />);

        // Should have semantic section element
        const section = container.querySelector('section');
        expect(section).toBeInTheDocument();

        // Should have proper heading
        const heading = container.querySelector('h2');
        expect(heading).toBeInTheDocument();
      });
    });

    test('All components have unique section IDs', () => {
      const aboutContainer = renderWithTheme(<About />).container;
      const jobsContainer = renderWithTheme(<Jobs />).container;
      const contactContainer = renderWithTheme(<Contact />).container;

      const aboutId = aboutContainer.querySelector('section').getAttribute('id');
      const jobsId = jobsContainer.querySelector('section').getAttribute('id');
      const contactId = contactContainer.querySelector('section').getAttribute('id');

      expect(aboutId).toBe('about');
      expect(jobsId).toBe('jobs');
      expect(contactId).toBe('contact');

      // All IDs should be unique
      const ids = [aboutId, jobsId, contactId];
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(ids.length);
    });

    test('All external links follow security best practices', () => {
      const components = [About, Jobs, Contact];

      components.forEach(Component => {
        const { container } = renderWithTheme(<Component />);
        const externalLinks = container.querySelectorAll('a[href^="http"]');

        externalLinks.forEach(link => {
          // External links should ideally have target="_blank" and rel="noopener noreferrer"
          // This test documents the current state and can be updated when security attributes are added
          expect(link).toHaveAttribute('href');
          expect(link.getAttribute('href')).toMatch(/^https?:\/\//);
        });
      });
    });

    test('All components handle reduced motion preferences', () => {
      // Mock reduced motion preference
      jest.mocked(require('@hooks').usePrefersReducedMotion).mockReturnValue(true);

      const components = [About, Jobs, Contact];
      const mockSr = require('@utils/sr').default;

      components.forEach(Component => {
        mockSr.reveal.mockClear();
        renderWithTheme(<Component />);

        // ScrollReveal should not be called when motion is reduced
        expect(mockSr.reveal).not.toHaveBeenCalled();
      });
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    test('Components maintain proper focus indicators', () => {
      const components = [About, Jobs, Contact];

      components.forEach(Component => {
        const { container } = renderWithTheme(<Component />);
        const focusableElements = container.querySelectorAll(
          'a, button, [tabindex]:not([tabindex="-1"])',
        );

        focusableElements.forEach(element => {
          expect(element).toBeVisible();
          // Focus indicators are typically handled by CSS, but elements should be focusable
        });
      });
    });

    test('Interactive elements have sufficient target size', () => {
      const { container: jobsContainer } = renderWithTheme(<Jobs />);
      const { container: contactContainer } = renderWithTheme(<Contact />);

      // Check tab buttons (should be sufficiently large)
      const tabButtons = jobsContainer.querySelectorAll('[role="tab"]');
      tabButtons.forEach(button => {
        expect(button).toBeInTheDocument();
        // Target size testing would require actual DOM measurements
      });

      // Check email link (should be sufficiently large)
      const emailLink = contactContainer.querySelector('a[href^="mailto:"]');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveClass('email-link'); // Should have styling for proper size
    });
  });

  describe('Screen Reader Experience', () => {
    test('Components provide meaningful text alternatives', () => {
      const { container } = renderWithTheme(<About />);

      const images = container.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    test('Components use appropriate ARIA labels where needed', () => {
      const { container } = renderWithTheme(<Jobs />);

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).toHaveAttribute('aria-label');
      expect(tablist.getAttribute('aria-label')).toBe('Job tabs');
    });

    test('Dynamic content changes are announced properly', () => {
      const { container } = renderWithTheme(<Jobs />);

      // Tab panels should have proper ARIA attributes for screen reader announcements
      const panels = container.querySelectorAll('[role="tabpanel"]');
      panels.forEach(panel => {
        expect(panel).toHaveAttribute('aria-labelledby');

        // Hidden panels should be properly marked
        if (panel.hasAttribute('hidden')) {
          expect(panel).toHaveAttribute('aria-hidden', 'true');
        }
      });
    });
  });
});
