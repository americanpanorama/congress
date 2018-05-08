var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");


var SRC_DIR = path.resolve(__dirname, 'src');
var appDir = path.resolve(__dirname, 'build');

var config = {
	entry: './src/main.jsx',
	output: {
		path: appDir,
		filename: 'main.js'
	},
	devtool: 'inline-source-map',
	devServer: {
		contentBase: appDir,
		port: 9000
	},
	module: {
		rules: [
			{
				test: /\.html$/,
				use: 'file-loader'
			},
			{
				test : /\.jsx?/,
				include : SRC_DIR,
				loader : 'babel-loader'
			},
			{
				test: /\.scss$/,
				use: [
					{ loader: "style-loader" }, 
					{ loader: "css-loader" },
					{ loader: "sass-loader" }
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: false,
			template: require('html-webpack-template'),
			title: 'The People\'s House',
			filename: 'index.html',
			appMountId: 'app-container',
			scripts: ['https://cartodb-libs.global.ssl.fastly.net/cartodb.js/v3/3.15/cartodb.core.js'],
			links: ['https://fonts.googleapis.com/css?family=PT+Serif:400|Saira+Condensed']
		}),
		new ExtractTextPlugin({
			filename: "[name].[contenthash].css",
			disable: process.env.NODE_ENV === "development"
		})
	]
}

module.exports = config;