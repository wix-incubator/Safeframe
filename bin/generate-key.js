var fs = require('fs');
var path = require('path');
// We want the secret key to be a 32 characters long and
// to consist of hex characters only to make it compatible with openssl_encrypt()
var secretKey = require("randomstring").generate({
    length: 32,
    charset: 'hex'
});

fs.writeFileSync(path.join(__dirname, '..', 'secret.key'), secretKey, {encoding: 'utf8'});

console.log("New SECRET_KEY is: ", secretKey);
