const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./apps/mfe1/src/main.tsx",
  mode: "development",
  devServer: {
    port: 3001,
    static: {
      directory: path.join(__dirname, "public"),
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "http://localhost:3001/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    alias: {
      "@portal/*": path.resolve(process.cwd(), "./libs/portal/src/*"),
    },
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      { test: /\.json$/, type: "json" },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "mfe1",
      filename: "remoteEntry.js",
      exposes: {
        "./MFE1Home": "./apps/mfe1/src/MFE1Home",
      },
      shared: {
        react: { singleton: true, eager: true },
        "react-dom": { singleton: true, eager: true },
        tsyringe: { singleton: true, eager: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: "./apps/mfe1/public/index.html",
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public/manifest.json"),
          to: path.resolve(__dirname, "dist/manifest.json"),
        },
      ],
    }),
  ],
};
