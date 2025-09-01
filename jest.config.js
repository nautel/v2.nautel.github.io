module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@components(.*)$': '<rootDir>/src/components$1',
    '^@config$': '<rootDir>/src/config',
    '^@utils(.*)$': '<rootDir>/src/utils$1',
    '^@hooks(.*)$': '<rootDir>/src/hooks$1',
    '^@styles(.*)$': '<rootDir>/src/styles$1',
    '^@contexts(.*)$': '<rootDir>/src/contexts$1',
    '^@services(.*)$': '<rootDir>/src/services$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['babel-preset-gatsby'] }],
  },
  testPathIgnorePatterns: ['node_modules', '\\.cache', '<rootDir>.*/public'],
  transformIgnorePatterns: [
    'node_modules/(?!(gatsby|gatsby-plugin-image|gatsby-source-filesystem)/)',
  ],
  globals: {
    __PATH_PREFIX__: '',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.stories.{js,jsx}',
    '!src/pages/**',
    '!src/templates/**',
    '!src/**/__tests__/**',
    '!src/**/test-utils.js',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Specific thresholds for theme system components
    'src/contexts/ThemeContext.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/components/ThemeToggle.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/components/ThemePreview.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/components/ThemeSelector.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/hooks/useSystemTheme.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'src/hooks/useThemeAPI.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/hooks/useThemeTransition.js': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    'src/services/themeAPI.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  // Test categorization and organization
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx}',
  ],
  // Custom test groups for different types of testing
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.test.js',
        '<rootDir>/src/**/!(integration|accessibility|visual|performance)/**/*.test.js',
      ],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/src/**/__tests__/integration/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
      testTimeout: 10000, // Longer timeout for integration tests
    },
    {
      displayName: 'accessibility',
      testMatch: ['<rootDir>/src/**/__tests__/accessibility/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
      testTimeout: 15000, // Longer timeout for accessibility tests
    },
    {
      displayName: 'visual',
      testMatch: ['<rootDir>/src/**/__tests__/visual/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    },
    {
      displayName: 'performance',
      testMatch: ['<rootDir>/src/**/__tests__/performance/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
      testTimeout: 30000, // Longer timeout for performance tests
    },
  ],
  // Performance and memory management
  maxWorkers: '50%',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Enhanced reporting
  verbose: true,
  collectCoverage: false, // Set to true when generating coverage reports
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/__tests__/',
    '/cypress/',
    '.cache',
    'public',
  ],
  // Test environment configuration
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  // Watch mode configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  // Snapshot testing
  snapshotSerializers: ['enzyme-to-json/serializer'],
  // Performance monitoring
  detectOpenHandles: true,
  detectLeaks: true,
  // Theme testing specific configuration
  globals: {
    __PATH_PREFIX__: '',
    __THEME_TESTING__: true,
  },
};
