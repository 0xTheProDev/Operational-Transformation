const baseConfig = require("../../jest.config");
const package = require("./package.json");

module.exports = {
  ...baseConfig,
  // The directory where Jest should output its coverage files
  coverageDirectory: `<rootDir>/coverage-${package.rootDir}`,
  // Name should be displayed on Test Report
  displayName: "Firebase Adapter",
  // Name of the package
  name: package.name,
  // Run tests from one or more projects
  projects: null,
  // The root directory that Jest should scan for tests and modules within
  rootDir: "../..",
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: [
    `<rootDir>/packages/${package.rootDir}/__setup__/jest-setup.ts`,
  ],
  // The glob patterns Jest uses to detect test files
  testMatch: [`<rootDir>/packages/${package.rootDir}/__tests__/*.[jt]s?(x)`],
};
