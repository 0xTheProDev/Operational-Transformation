const baseConfig = require("../../jest.config");

module.exports = {
  ...baseConfig,
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  // Run tests from one or more projects
  projects: undefined, // Reset projects value
};
