const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const plugins = [
  new VueLoaderPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV)
    }
  }),
  new HtmlWebpackPlugin({
    title: 'prerender-spa-plugin',
    template: 'index.html',
    filename: path.resolve(__dirname, 'dist/index.html'),
    favicon: 'favicon.ico'
  }),
];
if (process.env.NODE_ENV === 'production') {
  plugins.push(new PrerenderSPAPlugin({
    routes: ['/', '/about', '/contact'],

    renderer: new Renderer({
      inject: {
        foo: 'bar'
      },
      headless: true,
      renderAfterDocumentEvent: 'render-event'
    })
  }));
}
module.exports = {
  mode: process.env.NODE_ENV,
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ]
      }
    ]
  },
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: false
  },
  devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
  plugins
};
