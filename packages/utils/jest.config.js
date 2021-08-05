const baseConfig = require("../../jest.config");
const package = require("./package.json");

module.exports = {
  ...baseConfig,
  // Name should be displayed on Test Report
  displayName: "Utility Functions",
  // Name of the package
  name: package.name,
  // The root directory that Jest should scan for tests and modules within
  rootDir: "../..",
  // The glob patterns Jest uses to detect test files
  testMatch: [`<rootDir>/packages/${package.rootDir}/__tests__/*.[jt]s?(x)`],
};
