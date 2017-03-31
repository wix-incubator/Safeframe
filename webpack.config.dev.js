var path = require('path');
var secretKey = require('fs').readFileSync(path.join(__dirname, 'secret.key'), 'utf8');

module.exports = {
    entry: {
        "deviantart-safeframes-host":  path.join(__dirname, "src", "host", "index.js"),
        "deviantart-safeframes-guest": path.join(__dirname, "src", "guest", "index.js")
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader?presets[]=es2015!preprocess-loader?+DEBUG&SECRET_KEY='+secretKey+'&NODE_ENV=development'
        }]
    },
    devtool: "#inline-source-map"
};
