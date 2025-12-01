const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
  entry: "./apps/shell/src/main.tsx",
  mode: "development",
  devServer: {
    port: 3000,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, "public"),
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@portal/*": path.resolve(process.cwd(), "./libs/portal/src/*"),
    },
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader" }],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        mfe1: "mfe1@http://localhost:3001/remoteEntry.js",
      },
      shared: {
        react: { singleton: true, eager: true },
        "react-dom": { singleton: true, eager: true },
        tsyringe: { singleton: true, eager: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: "apps/shell/public/index.html",
    }),
  ],
};
