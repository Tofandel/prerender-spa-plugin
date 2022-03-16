const PrerenderSPAPlugin = require('prerender-spa-plugin');

module.exports = (config, env) => {
  if (env === 'production') {
    config.plugins = config.plugins.concat([
      new PrerenderSPAPlugin({
        routes: ['/'],
      })
    ]);
  }

  return config;
};
