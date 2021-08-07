const path = require("path");
const package = require("./package.json");

module.exports = {
  devtool: "source-map",
  entry: "./src/index.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    library: {
      name: package.name,
      type: "commonjs",
    },
    filename: "index.js",
    path: path.resolve(__dirname, "lib"),
  },
  resolve: {
    extensions: [".tsx", ".ts"],
  },
  target: ["web", "es5"],
};
