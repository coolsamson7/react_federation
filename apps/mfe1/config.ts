const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/main.tsx",
  output: { publicPath: "http://localhost:3000/" },
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: { rules: [{ test: /\.tsx?$/, loader: "ts-loader", exclude: /node_modules/ }] },
  plugins: [
    new ModuleFederationPlugin({
      name: "shell",
      remotes: {
        mfe1: "mfe1@http://localhost:3001/remoteEntry.js",
        mfe2: "mfe2@http://localhost:3002/remoteEntry.js"
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true }, tsyringe: { singleton: true } }
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" })
  ],
  devServer: { port: 3000 }
};
