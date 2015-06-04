var crypto = require('crypto');
var fs = require('fs');

var md5 = crypto.createHash('md5');

var getMd5 = function(filename) {
	var file = fs.ReadStream(filename);

	file.on('data', function(d) {
		md5.update(d);
	});

	file.on('end', function() {
		var d = md5.digest('hex');
		console.log(d + ' ' + filename);
	});
};

module.exports = getMd5;