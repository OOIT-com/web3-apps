const { merge } = require('webpack-merge');

module.exports = (config) => {
  return merge(config, {
    ignoreWarnings: [/Failed to parse source map/]
  });
};
