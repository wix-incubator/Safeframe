var fs = require('fs');
var path = require('path');
var secretKey = require("randomstring").generate();

fs.writeFile(path.join(__dirname, '..', 'secret.key'), secretKey);

console.log("New SECRET_KEY is: ", secretKey);
