const path = require("path");
const package = require("./package.json");
const getWebpackConfig = require("../../webpack.config");

module.exports = getWebpackConfig({
  entryFile: "./src/index.ts",
  externals: [
    "firebase/database",
    "mitt",
    "@operational-transformation/plaintext",
    "@operational-transformation/plaintext-editor",
  ],
  libraryName: package.name,
  outDir: path.resolve(__dirname, "lib"),
});
