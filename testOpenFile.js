// slice the file into pieces, and calculate the file md5
// todo : calculate the file piece's md5

var crypto = require('crypto');
var fs = require('fs');
var EventProxy = require('eventproxy');

var md5 = crypto.createHash('md5');

var ep = new EventProxy();
var path = '/home/jack/Downloads/node-v0.12.2-linux-x86.tar.gz';
// 1 MB
var size = 1024 * 1024 * 1;
//var buffer = new Buffer(size);

var stat = fs.statSync(path);
var fileSize = stat['size'];
var eventTime = parseInt(fileSize / size);

if (fileSize % size != 0) {
    eventTime++;
}

ep.on('fileReadEnd', function() {
    var d = md5.digest('hex');
    console.log(d);
});

var i = 1;
ep.on('fileRead', function(param) {
    //console.log('file read');
    read(param.fd, i * size);
});

function read(fd, position) {
    if (position + size > fileSize) {
        size = fileSize - (position);
        //console.log(size);
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

        //console.log(i + ', ' + position);
        md5.update(buffer);
        if (i < eventTime) {
            ep.emit('fileRead', param);
        }
        else {
            ep.emit('fileReadEnd');
        }

        i++;
    });
}

function callback(err, fd) {
    if (err) {
        throw err;
    }
    read(fd, 0);
}

fs.open(path, 'r', callback);