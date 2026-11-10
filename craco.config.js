const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.plugins = (webpackConfig.plugins || []).concat([
        new NodePolyfillPlugin(),
        new webpack.ProvidePlugin({
          process: "process/browser.js",
          Buffer: ['buffer', 'Buffer']
        }),
      ]);

      const fallback = webpackConfig.resolve.fallback || {};
      Object.assign(fallback, {
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        assert: require.resolve("assert"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify"),
        url: require.resolve("url"),
        zlib: require.resolve("browserify-zlib"),
        buffer: require.resolve("buffer"),
        path: require.resolve("path-browserify"),
      });

      webpackConfig.resolve.fallback = fallback;
      webpackConfig.resolve.extensions = [".js", ".jsx", ".tsx", ".ts", ".json", ".mjs", ".wasm", ".css"];

      return webpackConfig;
    }
  }
};