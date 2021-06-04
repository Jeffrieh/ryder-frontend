const path = require("path");
var webpack = require("webpack");

module.exports = {
  resolve: {
    alias: {
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
  watch: false,
  watchOptions: {},
  entry: "./src/index.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new webpack.ProvidePlugin({
      THREE: "three",
    }),
    //...
  ],
};
