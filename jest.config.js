module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  globalSetup: './test-setup/before-tests.js',
  globalTeardown: './test-setup/after-tests.js',
};
