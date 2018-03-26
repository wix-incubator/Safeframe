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
var webDir = process.env.DA_WEB_ROOT;
['deviantart-safeframes-host.min.js', 'deviantart-safeframes-guest.min.js'].forEach(function(filename) {
    var src = path.join(projectDir, 'dist', filename);
    var dest = path.join(webDir, 'styles', 'jms', 'thirdparty', 'lib', 'deviantart-safeframes', filename.split('-').pop());
    console.log("Copying file from", src, "to", dest);
    copyFile(src, dest);
});

fs.readFile(path.join(projectDir, 'secret.key'), 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    var dest = path.join(webDir, 'vms', 'lib', 'ads', 'v.', 'safeframe_secret.php');
    console.log("Copying secret.key to", dest);
    data = [
        '<?php', 
        '// This key is generated via build script from https://github.com/DeviantArt/SafeFrame',
        'define("SAFEFRAME_SECRET", "'+data+'");', 
        '?>'
    ].join("\n");
    fs.writeFile(dest, data);

    console.log("All done!");
    console.log("Please do not forget to run `vm jc` and `ads-munger` for the changes to take effect.");
});
