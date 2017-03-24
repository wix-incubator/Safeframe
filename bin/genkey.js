var fs = require('fs');
var path = require('path');
var secretKey = require("randomstring").generate();

fs.writeFileSync(path.join(__dirname, '..', 'secret.key'), secretKey, {encoding: 'utf8'});

console.log("New SECRET_KEY is: ", secretKey);
