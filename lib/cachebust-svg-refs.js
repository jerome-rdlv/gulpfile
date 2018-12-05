/*global config*/
const
    cacheBustUrl = require('./cachebust-url'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    through = require('through2')
;

module.exports = function () {
    return through.obj(function (file, encoding, callback) {
        const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserSvgOptions);
        const $svg = $('svg');
        
        $svg.find('image').each(function () {
            const $image = $(this);
            const href = $image.attr('xlink:href');
            const path = config.prodPath + config.assetsDir + 'svg/' + href;

            if (fs.existsSync(path)) {
                $image.attr('xlink:href', cacheBustUrl(href, fs.statSync(path).mtime.getTime()));
            }
        });

        file.contents = Buffer.from($.xml(), 'utf8');
        this.push(file);
        
        callback();
    });
};
