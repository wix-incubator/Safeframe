var webpack = require("webpack");
var path = require('path');
var secretKey = require('fs').readFileSync(path.join(__dirname, 'secret.key'), 'utf8');
var version = require("./package.json").version;

module.exports = {
    entry: {
        "deviantart-safeframes-host":  path.join(__dirname, "src", "host", "index.js"),
        "deviantart-safeframes-guest": path.join(__dirname, "src", "guest", "index.js"),
        "tests": path.join(__dirname, "test", "index.js")
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].min.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader?presets[]=es2015!preprocess-loader?SECRET_KEY='+secretKey+'&NODE_ENV=production'
        }]
    },
    plugins: [
        new webpack.BannerPlugin("@generated"),
        new webpack.BannerPlugin("DeviantArt SafeFrame v" + version),
    ],
};
