const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: ['./src/main.js'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'DEVELOPMENT prerender-spa-plugin',
      template: 'src/static/index.html',
      filename: 'index.html',
      favicon: 'favicon.ico'
    }),
    // == PRERENDER SPA PLUGIN == //
    new PrerenderSPAPlugin({
      // Index.html is in the root directory.
      routes: ['/', '/about', '/some/deep/nested/route'],

      rendererOptions: {
        inject: {
          foo: 'bar'
        },
        renderAfterDocumentEvent: 'render-event'
      }
    })
  ]
};
