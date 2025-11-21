const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");

module.exports = {
  entry: "./apps/mfe1/src/main.tsx", // "./src/main.tsx"
  mode: "development",
  devServer: {
    port: 3001
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto"
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@portal/*": path.resolve(process.cwd(), './libs/portal/src/*'),
    },
  },
  module: {
    rules: [{ test: /\.tsx?$/, loader: "ts-loader" }]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "mfe1",
      filename: "remoteEntry.js",
      exposes: {
        "./MFE1Home": "./apps/mfe1/src/MFE1Home"
      },
      shared: {
        react: { singleton: true, eager: true },
        "react-dom": { singleton: true, eager: true },
        tsyringe: { singleton: true, eager: true }
      }
    }),
    new HtmlWebpackPlugin({
      template: "./apps/mfe1/public/index.html"
    })
  ]
};
