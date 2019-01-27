/*global config*/
const
    cheerio = require('cheerio'),
    through = require('through2')
;

module.exports = function () {
    return through.obj(function (file, encoding, callback) {

        const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserSvgOptions);
        const $svg = $('svg');

        $svg.find('#svgo-options').remove();

        // dimensions
        const viewBox = $svg.attr('viewBox');
        if (viewBox) {
            const dims = viewBox.split(' ');
            if (dims.length === 4) {
                for (let i = 2; i < dims.length; ++i) {
                    dims[i] = Math.ceil(dims[i]);
                }
                $svg.attr('viewBox', dims.join(' '));
                // $svg.attr('x', dims[0]);
                // $svg.attr('y', dims[1]);
                $svg.attr('width', dims[2]);
                $svg.attr('height', dims[3]);
            }
        }

        // inline styles (disable because of CSP?)
        // $svg.find('style').each(function () {
        //     const $style = $(this);
        //     $style.html().replace(/([^{]+){([^}]+)}/g, function (full, selector, properties) {
        //         $(selector).each(function () {
        //             const $node = $(this);
        //             $node.attr('style', ($node.attr('style') || '') + properties.trim());
        //         });
        //     });
        //     $style.remove();
        // });

        // delete style nodes
        // $svg.find('[class]').each(function () {
        //     const $node = $(this);
        //     $node.attr('class', $node.attr('class').split(' ').filter(function (c) {
        //         return !/^cls-/.test(c);
        //     }).join(' '));
        // });

        file.contents = Buffer.from($.xml(), 'utf8');
        this.push(file);

        callback();
    });
};