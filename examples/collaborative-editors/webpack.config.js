const bodyParser = require("body-parser");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");
const Pusher = require("pusher");
const webpack = require("webpack");
const uuid = require("uuid").v4;

const PUSHER_CONFIG = require("./pusher.json");

const getFbConfig = () => {
  const rawFbConfig = require("./firebase.json");

  /** If running using Emulators */
  if (rawFbConfig.emulators) {
    const host = "localhost";
    const { port, name } = rawFbConfig.emulators.database;

    const databaseURL = `http://${host}:${port}?ns=${name}`;

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
      ace: {
        import: "./src/firebase-ace.ts",
        dependOn: ["firebase-ace"],
      },
      monaco: {
        import: "./src/firebase-monaco.ts",
        dependOn: ["firebase-monaco"],
      },
      monaco2: {
        import: "./src/pusher-monaco.ts",
        dependOn: ["pusher-monaco"],
      },
      "firebase-ace": ["@otjs/firebase-ace"],
      "firebase-monaco": ["@otjs/firebase-monaco"],
      "pusher-monaco": ["@otjs/pusher-monaco"],
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
      onAfterSetupMiddleware: (devServer) => {
        if (!devServer) {
          return;
        }

        devServer.app.post(
          "/pusher/auth",
          bodyParser.json(),
          bodyParser.urlencoded({ extended: false }),
          (req, res) => {
            const pusher = new Pusher(PUSHER_CONFIG);
            const { socket_id: socketId, channel_name: channel } = req.body;
            const presenceData = {
              user_id: uuid(),
              user_info: {},
            };
            const auth = pusher.authenticate(socketId, channel, presenceData);
            console.log("Pusher Channel Id:", channel);
            res.send(auth);
          }
        );
      },
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
        "process.env.PUSHER_CONFIG": JSON.stringify(PUSHER_CONFIG),
      }),
      new MonacoWebpackPlugin(),
    ],
  };
};
