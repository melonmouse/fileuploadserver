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
  optimization: {
    usedExports: false,
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../../dist', 'fileuploadserver'),
    clean: true,
  },
};
