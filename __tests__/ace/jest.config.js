const baseConfig = require("../../jest.config");
const package = require("./package.json");

module.exports = {
  ...baseConfig,
  // The directory where Jest should output its coverage files
  coverageDirectory: "<rootDir>/coverage-ace",
  // Name should be displayed on Test Report
  displayName: "Ace Adapter",
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "@otjs/ace/(.*)": "<rootDir>/packages/ace/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    ...baseConfig.moduleNameMapper,
  },
  // Run tests from one or more projects
  projects: null,
  // The root directory that Jest should scan for tests and modules within
  rootDir: "../..",
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: [`<rootDir>/${package.rootDir}/__setup__/jest.setup.ts`],
  // The test environment that will be used for testing
  testEnvironment: "jsdom",
  // The glob patterns Jest uses to detect test files
  testMatch: [`<rootDir>/${package.rootDir}/__tests__/*.[jt]s?(x)`],
};
