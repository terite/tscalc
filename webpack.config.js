const path = require('path');
const webpack = require('webpack')

module.exports = {
  // devtool: 'inline-source-map',
  entry: './src/index.tsx',

  devServer: {
    contentBase: './dist',
    port: 8000,
    host: '0.0.0.0',
    hot: true
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
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],

  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    alias: {
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
