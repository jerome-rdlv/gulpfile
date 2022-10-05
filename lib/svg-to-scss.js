const
    cheerio = require('cheerio'),
    fs = require('fs'),
    mustache = require('mustache'),
    path = require('path'),
    through = require('through2'),
    Vinyl = require('vinyl');

module.exports = function (opts) {

    opts = typeof opts === 'undefined' ? {} : opts;
    opts.template = opts.template ? opts.template : 'svg.scss.mustache';
    opts.output = opts.output ? opts.output : 'icon-svg.scss';

    const data = {
        items: []
    };

    function getDims(svgCode) {
        const $svg = cheerio.load(svgCode, {xmlMode: true})('svg');
        const viewbox = $svg.attr('viewBox');
        if (viewbox) {
            return viewbox.split(' ');
        }
        return null;
    }

    function eachFile(file, encoding, callback) {

        const svgCode = file.contents.toString(encoding);
        const dims = getDims(svgCode);
        if (!dims) {
            return callback('viewBox attribute needed on ' + file.relative);
        }
        const vars = [];
        const encoded = encodeURIComponent(svgCode)
            // replace variables with default value, and build vars object
            // format is for example {$main:#383f4a}
            .replace(/(%7B%24(.*?)%3A(.*?)%7D)/g, function () {
                vars.push({
                    name: decodeURIComponent(arguments[2]),
                    default: decodeURIComponent(arguments[3])
                });
                return '{' + decodeURIComponent(arguments[2]) + '}';
            });
        
        const parts = path.parse(file.relative);
        const filename = (parts.dir ? parts.dir +'/' : '') + parts.name;
        
        data.items.push({
            dataurl: 'data:image/svg+xml,' + encoded,
            filename: filename,
            width: dims[2],
            height: dims[3],
            variables: '(' + vars
                    .map(function (item) {
                        return '"' + item.name + '":"' + item.default + '"';
                    })
                    // variable names must be unique
                    .filter(function (value, index, self) {
                        return self.indexOf(value) === index;
                    })
                    .join(', ')
                + ')'
        });

        callback();
    }

    function endStream(callback) {

        try {
            if (fs.existsSync(opts.template)) {
                const template = fs.readFileSync(opts.template, 'utf8');
                const scss = mustache.render(template, data);
                const buffer = Buffer.from(scss, 'utf8');

                this.push(new Vinyl({
                    path: opts.output,
                    contents: buffer
                }));
            } else {
                // eslint-disable-next-line no-console
                console.warn('File %s does not exists', opts.template);
            }
            callback();
        } catch (error) {
            callback(error);
        }
    }

    return through.obj(eachFile, endStream);
};