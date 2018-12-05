'use strict';

const fs = require('graceful-fs');
const through = require('through2');

module.exports = function() {
    return through.obj(function(file, enc, cb) {
        const fileDate = new Date();
        return fs.utimes(file.path, fileDate, fileDate, function () {
            cb(null, file);
        });
    });
};