var settings = require('./settings');
var $ = require('jquery');

var onecloudVideo = {};

var sign = function(formData, callback) {
    $.post(settings.signUrl, formData, function(data, status) {
        if (status == "success") {
            callback(data);
        } else {
            console.log("get sign fail")
        }
    });
};

onecloudVideo.init = function(fileItem) {
    var _this = this;
    getSign({
        fileName: file.name,
        fileMD5: md5String
    }, function(ret) {
        $.post(settings.initUrl, {
            fileName: file.name,
            fileMD5: md5String,
            accessKey: ret.accessKey,
            time: ret.time,
            sign: ret.sign
        }, function(data) {
            if (data.uploadId) {
                fileItem.uploadId = data.uploadId;
                _this.uploadChunk();
            } else {
                //handlers.onUploadError(fileItem);
            }
        });
    });
};

onecloudVideo.uploadChunk = function() {
};

module.exports = onecloudVideo;