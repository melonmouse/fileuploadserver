const path = require('path');
const copyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './upload_module.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../dist', 'fileuploadserver'),
    clean: true,
    //library: 'upload_module',// This should result in a global variable named 'window.upload_module', but it doesn't.
  },
};
