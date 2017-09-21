const webpack = require('webpack');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, 'public/javascript');
const APP_DIR = path.resolve(__dirname, 'public/javascript');

let config = {
    entry: APP_DIR + '/app.jsx',

    output: {
        path: BUILD_DIR,
        filename: 'app.min.js',

    },
    module: {

        loaders: [
            {
                test: /\.jsx?/,
                include: APP_DIR,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                },

            }
        ]
    }
};

module.exports = config;
