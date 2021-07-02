const path = require('path');
const MyPlugin = require('./custom-plugin/MyPlugin');
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	entry: ['./pages/page1.js'],
	mode: 'production',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, 'dist'),
	},
	plugins: [
		new CleanWebpackPlugin(),
		new MyPlugin({
			exclude: [ 'node_modules', 'dist' ],
		}),
	],
	module: {
		rules: [
			// JavaScript/JSX
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader'],
			},
		],
	},
	resolve: {
		extensions: ['*', '.js', '.jsx'],
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
	}
}
