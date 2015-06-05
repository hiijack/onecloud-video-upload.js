// calculate sign
var getMd5 = require('./getmd5');

var video = {};
video.upload = function() {
    var file = '/home/jack/Downloads/test.zip';
    getMd5(file);
};

video.upload();