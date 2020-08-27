module.exports = function (config) {

    const
        cacheBustUrl = require('../lib/cachebust-url')(config),
        cheerio = require('cheerio'),
        fs = require('fs'),
        through = require('through2');

    return function () {
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
                    const url = $asset.attr(attr);
                    const path = config.distPath + config.assetsDir + url;
                    // handle http://, https:// and // (agnostic scheme)
                    if (!url.match(/^(https?:)?\/\//) && fs.existsSync(path)) {
                        $asset.attr(attr, cacheBustUrl(
                            url,
                            parseInt(fs.statSync(path).mtime.getTime() / 1000)
                        ));
                    }
                }
            });

            file.contents = Buffer.from($.xml(), 'utf8');
            this.push(file);

            callback();
        });
    };
};
