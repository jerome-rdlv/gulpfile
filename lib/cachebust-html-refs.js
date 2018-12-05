/*global config*/
const
    cacheBustUrl = require('../lib/cachebust-url'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    through = require('through2')
;

module.exports = function () {
    return through.obj(function (file, encoding, callback) {
        const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserHtmlOptions);
        
         $('script[src], link[href], img[src], image, svg[data-src]').each(function () {
            const $asset = $(this);
            let attr;
            switch ($asset[0].tagName) {
                case 'script':
                case 'img':
                    attr = 'src';
                    break;
                case 'svg':
                    attr = 'data-src';
                    break;
                case 'link':
                    attr = 'href';
                    break;
                case 'image':
                    attr = 'xlink:href';
                    break;
            }
            if (attr) {
                const path = $asset.attr(attr);
                if (!path.match(/^https?:\/\//)) {
                    $asset.attr(
                        attr,
                        cacheBustUrl(path, fs.statSync(config.prodPath + config.assetsDir + path).mtime.getTime())
                    );
                }
            }
        });

        file.contents = Buffer.from($.xml(), 'utf8');
        this.push(file);

        callback();
    });
};
