const baseConfig = require("../../jest.config");
const package = require("./package.json");

module.exports = {
  ...baseConfig,
  // The directory where Jest should output its coverage files
  coverageDirectory: "<rootDir>/coverage-monaco",
  // Name should be displayed on Test Report
  displayName: "Monaco Adapter",
  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "@otjs/monaco/(.*)": "<rootDir>/packages/monaco/$1",
    "monaco-editor":
      "<rootDir>/node_modules/monaco-editor/esm/vs/editor/editor.api.js",
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
  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.([jt]sx?)$": "babel-jest",
  },
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!(monaco-editor)/)"],
};
