const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const cssnano = require('cssnano');
const webpack = require('webpack');

var stylusLoader = ExtractTextPlugin.extract("style-loader", "css-loader!stylus-loader");

module.exports = {
    context: path.join(__dirname, 'views'),
    entry: {
        main: './main/main.js',
        mainPage: './mainPage.js'
    },
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name].js',
        sourceMapFilename: '[name].map',
        publicPath: '/'
    },
    module: {
        loaders: [
            {
                test: /\.styl$/,
                loader: stylusLoader
            },
            {
                test: /(\.png$)|(\.jpg$)|(\.jpeg$)|(\.gif$)/,
                loader: 'file-loader'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
        new webpack.optimize.UglifyJsPlugin()
    ],
    postcss: () => {
        return [autoprefixer, cssnano];
    }
};
