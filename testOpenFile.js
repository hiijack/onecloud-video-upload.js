// slice the file into pieces, and calculate the file md5, and calculate the file piece's md5
//

var crypto = require('crypto');
var fs = require('fs');
var EventProxy = require('eventproxy');

var md5 = crypto.createHash('md5');

var ep = new EventProxy();
var path = '/home/jack/Downloads/node-v0.12.2-linux-x86.tar.gz';
// 1 MB
var size = 1024 * 1024 * 1;

var fileDigest = {
    md5: '',
    piece: []
};

// TODO change to async
var stat = fs.statSync(path);
var fileSize = stat['size'];
var eventTime = Math.ceil(fileSize / size);

ep.on('fileReadEnd', function() {
    var d = md5.digest('hex');
    fileDigest.md5 = d;
    console.log(fileDigest);
});

var i = 1;
ep.on('fileRead', function(param) {
    read(param.fd, i * size);
});

function read(fd, position) {
    if (position + size > fileSize) {
        size = fileSize - position;
    }
    var buffer = new Buffer(size);
    fs.read(fd, buffer, 0, size, position, function(err, bytes, buffer) {
        if (err) {
            throw err;
        }
        var param = {
            fd: fd,
            buffer: buffer
        };

        md5.update(buffer);
        fileDigest.piece.push(crypto.createHash('md5').update(buffer).digest('hex'));
        if (i < eventTime) {
            ep.emit('fileRead', param);
        } else {
            ep.emit('fileReadEnd');
        }
        i++;
    });
}

fs.open(path, 'r', function(err, fd) {
    if (err) {
        throw err;
    }
    read(fd, 0);
});