// slice the file into pieces, and calculate the file md5, and calculate the file piece's md5
// async
//

var crypto = require('crypto');
var fs = require('fs');
var EventProxy = require('eventproxy');
var ep = new EventProxy();

// 1MB
var chunkSize = 1024 * 1024 * 1;

var startRead = function(fd, fileSize) {

    var md5 = crypto.createHash('md5');

    var currentChunk = 1;
    var totalChunk = Math.ceil(fileSize / chunkSize);
    var chunkDigest = [];
    //console.log(totalChunk);

    var read = function(fd, currChunk) {
        var position = (currChunk - 1) * chunkSize;
        if (position + chunkSize > fileSize) {
            chunkSize = fileSize - position;
        }
        //console.log(currChunk, position);

        var buffer = new Buffer(chunkSize);
        fs.read(fd, buffer, 0, chunkSize, position, function(err, bytes, buffer) {
            if (err) {
                throw err;
            }
            var param = {
                fd: fd,
                buffer: buffer
            };

            md5.update(buffer);
            chunkDigest.push(crypto.createHash('md5').update(buffer).digest('hex'));
            if (currChunk < totalChunk) {
                currentChunk++;
                ep.emit('nextChunk', param);
            } else {
                ep.emit('fileReadEnd', {
                    md5: md5.digest('hex'),
                    chunkDigest: chunkDigest
                });
            }
        });
    };

    ep.on('nextChunk', function(param) {
        read(param.fd, currentChunk);
    });

    read(fd, currentChunk);
};

module.exports = function(path, callback) {

    fs.stat(path, function(err, stat) {
        if (err) {
            throw err;
        }

        fs.open(path, 'r', function(err, fd) {
            if (err) {
                throw err;
            }
            startRead(fd, stat['size'], callback);
        });
    });

    ep.on('fileReadEnd', function(digestInfo) {
        //console.log(digestInfo);
        if (callback) {
            callback(digestInfo);
        }
    });
};