const path = require('path');
const copyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/upload_module.ts',
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
  plugins: [
    new copyPlugin({
      patterns: [
        {from: './src/upload_module.css', to: '[name][ext]'},
        {from: './src/upload_module.html', to: '[name][ext]'},
      ],
    }),
  ],
  output: {
    filename: 'upload_module.js',
    path: path.resolve(__dirname, './dist'),
    clean: true,
  },
};
