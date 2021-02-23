const crypto = require('crypto'),
    fs = require('fs')
;

module.exports = function (config) {
    switch (config.signature) {
        case 'md5':
        case 'sha1':
            return function hash(path) {
                const hash = crypto.createHash(config.signature);
                hash.setEncoding('hex');
                hash.write(fs.readFileSync(path));
                hash.end();
                return hash.read();
            };
        case 'timestamp':
            return function timestamp(path) {
                return parseInt(fs.statSync(path).mtime.getTime() / 1000);
            };
        default:
            return function none(path) {
                return '';
            };
    }
};