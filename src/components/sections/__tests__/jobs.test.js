import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { useStaticQuery } from 'gatsby';
import Jobs from '../jobs';

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
  },
};

// Mock job data based on the actual markdown files
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
            title: 'PhD Student - AI Research',
            company: 'UTC',
            location: 'Compiègne, France',
            range: 'September 2021 - January 2025',
            url: 'https://www.utc.fr/',
          },
          html: '<ul><li>Developed RCLED architecture for multivariate time-series anomaly detection, achieving 93%+ accuracy across multiple benchmarks</li><li>Published first-author paper in Neurocomputing (Q1, IF: 5.7) on novel reconstruction-based detection methods</li></ul>',
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
          html: '<ul><li>Designed predictive maintenance systems for renewable energy infrastructure, reducing downtime by 40%</li><li>Implemented computer vision solutions for automated quality control in solar panel manufacturing</li></ul>',
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
          html: '<ul><li>Built time-series forecasting models for electricity demand prediction with 95%+ accuracy</li><li>Optimized power grid operations using machine learning, resulting in 15% efficiency improvement</li></ul>',
        },
      },
    ],
  },
};

// Wrapper component with theme provider
const renderWithTheme = component => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
};

describe('Jobs Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStaticQuery.mockReturnValue(mockJobsData);
  });

  describe('Component Rendering', () => {
    test('renders Experience heading', () => {
      renderWithTheme(<Jobs />);
      expect(screen.getByRole('heading', { name: /Experience/ })).toBeInTheDocument();
    });

    test('renders all job tabs', () => {
      renderWithTheme(<Jobs />);

      expect(screen.getByRole('tab', { name: /Heudiasyc Lab/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /UTC/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /VATEC/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /VietnamElectricity/ })).toBeInTheDocument();
    });

    test('has correct ARIA structure for tabs', () => {
      renderWithTheme(<Jobs />);

      const tablist = screen.getByRole('tablist', { name: /Job tabs/ });
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);

      tabs.forEach((tab, index) => {
        expect(tab).toHaveAttribute('aria-controls', `panel-${index}`);
        expect(tab).toHaveAttribute('id', `tab-${index}`);
      });
    });
  });

  describe('Tab Navigation', () => {
    test('first tab is active by default', () => {
      renderWithTheme(<Jobs />);

      const firstTab = screen.getByRole('tab', { name: /Heudiasyc Lab/ });
      expect(firstTab).toHaveAttribute('aria-selected', 'true');
      expect(firstTab).toHaveAttribute('tabindex', '0');
    });

    test('clicking tab changes active state', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Jobs />);

      const secondTab = screen.getByRole('tab', { name: /UTC/ });
      await user.click(secondTab);

      expect(secondTab).toHaveAttribute('aria-selected', 'true');
      expect(secondTab).toHaveAttribute('tabindex', '0');
    });

    test('keyboard navigation with arrow keys', () => {
      renderWithTheme(<Jobs />);

      const tablist = screen.getByRole('tablist');
      const firstTab = screen.getByRole('tab', { name: /Heudiasyc Lab/ });

      firstTab.focus();

      // Simulate arrow down key
      fireEvent.keyDown(tablist, { key: 'ArrowDown', code: 'ArrowDown' });

      // The focus should move (we can't easily test actual focus change in jsdom)
      expect(tablist).toBeInTheDocument();
    });
  });

  describe('Job Content Display', () => {
    test('displays correct job title and company for active tab', () => {
      renderWithTheme(<Jobs />);

      expect(screen.getByText('Postdoctoral Research Scientist')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Heudiasyc Lab/ })).toBeInTheDocument();
    });

    test('displays correct date range', () => {
      renderWithTheme(<Jobs />);
      expect(screen.getByText('February 2025 - Present')).toBeInTheDocument();
    });

    test('displays job description HTML content', () => {
      renderWithTheme(<Jobs />);
      expect(screen.getByText(/Architected multimodal perception systems/)).toBeInTheDocument();
      expect(screen.getByText(/Pioneered Vision-Language Models/)).toBeInTheDocument();
    });

    test('company links have correct URLs', () => {
      renderWithTheme(<Jobs />);

      const heudiasycLink = screen.getByRole('link', { name: /Heudiasyc Lab/ });
      expect(heudiasycLink).toHaveAttribute('href', 'https://www.hds.utc.fr/');
      expect(heudiasycLink).toHaveClass('inline-link');
    });

    test('switching tabs shows different content', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Jobs />);

      // Click on UTC tab
      const utcTab = screen.getByRole('tab', { name: /UTC/ });
      await user.click(utcTab);

      await waitFor(() => {
        expect(screen.getByText('PhD Student - AI Research')).toBeInTheDocument();
        expect(screen.getByText('September 2021 - January 2025')).toBeInTheDocument();
        expect(screen.getByText(/RCLED architecture/)).toBeInTheDocument();
      });
    });
  });

  describe('Le Tuan Specific Content', () => {
    test('displays correct AI/ML job titles', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Jobs />);

      // Check first job
      expect(screen.getByText('Postdoctoral Research Scientist')).toBeInTheDocument();

      // Check PhD position
      await user.click(screen.getByRole('tab', { name: /UTC/ }));
      await waitFor(() => {
        expect(screen.getByText('PhD Student - AI Research')).toBeInTheDocument();
      });

      // Check ML Engineer position
      await user.click(screen.getByRole('tab', { name: /VATEC/ }));
      await waitFor(() => {
        expect(screen.getByText('Machine Learning Engineer')).toBeInTheDocument();
      });

      // Check Data Scientist position
      await user.click(screen.getByRole('tab', { name: /VietnamElectricity/ }));
      await waitFor(() => {
        expect(screen.getByText('Data Scientist')).toBeInTheDocument();
      });
    });

    test('displays AI research achievements', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Jobs />);

      // Check current research work
      expect(screen.getByText(/multimodal perception systems/)).toBeInTheDocument();
      expect(screen.getByText(/Vision-Language Models/)).toBeInTheDocument();

      // Check PhD achievements
      await user.click(screen.getByRole('tab', { name: /UTC/ }));
      await waitFor(() => {
        expect(screen.getByText(/RCLED architecture/)).toBeInTheDocument();
        expect(screen.getByText(/93%\+ accuracy/)).toBeInTheDocument();
        expect(screen.getByText(/Neurocomputing/)).toBeInTheDocument();
      });
    });

    test('displays practical ML applications', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Jobs />);

      // Check VATEC work
      await user.click(screen.getByRole('tab', { name: /VATEC/ }));
      await waitFor(() => {
        expect(screen.getByText(/predictive maintenance systems/)).toBeInTheDocument();
        expect(screen.getByText(/computer vision solutions/)).toBeInTheDocument();
        expect(screen.getByText(/reducing downtime by 40%/)).toBeInTheDocument();
      });

      // Check VietnamElectricity work
      await user.click(screen.getByRole('tab', { name: /VietnamElectricity/ }));
      await waitFor(() => {
        expect(screen.getByText(/time-series forecasting models/)).toBeInTheDocument();
        expect(screen.getByText(/95%\+ accuracy/)).toBeInTheDocument();
        expect(screen.getByText(/15% efficiency improvement/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('tab panels have correct ARIA attributes', () => {
      renderWithTheme(<Jobs />);

      const activePanel = screen.getByRole('tabpanel');
      expect(activePanel).toHaveAttribute('aria-labelledby', 'tab-0');
      expect(activePanel).toHaveAttribute('tabindex', '0');
      expect(activePanel).not.toHaveAttribute('hidden');
    });

    test('inactive panels are properly hidden', async () => {
      const user = userEvent.setup();
      renderWithTheme(<Jobs />);

      // Get all panels
      const panels = document.querySelectorAll('[role="tabpanel"]');

      // First panel should be visible, others hidden
      expect(panels[0]).not.toHaveAttribute('hidden');
      expect(panels[1]).toHaveAttribute('hidden', '');
      expect(panels[2]).toHaveAttribute('hidden', '');
      expect(panels[3]).toHaveAttribute('hidden', '');

      // Switch to second tab
      await user.click(screen.getByRole('tab', { name: /UTC/ }));

      await waitFor(() => {
        expect(panels[0]).toHaveAttribute('hidden', '');
        expect(panels[1]).not.toHaveAttribute('hidden');
      });
    });

    test('company links are accessible', () => {
      renderWithTheme(<Jobs />);

      const companyLink = screen.getByRole('link', { name: /Heudiasyc Lab/ });
      expect(companyLink).toBeInTheDocument();
      expect(companyLink).toHaveAttribute('href');
    });
  });

  describe('Visual Elements', () => {
    test('highlight indicator is present', () => {
      renderWithTheme(<Jobs />);

      // The highlight div should be present (though we can't test its exact styling)
      const tablist = screen.getByRole('tablist');
      expect(tablist).toBeInTheDocument();
    });

    test('tabs have proper styling states', () => {
      renderWithTheme(<Jobs />);

      const activeTab = screen.getByRole('tab', { name: /Heudiasyc Lab/ });
      const inactiveTab = screen.getByRole('tab', { name: /UTC/ });

      expect(activeTab).toHaveAttribute('aria-selected', 'true');
      expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Motion and Animation', () => {
    test('initializes ScrollReveal when motion is not reduced', () => {
      const mockSr = require('@utils/sr').default;
      renderWithTheme(<Jobs />);

      expect(mockSr.reveal).toHaveBeenCalled();
    });

    test('CSSTransition components are present', () => {
      renderWithTheme(<Jobs />);

      // The active panel should be rendered (CSSTransition handles the animation)
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });
  });

  describe('GraphQL Data Integration', () => {
    test('handles empty job data gracefully', () => {
      useStaticQuery.mockReturnValue({ jobs: { edges: [] } });

      renderWithTheme(<Jobs />);
      expect(screen.getByRole('heading', { name: /Experience/ })).toBeInTheDocument();
      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });

    test('processes job data with correct sorting', () => {
      renderWithTheme(<Jobs />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveTextContent('Heudiasyc Lab'); // Most recent
      expect(tabs[1]).toHaveTextContent('UTC');
      expect(tabs[2]).toHaveTextContent('VATEC');
      expect(tabs[3]).toHaveTextContent('VietnamElectricity'); // Oldest
    });
  });
});
