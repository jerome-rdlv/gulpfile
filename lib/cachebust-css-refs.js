module.exports = function (config) {

    const
        cacheBustUrl = require('./cachebust-url')(config),
        getFileSignature = require('./get-file-signature')(config),
        crypto = require('crypto'),
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
                    const filepath = path.normalize(
                        file.dirname.replace(config.srcPath, config.distPath) +
                        '/' + url
                    );
                    if (!fs.existsSync(filepath)) {
                        // eslint-disable-next-line no-console
                        return replacement;
                    }
                    
                    return 'url(' + cacheBustUrl(url, getFileSignature(filepath)) + ')';
                });

            file.contents = Buffer.from(contents);
            this.push(file);

            callback();
        });
    };
};