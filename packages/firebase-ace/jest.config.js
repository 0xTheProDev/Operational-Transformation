const baseConfig = require("../../jest.config");
const package = require("./package.json");

module.exports = {
  ...baseConfig,
  // The directory where Jest should output its coverage files
  coverageDirectory: `<rootDir>/coverage-${package.rootDir}`,
  // Name should be displayed on Test Report
  displayName: "Firebase Ace",
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "@otjs/ace": `<rootDir>/packages/${package.rootDir}/__mocks__/ace-adapter.mock`,
    "@otjs/firebase-plaintext": `<rootDir>/packages/${package.rootDir}/__mocks__/firebase-adapter.mock`,
    "@otjs/plaintext-editor": `<rootDir>/packages/${package.rootDir}/__mocks__/editor-client.mock`,
    ...baseConfig.moduleNameMapper,
  },
  // Name of the package
  name: package.name,
  // Run tests from one or more projects
  projects: null,
  // The root directory that Jest should scan for tests and modules within
  rootDir: "../..",
  // The glob patterns Jest uses to detect test files
  testMatch: [`<rootDir>/packages/${package.rootDir}/__tests__/*.[jt]s?(x)`],
};
