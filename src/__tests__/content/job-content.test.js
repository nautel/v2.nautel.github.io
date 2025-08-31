// Mock gray-matter for testing
const mockMatter = jest.fn();

// Mock job content files
const mockJobFiles = {
  Heudiasyc: `---
date: '2025-02-01'
title: 'Postdoctoral Research Scientist'
company: 'Heudiasyc Lab'
location: 'Compiègne, France'
range: 'February 2025 - Present'
url: 'https://www.hds.utc.fr/'
---

- Architected multimodal perception systems integrating LiDAR point clouds and camera data for real-time object detection in autonomous vehicles, processing 100K+ sensor readings daily
- Pioneered Vision-Language Models (VLMs) for open-vocabulary detection of personal mobility devices, achieving superior generalization to previously unseen vehicle categories  
- Optimized 3D detection pipelines for sparse point cloud data, improving small object detection accuracy through advanced preprocessing techniques
- Deployed production-ready AI agents in simulated urban environments, reducing physical testing requirements and accelerating development cycles`,

  UTC: `---
date: '2021-10-01'
title: 'PhD Research Scientist'
company: 'UTC'
location: 'Compiègne, France'
range: 'October 2021 - January 2025'
url: 'https://www.utc.fr/'
---

- Invented RCLED (Robust Convolutional LSTM Encoder-Decoder) architecture for unsupervised anomaly detection in multivariate time-series data, establishing new state-of-the-art performance with 93%+ accuracy using advanced machine learning algorithms
- Authored first-author publication in Neurocomputing (Q1, IF: 5.7) introducing novel deep learning methodologies for industrial anomaly detection using neural networks and AI optimization
- Engineered synthetic anomaly generation frameworks (CSA & GSA) for industrial applications, eliminating manual annotation overhead in production datasets
- Orchestrated distributed training infrastructure using PyTorch for foundation model pre-training, implementing advanced optimization techniques for efficient large-scale inference
- Established robust evaluation protocols and benchmarking standards for time-series anomaly detection, contributing open-source tools adopted by research community`,

  VATEC: `---
date: '2020-06-01'
title: 'Machine Learning Engineer'
company: 'VATEC'
location: 'Ho Chi Minh City, Vietnam'
range: 'June 2020 - August 2021'
url: '#'
---

- Designed predictive maintenance systems for renewable energy infrastructure, reducing equipment downtime by 40% through advanced time-series analysis and AI-powered machine learning algorithms with IoT sensor integration
- Implemented computer vision solutions for automated quality control in solar panel manufacturing, achieving 99%+ defect detection accuracy using deep convolutional neural networks
- Developed real-time anomaly detection algorithms for wind turbine operations, preventing critical failures and saving $2M+ in potential equipment damage
- Built scalable ML pipelines using Apache Spark and Docker, processing terabytes of sensor data daily from 500+ renewable energy installations across Vietnam`,

  VietnamElectricity: `---
date: '2019-01-01'
title: 'Data Scientist'
company: 'VietnamElectricity'
location: 'Hanoi, Vietnam'
range: 'January 2019 - May 2020'
url: '#'
---

- Built time-series forecasting models for electricity demand prediction with 95%+ accuracy, enabling optimal power generation scheduling and reducing operational costs by $5M annually
- Optimized power grid load balancing using machine learning algorithms, resulting in 15% improvement in energy distribution efficiency across northern Vietnam
- Developed automated fault detection systems for transmission lines using satellite imagery and computer vision, reducing manual inspection costs by 60%
- Implemented demand response optimization models that successfully managed peak load events during extreme weather conditions, preventing widespread blackouts`,
};

// Simple matter parser for testing
const matter = content => {
  const parts = content.split('---');
  const frontmatterStr = parts[1];
  const body = parts.slice(2).join('---').trim();

  // Parse YAML-like frontmatter
  const frontmatter = {};
  frontmatterStr.split('\n').forEach(line => {
    const match = line.match(/^(.+?):\s*['"]?(.*?)['"]?$/);
    if (match) {
      frontmatter[match[1]] = match[2];
    }
  });

  return { data: frontmatter, content: body };
};

describe('Job Content Files', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Content File Structure', () => {
    test('all job files have required frontmatter fields', () => {
      Object.entries(mockJobFiles).forEach(([company, content]) => {
        const parsed = matter(content);
        const frontmatter = parsed.data;

        expect(frontmatter.date).toBeDefined();
        expect(frontmatter.title).toBeDefined();
        expect(frontmatter.company).toBeDefined();
        expect(frontmatter.location).toBeDefined();
        expect(frontmatter.range).toBeDefined();
        expect(frontmatter.url).toBeDefined();

        // Validate data types
        expect(typeof frontmatter.date).toBe('string');
        expect(typeof frontmatter.title).toBe('string');
        expect(typeof frontmatter.company).toBe('string');
        expect(typeof frontmatter.location).toBe('string');
        expect(typeof frontmatter.range).toBe('string');
        expect(typeof frontmatter.url).toBe('string');
      });
    });

    test('all job files have non-empty content body', () => {
      Object.entries(mockJobFiles).forEach(([company, content]) => {
        const parsed = matter(content);
        const body = parsed.content.trim();

        expect(body).toBeTruthy();
        expect(body.length).toBeGreaterThan(0);
        expect(body.includes('-')).toBe(true); // Should have bullet points
      });
    });

    test('dates are in correct ISO format', () => {
      Object.entries(mockJobFiles).forEach(([company, content]) => {
        const parsed = matter(content);
        const date = parsed.data.date;

        // Should be YYYY-MM-DD format
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Should be a valid date
        const dateObj = new Date(date);
        expect(dateObj.toString()).not.toBe('Invalid Date');
      });
    });
  });

  describe('Le Tuan Specific Content Validation', () => {
    test('Heudiasyc content includes current AI research', () => {
      const parsed = matter(mockJobFiles.Heudiasyc);

      expect(parsed.data.title).toBe('Postdoctoral Research Scientist');
      expect(parsed.data.company).toBe('Heudiasyc Lab');
      expect(parsed.data.url).toBe('https://www.hds.utc.fr/');
      expect(parsed.data.range).toContain('2025');

      const content = parsed.content;
      expect(content).toContain('multimodal perception systems');
      expect(content).toContain('LiDAR');
      expect(content).toContain('Vision-Language Models');
      expect(content).toContain('autonomous vehicles');
    });

    test('UTC content includes PhD research achievements', () => {
      const parsed = matter(mockJobFiles.UTC);

      expect(parsed.data.title).toBe('PhD Research Scientist');
      expect(parsed.data.company).toBe('UTC');
      expect(parsed.data.url).toBe('https://www.utc.fr/');

      const content = parsed.content;
      expect(content).toContain('RCLED');
      expect(content).toContain('93%+ accuracy');
      expect(content).toContain('Neurocomputing');
      expect(content).toContain('Q1, IF: 5.7');
      expect(content).toContain('PyTorch');
    });

    test('VATEC content includes ML engineering experience', () => {
      const parsed = matter(mockJobFiles.VATEC);

      expect(parsed.data.title).toBe('Machine Learning Engineer');
      expect(parsed.data.company).toBe('VATEC');
      expect(parsed.data.location).toBe('Ho Chi Minh City, Vietnam');

      const content = parsed.content;
      expect(content).toContain('predictive maintenance');
      expect(content).toContain('computer vision');
      expect(content).toContain('40%');
      expect(content).toContain('renewable energy');
    });

    test('VietnamElectricity content includes data science achievements', () => {
      const parsed = matter(mockJobFiles.VietnamElectricity);

      expect(parsed.data.title).toBe('Data Scientist');
      expect(parsed.data.company).toBe('VietnamElectricity');
      expect(parsed.data.location).toBe('Hanoi, Vietnam');

      const content = parsed.content;
      expect(content).toContain('time-series forecasting');
      expect(content).toContain('95%+ accuracy');
      expect(content).toContain('15% improvement');
      expect(content).toContain('power grid');
    });
  });

  describe('Content Quality Validation', () => {
    test('each job has multiple bullet points with detailed descriptions', () => {
      Object.entries(mockJobFiles).forEach(([company, content]) => {
        const parsed = matter(content);
        const body = parsed.content;

        // Count bullet points
        const bulletPoints = body.split('\n').filter(line => line.trim().startsWith('-'));
        expect(bulletPoints.length).toBeGreaterThanOrEqual(3);

        // Each bullet point should be substantial
        bulletPoints.forEach(bullet => {
          const text = bullet.replace(/^-\s*/, '').trim();
          expect(text.length).toBeGreaterThan(50); // Detailed descriptions
        });
      });
    });

    test('content includes quantifiable achievements where appropriate', () => {
      Object.entries(mockJobFiles).forEach(([company, content]) => {
        const parsed = matter(content);
        const body = parsed.content;

        // Should have at least one quantifiable metric (percentage, number, etc.)
        const hasQuantifiableMetrics = /\d+(%|\+|K\+|M\+|\$)/.test(body);
        expect(hasQuantifiableMetrics).toBe(true);
      });
    });

    test('content uses professional technical language', () => {
      const technicalTerms = [
        'machine learning',
        'ML',
        'AI',
        'deep learning',
        'neural networks',
        'computer vision',
        'time-series',
        'anomaly detection',
        'predictive',
        'optimization',
        'algorithms',
        'models',
        'architecture',
        'framework',
      ];

      Object.entries(mockJobFiles).forEach(([company, content]) => {
        const parsed = matter(content);
        const body = parsed.content.toLowerCase();

        // Should contain at least one technical term
        const foundTerms = technicalTerms.filter(term => body.includes(term));
        expect(foundTerms.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Chronological Ordering', () => {
    test('jobs are ordered chronologically (most recent first)', () => {
      const jobs = Object.entries(mockJobFiles).map(([company, content]) => {
        const parsed = matter(content);
        return {
          company,
          date: new Date(parsed.data.date),
          frontmatter: parsed.data,
        };
      });

      // Sort by date DESC (most recent first)
      const sortedJobs = [...jobs].sort((a, b) => b.date.getTime() - a.date.getTime());

      expect(sortedJobs[0].company).toBe('Heudiasyc'); // 2025
      expect(sortedJobs[1].company).toBe('UTC'); // 2021
      expect(sortedJobs[2].company).toBe('VATEC'); // 2020
      expect(sortedJobs[3].company).toBe('VietnamElectricity'); // 2019
    });

    test('date ranges are consistent with chronological order', () => {
      const jobs = [
        { company: 'Heudiasyc', range: 'February 2025 - Present' },
        { company: 'UTC', range: 'October 2021 - January 2025' },
        { company: 'VATEC', range: 'June 2020 - August 2021' },
        { company: 'VietnamElectricity', range: 'January 2019 - May 2020' },
      ];

      // Verify ranges make chronological sense
      expect(jobs[0].range).toContain('2025');
      expect(jobs[1].range).toContain('2021');
      expect(jobs[2].range).toContain('2020');
      expect(jobs[3].range).toContain('2019');
    });
  });

  describe('URL Validation', () => {
    test('external URLs are properly formatted', () => {
      const heudiasycParsed = matter(mockJobFiles.Heudiasyc);
      const utcParsed = matter(mockJobFiles.UTC);

      expect(heudiasycParsed.data.url).toMatch(/^https?:\/\//);
      expect(utcParsed.data.url).toMatch(/^https?:\/\//);

      // Validate specific URLs
      expect(heudiasycParsed.data.url).toBe('https://www.hds.utc.fr/');
      expect(utcParsed.data.url).toBe('https://www.utc.fr/');
    });

    test('placeholder URLs are used for companies without public websites', () => {
      const vatecParsed = matter(mockJobFiles.VATEC);
      const vietnamElecParsed = matter(mockJobFiles.VietnamElectricity);

      expect(vatecParsed.data.url).toBe('#');
      expect(vietnamElecParsed.data.url).toBe('#');
    });
  });

  describe('Geographic Information', () => {
    test('locations include correct geographic information', () => {
      const jobs = Object.entries(mockJobFiles).map(([company, content]) => {
        const parsed = matter(content);
        return {
          company,
          location: parsed.data.location,
        };
      });

      const locationMap = {
        Heudiasyc: 'Compiègne, France',
        UTC: 'Compiègne, France',
        VATEC: 'Ho Chi Minh City, Vietnam',
        VietnamElectricity: 'Hanoi, Vietnam',
      };

      jobs.forEach(job => {
        expect(job.location).toBe(locationMap[job.company]);
      });
    });

    test('locations follow consistent format (City, Country)', () => {
      Object.entries(mockJobFiles).forEach(([company, content]) => {
        const parsed = matter(content);
        const location = parsed.data.location;

        expect(location).toMatch(/^.+,\s.+$/); // Should have "City, Country" format
        expect(location.split(',').length).toBe(2);
      });
    });
  });

  describe('Content Accessibility', () => {
    test('content is structured with proper markdown formatting', () => {
      Object.entries(mockJobFiles).forEach(([company, content]) => {
        const parsed = matter(content);
        const body = parsed.content;

        // Should use bullet points (-)
        expect(body).toContain('- ');

        // Should not have orphaned formatting
        expect(body.includes('--')).toBe(false);
        expect(body.includes('  -')).toBe(false); // No double spaces before bullets
      });
    });

    test('technical terms are properly capitalized', () => {
      const properCapitalization = {
        pytorch: 'PyTorch',
        lidar: 'LiDAR',
        ai: 'AI',
        ml: 'ML',
        iot: 'IoT',
      };

      Object.entries(mockJobFiles).forEach(([company, content]) => {
        const parsed = matter(content);
        const body = parsed.content;

        Object.entries(properCapitalization).forEach(([incorrect, correct]) => {
          if (body.toLowerCase().includes(incorrect)) {
            expect(body).toContain(correct);
          }
        });
      });
    });
  });
});
