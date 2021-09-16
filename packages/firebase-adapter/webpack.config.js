const path = require("path");
const package = require("./package.json");
const getWebpackConfig = require("../../webpack.config");

module.exports = getWebpackConfig({
  entryFile: "./src/index.ts",
  externals: [
    "@operational-transformation/plaintext",
    "@operational-transformation/plaintext-editor",
    "firebase/database",
    "mitt",
  ],
  libraryName: package.name,
  outDir: path.resolve(__dirname, "lib"),
});