const path = require("path");
var webpack = require("webpack");
var dotenv = require('dotenv').config({path: __dirname + "/.env-" + process.env.NODE_ENV}).parsed;
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HandlebarsWebpackPlugin = require("handlebars-webpack-plugin");

module.exports = {
  resolve: {
    alias: {
      // "Handlebars": path.join(
      //   __dirname,
      //   "node_modules/handlebars/dist/handlebars.js"
      // ),
      "three/OrbitControls": path.join(
        __dirname,
        "node_modules/three/examples/js/controls/OrbitControls.js"
      ),
      "three/OBJLoader": path.join(
        __dirname,
        "node_modules/three/examples/js/loaders/OBJLoader.js"
      ),
      // ...
    },
  },
  module: {
    rules: [
      { test: /\.hbs$/, use: 'handlebars-loader?helperDirs[]=' + __dirname + "/src/helpers" },
      {test: /\.scss$/,
      use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              // options...
            }
          }
        ]
    }]
  },
  //TODO make this dependant on env.
  watch: (process.env.NODE_ENV == "development") ? true : false,
  watchOptions: {},
  entry: "./src/entry.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/ryder.css'
    }),
    new HtmlWebpackPlugin({
      title: "index",
      template: "./src/app.html",
      filename: "index.html"
    }),
    new webpack.ProvidePlugin({
      THREE: "three",
      Handlebars: "handlebars"
    }),
    // new HandlebarsWebpackPlugin({
    //   entry: path.join(process.cwd(), "src", "hbs", "*.hbs"),
    //   output: path.join(process.cwd(), "dist", "[name].html"),
    // })
    //...
  ],
};
