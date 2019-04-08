const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: path.resolve(__dirname, "../src/entry.js"),
  output: {
    path: path.resolve(__dirname, "../webroot/build"),
    filename: "bundle.js"
  },
  mode: process.env.NODE_ENV !== "production" ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.scss$/,
        use: [
          process.env.NODE_ENV !== "production"
            ? "style-loader"
            : MiniCssExtractPlugin.loader,
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "bundle.css",
      chunkFilename: "[id].css"
    }),
    new CopyPlugin([
      {
        from: path.resolve(__dirname, "../src/svg"),
        to: path.resolve(__dirname, "../webroot/svg")
      },
      {
        from: path.resolve(__dirname, "../src/images"),
        to: path.resolve(__dirname, "../webroot/build/images")
      },
      {
        from: path.resolve(__dirname, "../src/json"),
        to: path.resolve(__dirname, "../webroot/json")
      }
    ])
  ]
};
