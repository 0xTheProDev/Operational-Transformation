const path = require("path");
const webpack = require("webpack");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const getFbConfig = () => {
  const rawFbConfig = require("./firebase.json");

  /** If running using Emulators */
  if (rawFbConfig.emulators) {
    const host = "localhost";
    const port = rawFbConfig.emulators.database.port;
    const dbName = rawFbConfig.emulators.database.name;

    const databaseURL = `http://${host}:${port}?ns=${dbName}`;

    return {
      databaseURL,
    };
  }

  /** `firebase.json` contains original Database URL */
  return {
    databaseURL: rawFbConfig.databaseURL,
  };
};

module.exports = (env, argv) => {
  const mode = argv.mode || "development";
  const port = argv.port || 8000;
  const host = argv.host || "0.0.0.0";

  return {
    mode,
    context: __dirname,
    target: "web",
    entry: {
      "firebase-monaco": {
        import: "./src/firebase-monaco.ts",
        dependOn: ["fb-monaco"],
      },
      "fb-monaco": ["@otjs/fb-monaco"],
    },
    output: {
      chunkFilename: "[name].[chunkhash:8].js",
      clean: true,
      filename: "[name].js",
      path: path.resolve(__dirname, "./lib"),
    },
    devServer: {
      host,
      port,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "X-Requested-With, content-type, Authorization",
      },
      http2: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".json"],
    },
    stats: {
      children: !!env.VERBOSE,
      errorDetails: !!env.VERBOSE,
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                configFile: "tsconfig.build.json",
              },
            },
          ],
        },
        {
          test: /\.js$/,
          use: ["source-map-loader"],
          enforce: "pre",
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(html|woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.FIREBASE_CONFIG": JSON.stringify(getFbConfig()),
      }),
      new MonacoWebpackPlugin({
        globalAPI: true,
      }),
    ],
  };
};
