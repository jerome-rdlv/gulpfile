const
    through = require('through2')
;

module.exports = function () {
    return through.obj(function (file, encoding, callback) {

        const contents = file.contents.toString(encoding)
            .replace(/{\$.*?:(.*?)}/g, function () {
                return arguments[1];
            });
        file.contents = Buffer.from(contents);
        this.push(file);

        callback();
    });
};