const path = require('path');

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: './minimal_game_client.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'minimal_game_client.js',
    path: path.resolve(__dirname, 'dist')
  }
};
