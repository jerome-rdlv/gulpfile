const
    cheerio = require('cheerio'),
    path = require('path'),
    through = require('through2')
;

module.exports = function () {
    return through.obj(function (file, encoding, callback) {

        const $svg = cheerio.load(file.contents.toString(encoding), config.cheerioParserSvgOptions)('svg');
        const $symbol = cheerio.load('<symbol></symbol>', config.cheerioParserSvgOptions);

        const id = path.basename(file.relative, path.extname(file.relative)).replace(/_/, '-');
        $symbol('symbol')
            .attr('id', 'icon-'+ id)
            .attr('viewBox', $svg.attr('viewBox'))
        ;

        $symbol('symbol').append($svg.find('> *'));

        file.contents = Buffer.from($symbol.xml().replace(/{\$main:[^}]+}/, 'currentColor'), 'utf8');

        this.push(file);

        callback();
    });
};