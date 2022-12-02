const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development', 
    entry: {
        bundle: path.resolve(__dirname, 'src/index.js')
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use :[
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
        ]
    },
    Plugins: [
        new HtmlWebpackPlugin({
            title: 'Webpack app',
            filename: 'index.html',
        })
    ]
};