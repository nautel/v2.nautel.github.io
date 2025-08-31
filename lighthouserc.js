module.exports = {
  ci: {
    collect: {
      url: [
        'https://nautel.github.io/v4/',
        'https://nautel.github.io/v4/archive/',
      ],
      startServerCommand: 'npm run serve',
      startServerReadyPattern: 'You can now view',
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': 'off', // PWA not required
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};