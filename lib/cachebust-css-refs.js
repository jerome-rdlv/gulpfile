module.exports = function (config) {

    const
        cacheBustUrl = require('./cachebust-url')(config),
        through = require('through2'),
        fs = require('fs'),
        path = require('path')
    ;

    return function (base) {
        return through.obj(function (file, encoding, callback) {

            const contents = file.contents.toString(encoding)
                .replace(/url\((?!['"]?(?:data|http):)['"]?([^'")]*)['"]?\)/g, function () {
                    let replacement = arguments[0];

                    if (/^(%23|#)/.test(arguments[1])) {
                        // URL is a hash (begins with # or %23)
                        return replacement;
                    }
                    const filepath = path.normalize(base + arguments[1]);
                    if (!fs.existsSync(filepath)) {
                        // eslint-disable-next-line no-console
                        // console.warn('File %s does not exists', filepath);
                        return replacement;
                    }
                    return 'url(' + cacheBustUrl(
                        arguments[1],
                        fs.statSync(filepath).mtime.getTime()
                    ) + ')';
                });

            file.contents = Buffer.from(contents);
            this.push(file);

            callback();
        });
    };
};