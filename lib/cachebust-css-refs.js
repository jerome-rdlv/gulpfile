module.exports = function (config) {

    const
        cacheBustUrl = require('./cachebust-url'),
        through = require('through2'),
        fs = require('fs'),
        path = require('path')
    ;

    return function (base) {
        return through.obj(function (file, encoding, callback) {

            const contents = file.contents.toString(encoding)
                .replace(/url\((?!['"]?(?:data|http):)['"]?([^'")]*)['"]?\)/g, function () {
                    let replacement = arguments[0];

                    // if does not begin with # (%23)
                    if (!/^%23/.test(arguments[1])) {
                        const filepath = path.normalize(base + arguments[1]);
                        if (fs.existsSync(filepath)) {
                            replacement = 'url(' + cacheBustUrl(
                                arguments[1],
                                fs.statSync(filepath).mtime.getTime()
                            ) + ')';
                        } else {
                            // eslint-disable-next-line no-console
                            console.warn('File %s does not exists', filepath);
                        }
                    }
                    return replacement;
                });

            file.contents = Buffer.from(contents);
            this.push(file);

            callback();
        });
    };
};