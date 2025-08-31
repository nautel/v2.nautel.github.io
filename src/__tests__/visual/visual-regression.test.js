import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { useStaticQuery } from 'gatsby';

import About from '../../components/sections/about';
import Jobs from '../../components/sections/jobs';
import Contact from '../../components/sections/contact';

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
          html: '<ul><li>Architected multimodal perception systems integrating LiDAR point clouds and camera data for real-time object detection in autonomous vehicles, processing 100K+ sensor readings daily</li><li>Pioneered Vision-Language Models (VLMs) for open-vocabulary detection of personal mobility devices, achieving superior generalization to previously unseen vehicle categories</li></ul>',
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
          html: '<ul><li>Invented RCLED (Robust Convolutional LSTM Encoder-Decoder) architecture for unsupervised anomaly detection in multivariate time-series data, establishing new state-of-the-art performance with 93%+ accuracy</li><li>Authored first-author publication in Neurocomputing (Q1, IF: 5.7) introducing novel deep learning methodologies for industrial anomaly detection</li></ul>',
        },
      },
      {
        node: {
          frontmatter: {
            title: 'Machine Learning Engineer',
            company: 'VATEC',
            location: 'Ho Chi Minh City, Vietnam',
            range: 'June 2020 - August 2021',
            url: '#',
          },
          html: '<ul><li>Designed predictive maintenance systems for renewable energy infrastructure, reducing equipment downtime by 40%</li><li>Implemented computer vision solutions for automated quality control in solar panel manufacturing</li></ul>',
        },
      },
      {
        node: {
          frontmatter: {
            title: 'Data Scientist',
            company: 'VietnamElectricity',
            location: 'Hanoi, Vietnam',
            range: 'January 2019 - May 2020',
            url: '#',
          },
          html: '<ul><li>Built time-series forecasting models for electricity demand prediction with 95%+ accuracy</li><li>Optimized power grid load balancing using machine learning algorithms</li></ul>',
        },
      },
    ],
  },
};

// Wrapper component with theme provider
const renderWithTheme = component => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStaticQuery.mockReturnValue(mockJobsData);
  });

  describe('Layout Integrity Tests', () => {
    test('About component maintains expected layout structure', () => {
      const { container } = renderWithTheme(<About />);

      // Check main section structure
      const section = container.querySelector('section#about');
      expect(section).toBeInTheDocument();

      // Check inner grid layout
      const innerDiv = container.querySelector('.inner');
      expect(innerDiv).toBeInTheDocument();

      // Check text content area
      const textArea = container.querySelector('.inner > div:first-child');
      expect(textArea).toBeInTheDocument();

      // Check skills list structure
      const skillsList = container.querySelector('ul.skills-list');
      expect(skillsList).toBeInTheDocument();
      expect(skillsList.children.length).toBe(8); // 8 skills

      // Check image wrapper structure
      const imageWrapper = container.querySelector('.wrapper');
      expect(imageWrapper).toBeInTheDocument();
    });

    test('Jobs component maintains tabbed interface layout', () => {
      const { container } = renderWithTheme(<Jobs />);

      // Check main section structure
      const section = container.querySelector('section#jobs');
      expect(section).toBeInTheDocument();

      // Check inner flex layout
      const innerDiv = container.querySelector('.inner');
      expect(innerDiv).toBeInTheDocument();

      // Check tab list structure
      const tabList = container.querySelector('[role="tablist"]');
      expect(tabList).toBeInTheDocument();

      // Check all tabs are present
      const tabs = container.querySelectorAll('[role="tab"]');
      expect(tabs).toHaveLength(4);

      // Check tab panels structure
      const panels = container.querySelectorAll('[role="tabpanel"]');
      expect(panels).toHaveLength(4);

      // Check highlight indicator is present
      const highlight = container.querySelector('[style*="transform"]');
      expect(highlight).toBeInTheDocument();
    });

    test('Contact component maintains centered layout', () => {
      const { container } = renderWithTheme(<Contact />);

      // Check main section structure
      const section = container.querySelector('section#contact');
      expect(section).toBeInTheDocument();

      // Check heading structure
      const headings = container.querySelectorAll('h2');
      expect(headings).toHaveLength(2);
      expect(headings[0]).toHaveClass('numbered-heading');
      expect(headings[0]).toHaveClass('overline');
      expect(headings[1]).toHaveClass('title');

      // Check paragraph content
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();

      // Check email link button
      const emailLink = container.querySelector('a.email-link');
      expect(emailLink).toBeInTheDocument();
    });
  });

  describe('Content Display Consistency', () => {
    test('About component displays all expected content elements', () => {
      const { container } = renderWithTheme(<About />);

      // Check main heading
      expect(container.querySelector('h2')).toHaveTextContent('About Me');

      // Check all paragraphs are present
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThanOrEqual(4);

      // Check Le Tuan's name is displayed
      expect(container.textContent).toContain('Le Tuan');
      expect(container.textContent).toContain('AI Research Scientist');

      // Check key institutions are mentioned
      expect(container.textContent).toContain('Heudiasyc Lab');
      expect(container.textContent).toContain('UTC');
      expect(container.textContent).toContain('VATEC Energy');
      expect(container.textContent).toContain('Vietnam Electricity');

      // Check publication mention
      expect(container.textContent).toContain('Neurocomputing');
      expect(container.textContent).toContain('RCLED');

      // Check all 8 skills are displayed
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
        expect(container.textContent).toContain(skill);
      });
    });

    test('Jobs component displays complete job timeline', () => {
      const { container } = renderWithTheme(<Jobs />);

      // Check main heading
      expect(container.querySelector('h2')).toHaveTextContent('Experience');

      // Check all company tabs are present
      const expectedCompanies = ['Heudiasyc Lab', 'UTC', 'VATEC', 'VietnamElectricity'];
      expectedCompanies.forEach(company => {
        expect(container.textContent).toContain(company);
      });

      // Check active job content is displayed
      expect(container.textContent).toContain('Postdoctoral Research Scientist');
      expect(container.textContent).toContain('February 2025 - Present');
      expect(container.textContent).toContain('multimodal perception systems');
      expect(container.textContent).toContain('Vision-Language Models');
    });

    test('Contact component displays collaboration messaging', () => {
      const { container } = renderWithTheme(<Contact />);

      // Check headings
      expect(container.textContent).toContain("Let's Collaborate");
      expect(container.textContent).toContain('Get In Touch');

      // Check collaboration messaging
      expect(container.textContent).toContain('research collaborations');
      expect(container.textContent).toContain('AI projects');
      expect(container.textContent).toContain('autonomous systems');
      expect(container.textContent).toContain('multimodal learning');
      expect(container.textContent).toContain('anomaly detection');

      // Check email link
      const emailLink = container.querySelector('a[href^="mailto:"]');
      expect(emailLink).toHaveTextContent('Say Hello');
      expect(emailLink).toHaveAttribute('href', 'mailto:letuan@example.com');
    });
  });

  describe('Responsive Design Elements', () => {
    test('About component has responsive grid structure', () => {
      const { container } = renderWithTheme(<About />);

      const innerDiv = container.querySelector('.inner');
      expect(innerDiv).toBeInTheDocument();

      // Should contain both text and image sections
      const childElements = innerDiv.children;
      expect(childElements.length).toBe(2);

      // Skills list should use CSS grid
      const skillsList = container.querySelector('ul.skills-list');
      expect(skillsList).toBeInTheDocument();
    });

    test('Jobs component has responsive tab interface', () => {
      const { container } = renderWithTheme(<Jobs />);

      const innerDiv = container.querySelector('.inner');
      expect(innerDiv).toBeInTheDocument();

      // Should contain tab list and panels
      const tabList = container.querySelector('[role="tablist"]');
      const panelContainer = container.querySelector('.inner > div:last-child');
      expect(tabList).toBeInTheDocument();
      expect(panelContainer).toBeInTheDocument();
    });

    test('Contact component has centered responsive layout', () => {
      const { container } = renderWithTheme(<Contact />);

      const section = container.querySelector('section#contact');
      expect(section).toBeInTheDocument();

      // All content should be direct children of the section for centering
      const directChildren = section.children;
      expect(directChildren.length).toBeGreaterThan(0);

      // Should have headings, paragraph, and email link
      expect(container.querySelectorAll('h2').length).toBe(2);
      expect(container.querySelectorAll('p').length).toBe(1);
      expect(container.querySelectorAll('a.email-link').length).toBe(1);
    });
  });

  describe('Interactive Element States', () => {
    test('Jobs component tabs have proper active states', () => {
      const { container } = renderWithTheme(<Jobs />);

      const tabs = container.querySelectorAll('[role="tab"]');

      // First tab should be active
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[0]).toHaveAttribute('tabindex', '0');

      // Other tabs should be inactive
      for (let i = 1; i < tabs.length; i++) {
        expect(tabs[i]).toHaveAttribute('aria-selected', 'false');
        expect(tabs[i]).toHaveAttribute('tabindex', '-1');
      }
    });

    test('Contact email link has proper styling classes', () => {
      const { container } = renderWithTheme(<Contact />);

      const emailLink = container.querySelector('a[href^="mailto:"]');
      expect(emailLink).toHaveClass('email-link');

      // Should be styled as a button
      expect(emailLink.tagName).toBe('A');
      expect(emailLink).toHaveAttribute('href');
    });

    test('About component links have proper attributes', () => {
      const { container } = renderWithTheme(<About />);

      const externalLinks = container.querySelectorAll('a[href^="http"]');
      expect(externalLinks.length).toBeGreaterThan(0);

      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.textContent.trim()).not.toBe('');
      });
    });
  });

  describe('Content Length and Wrapping', () => {
    test('Job descriptions handle long content appropriately', () => {
      const { container } = renderWithTheme(<Jobs />);

      // Check that long job descriptions are contained properly
      const activePanel = container.querySelector('[role="tabpanel"]:not([hidden])');
      expect(activePanel).toBeInTheDocument();

      const listItems = activePanel.querySelectorAll('li');
      expect(listItems.length).toBeGreaterThan(0);

      // Long text should be present and properly structured
      listItems.forEach(item => {
        expect(item.textContent.length).toBeGreaterThan(50);
      });
    });

    test('About component handles varied content lengths', () => {
      const { container } = renderWithTheme(<About />);

      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBeGreaterThan(3);

      // Paragraphs should have substantial content
      paragraphs.forEach(p => {
        if (
          p.textContent.trim() !== "Here are some technologies I've been working with recently:"
        ) {
          expect(p.textContent.length).toBeGreaterThan(100);
        }
      });
    });

    test('Skills list maintains consistent formatting', () => {
      const { container } = renderWithTheme(<About />);

      const skillItems = container.querySelectorAll('ul.skills-list li');
      expect(skillItems).toHaveLength(8);

      // Each skill should be a single line
      skillItems.forEach(item => {
        expect(item.textContent.trim().length).toBeGreaterThan(0);
        expect(item.textContent.trim().length).toBeLessThan(30);
      });
    });
  });

  describe('Visual Hierarchy Validation', () => {
    test('All components follow proper heading hierarchy', () => {
      const components = [
        { component: About, expectedHeading: 'About Me' },
        { component: Jobs, expectedHeading: 'Experience' },
        { component: Contact, expectedHeading: "Let's Collaborate" },
      ];

      components.forEach(({ component: Component, expectedHeading }) => {
        const { container } = renderWithTheme(<Component />);

        const mainHeading = container.querySelector('h2.numbered-heading');
        expect(mainHeading).toBeInTheDocument();

        if (Component === Contact) {
          // Contact has two h2 elements
          const headings = container.querySelectorAll('h2');
          expect(headings[0]).toHaveTextContent(expectedHeading);
          expect(headings[1]).toHaveTextContent('Get In Touch');
        } else {
          expect(mainHeading).toHaveTextContent(expectedHeading);
        }
      });
    });

    test('Jobs component maintains proper tab-to-content relationship', () => {
      const { container } = renderWithTheme(<Jobs />);

      // Check that job title appears in both tab and content
      const activeTab = container.querySelector('[aria-selected="true"]');
      const activePanel = container.querySelector('[role="tabpanel"]:not([hidden])');

      expect(activeTab).toHaveTextContent('Heudiasyc Lab');
      expect(activePanel).toHaveTextContent('Postdoctoral Research Scientist');
      expect(activePanel).toHaveTextContent('Heudiasyc Lab');
    });
  });
});
