module.exports = ({ entryFile, externals, libraryName, outDir }) => ({
  devtool: "source-map",
  entry: entryFile,
  externals,
  mode: "production",
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.build.json",
            },
          },
        ],
      },
    ],
  },
  output: {
    library: {
      name: libraryName,
      type: "umd",
    },
    filename: "index.js",
    path: outDir,
  },
  resolve: {
    extensions: [".tsx", ".ts"],
  },
  stats: true,
  target: ["web", "es5"],
});
