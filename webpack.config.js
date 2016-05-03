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
        mainPage: './mainPage.js',
        navbar: './partials/navbar/navbar.js',
        addQuest: './quest/addQuest.js',
        slider: './partials/slider/slider.js',
        authForm: './auth/authForm.js'
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
            },
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
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
