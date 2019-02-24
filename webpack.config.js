const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  // devtool: 'inline-source-map',
  entry: {
    app: './src/index.tsx',
    styles: './src/index.scss',
  },

  devServer: {
    contentBase: './dist',
    port: 8000,
    host: '0.0.0.0',
    disableHostCheck: true,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },

      {
        test: /\.(scss)$/,
        use: [
          "style-loader", // creates style nodes from JS strings
          "css-loader", // translates CSS into CommonJS
          "sass-loader" // compiles Sass to CSS, using Node Sass by default
        ]
      },
    ]
  },

  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.d.ts' ],
    alias: {
    }
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      exclude: ['assets']
    }),
    new HtmlWebpackPlugin({
      title: 'Factorio calculator by terite'
    }),

  ],
  output: {
    filename: 'bundle.[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  }
};
