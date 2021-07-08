module.exports = function (config) {

    const
        cacheBustUrl = require('./cachebust-url')(config),
        getFileSignature = require('./get-file-signature')(config),
        cheerio = require('cheerio'),
        fs = require('fs'),
        through = require('through2');

    return function () {
        return through.obj(function (file, encoding, complete) {
            const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserSvgOptions);
            const $svg = $('svg');

            $svg.find('image').each(function () {
                const $image = $(this);
                const href = $image.attr('xlink:href');
                const path = config.distPath + config.assetsDir + 'svg/' + href;

                if (fs.existsSync(path)) {
                    $image.attr('xlink:href', cacheBustUrl(
                        href,
                        getFileSignature(path)
                    ));
                }
            });

            file.contents = Buffer.from($.xml(), 'utf8');
            this.push(file);

            complete();
        });
    };
};
