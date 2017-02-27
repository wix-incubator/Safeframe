/**
 * DeviantArt related deployment
 **/
var fs = require('fs');
var path = require("path");

function copyFile(source, dest) {
    return new Promise(function(resolve, reject) {
        var read = fs.createReadStream(source);
        read.on('error', rejectCleanup);
        var write = fs.createWriteStream(dest);
        write.on('error', rejectCleanup);
        function rejectCleanup(err) {
            read.destroy();
            write.end();
            reject(err);
        }
        write.on('finish', resolve);
        read.pipe(write);
    });
}

var projectDir = path.join(__dirname, '..');
var webDir = path.join(__dirname, '..', '..', '..', '..');
['deviantart-safeframes-host.min.js', 'deviantart-safeframes-guest.min.js'].forEach(function(filename) {
    copyFile(path.join(projectDir, 'dist', filename), path.join(webDir, 'styles', 'jms', 'thirdparty', 'lib', 'deviantart-safeframes', filename.split('-').pop()));
});

fs.readFile(path.join(projectDir, 'secret.key'), 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    var dest = path.join(webDir, 'vms', 'lib', 'ads', 'v.', 'safeframe_config.php');
    data = ['<?php', '$config["secret_key"] = "'+data+'";', '?>'].join("\n");
    fs.writeFile(dest, data);
    console.log(data);
});
