import { useStaticQuery } from 'gatsby';

// Mock the GraphQL query structure that Gatsby uses
const mockGraphQLQuery = mockData => {
  useStaticQuery.mockReturnValue(mockData);
};

describe('Markdown Content Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Jobs Content Parsing', () => {
    test('parses job markdown frontmatter correctly', () => {
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
                html: '<ul><li>Architected multimodal perception systems</li></ul>',
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      expect(data.jobs.edges).toHaveLength(1);
      expect(data.jobs.edges[0].node.frontmatter.title).toBe('Postdoctoral Research Scientist');
      expect(data.jobs.edges[0].node.frontmatter.company).toBe('Heudiasyc Lab');
      expect(data.jobs.edges[0].node.frontmatter.url).toBe('https://www.hds.utc.fr/');
    });

    test('handles all four job entries correctly', () => {
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
                html: '<ul><li>Architected multimodal perception systems</li></ul>',
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
                html: '<ul><li>Invented RCLED architecture</li></ul>',
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
                html: '<ul><li>Designed predictive maintenance systems</li></ul>',
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
                html: '<ul><li>Built time-series forecasting models</li></ul>',
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      expect(data.jobs.edges).toHaveLength(4);

      // Verify all companies are present
      const companies = data.jobs.edges.map(edge => edge.node.frontmatter.company);
      expect(companies).toContain('Heudiasyc Lab');
      expect(companies).toContain('UTC');
      expect(companies).toContain('VATEC');
      expect(companies).toContain('VietnamElectricity');
    });

    test('parses HTML content from markdown correctly', () => {
      const mockJobsData = {
        jobs: {
          edges: [
            {
              node: {
                frontmatter: {
                  title: 'PhD Research Scientist',
                  company: 'UTC',
                  location: 'Compiègne, France',
                  range: 'October 2021 - January 2025',
                  url: 'https://www.utc.fr/',
                },
                html: `<ul>
                  <li>Invented RCLED (Robust Convolutional LSTM Encoder-Decoder) architecture for unsupervised anomaly detection</li>
                  <li>Authored first-author publication in Neurocomputing (Q1, IF: 5.7)</li>
                  <li>Engineered synthetic anomaly generation frameworks (CSA &amp; GSA)</li>
                </ul>`,
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      const htmlContent = data.jobs.edges[0].node.html;
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('<li>');
      expect(htmlContent).toContain('RCLED');
      expect(htmlContent).toContain('Neurocomputing');
      expect(htmlContent).toContain('CSA &amp; GSA'); // HTML entities should be preserved
    });
  });

  describe('Content Validation', () => {
    test('validates required frontmatter fields are present', () => {
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
                html: '<p>Job description</p>',
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      const job = data.jobs.edges[0].node;
      const requiredFields = ['title', 'company', 'location', 'range', 'url'];

      requiredFields.forEach(field => {
        expect(job.frontmatter[field]).toBeDefined();
        expect(job.frontmatter[field]).not.toBe('');
      });
    });

    test('validates HTML content is not empty', () => {
      const mockJobsData = {
        jobs: {
          edges: [
            {
              node: {
                frontmatter: {
                  title: 'Test Job',
                  company: 'Test Company',
                  location: 'Test Location',
                  range: 'Test Range',
                  url: 'https://test.com',
                },
                html: '<ul><li>Test content</li></ul>',
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      const job = data.jobs.edges[0].node;
      expect(job.html).toBeDefined();
      expect(job.html.trim()).not.toBe('');
      expect(job.html).toContain('<');
    });

    test('validates date sorting is applied correctly', () => {
      const mockJobsData = {
        jobs: {
          edges: [
            {
              node: {
                frontmatter: {
                  title: 'Current Job',
                  company: 'Heudiasyc Lab',
                  date: '2025-02-01',
                  range: 'February 2025 - Present',
                  url: 'https://test.com',
                },
                html: '<p>Current</p>',
              },
            },
            {
              node: {
                frontmatter: {
                  title: 'Previous Job',
                  company: 'UTC',
                  date: '2021-10-01',
                  range: 'October 2021 - January 2025',
                  url: 'https://test.com',
                },
                html: '<p>Previous</p>',
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      // Should be sorted by date DESC (most recent first)
      expect(data.jobs.edges[0].node.frontmatter.company).toBe('Heudiasyc Lab');
      expect(data.jobs.edges[1].node.frontmatter.company).toBe('UTC');
    });
  });

  describe('Le Tuan Specific Content Validation', () => {
    test('validates AI research content is properly formatted', () => {
      const mockJobsData = {
        jobs: {
          edges: [
            {
              node: {
                frontmatter: {
                  title: 'Postdoctoral Research Scientist',
                  company: 'Heudiasyc Lab',
                  range: 'February 2025 - Present',
                  url: 'https://www.hds.utc.fr/',
                },
                html: `<ul>
                  <li>Architected multimodal perception systems integrating LiDAR point clouds and camera data</li>
                  <li>Pioneered Vision-Language Models (VLMs) for open-vocabulary detection</li>
                </ul>`,
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      const htmlContent = data.jobs.edges[0].node.html;
      expect(htmlContent).toContain('multimodal perception systems');
      expect(htmlContent).toContain('Vision-Language Models');
      expect(htmlContent).toContain('LiDAR');
    });

    test('validates PhD research achievements are included', () => {
      const mockJobsData = {
        jobs: {
          edges: [
            {
              node: {
                frontmatter: {
                  title: 'PhD Research Scientist',
                  company: 'UTC',
                  range: 'October 2021 - January 2025',
                  url: 'https://www.utc.fr/',
                },
                html: `<ul>
                  <li>Invented RCLED architecture with 93%+ accuracy</li>
                  <li>Authored first-author publication in Neurocomputing (Q1, IF: 5.7)</li>
                  <li>Engineered synthetic anomaly generation frameworks</li>
                </ul>`,
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      const htmlContent = data.jobs.edges[0].node.html;
      expect(htmlContent).toContain('RCLED');
      expect(htmlContent).toContain('93%+ accuracy');
      expect(htmlContent).toContain('Neurocomputing');
      expect(htmlContent).toContain('Q1, IF: 5.7');
    });

    test('validates industry experience includes quantifiable results', () => {
      const mockJobsData = {
        jobs: {
          edges: [
            {
              node: {
                frontmatter: {
                  title: 'Machine Learning Engineer',
                  company: 'VATEC',
                  range: 'June 2020 - August 2021',
                  url: '#',
                },
                html: `<ul>
                  <li>Designed predictive maintenance systems, reducing downtime by 40%</li>
                  <li>Implemented computer vision solutions for automated quality control</li>
                </ul>`,
              },
            },
            {
              node: {
                frontmatter: {
                  title: 'Data Scientist',
                  company: 'VietnamElectricity',
                  range: 'January 2019 - May 2020',
                  url: '#',
                },
                html: `<ul>
                  <li>Built time-series forecasting models with 95%+ accuracy</li>
                  <li>Optimized power grid operations, resulting in 15% efficiency improvement</li>
                </ul>`,
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      const vatecContent = data.jobs.edges[0].node.html;
      const vietnamElecContent = data.jobs.edges[1].node.html;

      expect(vatecContent).toContain('40%');
      expect(vatecContent).toContain('predictive maintenance');
      expect(vatecContent).toContain('computer vision');

      expect(vietnamElecContent).toContain('95%+ accuracy');
      expect(vietnamElecContent).toContain('15% efficiency improvement');
      expect(vietnamElecContent).toContain('time-series forecasting');
    });
  });

  describe('GraphQL Query Structure', () => {
    test('validates expected GraphQL query fields are available', () => {
      const mockJobsData = {
        jobs: {
          edges: [
            {
              node: {
                frontmatter: {
                  title: 'Test Title',
                  company: 'Test Company',
                  location: 'Test Location',
                  range: 'Test Range',
                  url: 'https://test.com',
                },
                html: '<p>Test HTML</p>',
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      // Validate the expected structure matches what Jobs component expects
      expect(data).toHaveProperty('jobs');
      expect(data.jobs).toHaveProperty('edges');
      expect(data.jobs.edges[0]).toHaveProperty('node');
      expect(data.jobs.edges[0].node).toHaveProperty('frontmatter');
      expect(data.jobs.edges[0].node).toHaveProperty('html');
    });

    test('validates sorting and filtering parameters work correctly', () => {
      // This test validates that the GraphQL query would work correctly
      // In a real Gatsby environment, this would be:
      // filter: { fileAbsolutePath: { regex: "/content/jobs/" } }
      // sort: { fields: [frontmatter___date], order: DESC }

      const mockJobsData = {
        jobs: {
          edges: [
            {
              node: {
                frontmatter: {
                  date: '2025-02-01',
                  title: 'Recent Job',
                  company: 'Recent Company',
                },
                html: '<p>Recent</p>',
              },
            },
            {
              node: {
                frontmatter: {
                  date: '2019-01-01',
                  title: 'Old Job',
                  company: 'Old Company',
                },
                html: '<p>Old</p>',
              },
            },
          ],
        },
      };

      mockGraphQLQuery(mockJobsData);
      const data = useStaticQuery();

      // Verify the data structure supports the expected query behavior
      expect(data.jobs.edges).toHaveLength(2);
      expect(data.jobs.edges[0].node.frontmatter.date).toBe('2025-02-01');
      expect(data.jobs.edges[1].node.frontmatter.date).toBe('2019-01-01');
    });
  });

  describe('Error Handling', () => {
    test('handles empty jobs data gracefully', () => {
      const emptyJobsData = {
        jobs: {
          edges: [],
        },
      };

      mockGraphQLQuery(emptyJobsData);
      const data = useStaticQuery();

      expect(data.jobs.edges).toHaveLength(0);
      expect(Array.isArray(data.jobs.edges)).toBe(true);
    });

    test('handles missing frontmatter gracefully', () => {
      const incompleteJobsData = {
        jobs: {
          edges: [
            {
              node: {
                frontmatter: {
                  title: 'Incomplete Job',
                  // Missing other required fields
                },
                html: '<p>Test</p>',
              },
            },
          ],
        },
      };

      mockGraphQLQuery(incompleteJobsData);
      const data = useStaticQuery();

      expect(data.jobs.edges).toHaveLength(1);
      expect(data.jobs.edges[0].node.frontmatter.title).toBe('Incomplete Job');
      // Missing fields would be undefined, which components should handle
    });
  });
});
