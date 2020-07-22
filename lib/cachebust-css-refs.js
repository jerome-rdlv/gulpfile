module.exports = function (config) {

    const
        cacheBustUrl = require('./cachebust-url')(config),
        through = require('through2'),
        fs = require('fs'),
        path = require('path')
    ;
    
    const regex = /url\((?!['"]?(?:data:|https?:\/\/|#|%23))['"]?([^'")]*)['"]?\)/g;

    return function (base) {
        return through.obj(function (file, encoding, callback) {

            const contents = file.contents.toString(encoding)
                .replace(regex, function (replacement, url) {
                    if (!url) {
                        return replacement;
                    }

                    // if (/^(%23|#)/.test(url)) {
                    //     // URL is a hash (begins with # or %23)
                    //     return replacement;
                    // }
                    const filepath = path.normalize(file.dirname + '/' + url);
                    if (!fs.existsSync(filepath)) {
                        // eslint-disable-next-line no-console
                        return replacement;
                    }
                    return 'url(' + cacheBustUrl(
                        url,
                        fs.statSync(filepath).mtime.getTime()
                    ) + ')';
                });

            file.contents = Buffer.from(contents);
            this.push(file);

            callback();
        });
    };
};