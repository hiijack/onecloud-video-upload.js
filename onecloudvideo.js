// calculate sign
var getMd5 = require('./getmd5');

var video = {};
video.upload = function() {
	var file = '/home/jack/Downloads/2015毕业照.zip';
	getMd5(file);
};

video.upload();