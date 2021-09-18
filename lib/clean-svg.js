/*global config*/
const
    cheerio = require('cheerio'),
    through = require('through2')
;

module.exports = function (config) {
    return function () {
        return through.obj(function (file, encoding, complete) {

            const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserSvgOptions);
            const $svg = $('svg');

            $svg.find('#svgo-options').remove();

            // dimensions
            const viewBox = $svg.attr('viewBox');
            if (viewBox) {
                const dims = viewBox.split(' ');
                if (dims.length === 4) {
                    // for (let i = 2; i < dims.length; ++i) {
                    //     dims[i] = Math.ceil(dims[i]);
                    // }
                    $svg.attr('viewBox', dims.join(' '));
                    $svg.attr('width', dims[2]);
                    $svg.attr('height', dims[3]);
                }
            }

            file.contents = Buffer.from($.xml(), 'utf8');
            this.push(file);

            complete();
        });
    };
};