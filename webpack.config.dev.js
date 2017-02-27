var path = require('path');
var secretKey = require('fs').readFileSync(path.join(__dirname, 'secret.key'));

module.exports = {
    entry: {
        "deviantart-safeframes-host": "./src/host/index.js",
        "deviantart-safeframes-guest": "./src/guest/index.js"
    },
    output: {
        path: './dist',
        filename: '[name].js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader?presets[]=es2015!preprocess-loader?+DEBUG&SECRET_KEY='+secretKey+'&NODE_ENV=development'
        }]
    }
};
