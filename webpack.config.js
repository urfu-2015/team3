const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const cssnano = require('cssnano');
const webpack = require('webpack');

var stylusLoader = ExtractTextPlugin.extract("style-loader", "css-loader!stylus-loader");

module.exports = {
    context: path.join(__dirname, 'views'),
    entry: {
        base: './base.js',
        navbar: './partials/navbar.js',
        footer: './partials/footer.js',
        slider: './partials/slider.js',
        addQuest: './quest/addQuest.js',
        questPage: './quest/questPage.js',
        authForm: './auth/authForm.js',
        profile: './profile/profile.js',
        editProfile: './profile/editProfile.js',
        quests: './pageQuests/questslist.js',
        error: './error.js'
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
                test: /\.svg$/,
                loader: 'svg-url-loader'
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
