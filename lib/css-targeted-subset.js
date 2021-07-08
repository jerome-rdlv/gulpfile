const
    subset = require('postcss-remove-media-query-ranges'),
    path = require('path'),
    postcss = require('postcss'),
    Vinyl = require('vinyl'),
    Stream = require('stream');

module.exports = function (opts) {

    return function () {

        var stream = new Stream.Transform({objectMode: true});

        stream._transform = function (file, encoding, callback) {
            const self = this;
            this.push(file);

            if (file.isNull() || !opts.ranges) {
                return callback();
            }

            if (!opts.filter.test(file.path)) {
                return callback();
            }

            if (file.isStream()) {
                return callback('Streams are not supported!');
            }

            const source = file.contents;
            if (source.length < 20000) {
                return callback();
            }

            // Protect `from` and `map` if using gulp-sourcemaps
            var isProtected = file.sourceMap
                ? {from: true, map: true}
                : {};

            var tasks = opts.ranges.map(process);

            Promise.all(tasks).then(function () {
                callback();
            });

            function process(range) {
                const subsetOptions = {
                    min: range[0],
                    removeMin: true,
                };
                if (range.length > 1) {
                    subsetOptions.max = range[1];
                    subsetOptions.removeMax = true;
                }

                var postcssOptions = {
                    from: file.path,
                    to: rename(file.path, range),
                    // // Generate a separate source map for gulp-sourcemaps
                    map: file.sourceMap ? {annotation: false} : false
                };

                return postcss([subset(subsetOptions)])
                    .process(source, postcssOptions)
                    .then(function (result) {
                        return handleResult(range, result);
                    }, handleError);
            }

            function rename(path, range) {
                return path.replace(
                    /(\.css)$/,
                    '.' + opts.urlPrefix + range[0] + '-' + (range.length > 1 ? range[1] : 'inf') + '$1'
                );
            }

            function handleResult(range, result) {
                const css = result.css;
                if (css.length && css.length / source.length < opts.minRatio && source.length - css.length > 3000) {

                    let targeted = file.clone({deeply: false});
                    targeted.path = rename(file.path, range);
                    targeted.contents = Buffer.from(css, 'utf8');

                    // Apply source map to the chain
                    if (targeted.sourceMap) {
                        map = result.map.toJSON();
                        map.file = targeted.relative;
                        map.sources = Array.prototype.map.call(map.sources, function (source) {
                            return path.join(path.dirname(targeted.relative), source);
                        });
                        applySourceMap(targeted, map);
                    }

                    self.push(targeted);
                }
            }

            // Taken from gulp-postcss
            function handleError(error) {
                var errorOptions = {fileName: file.path, showStack: true};
                if (error.name === 'CssSyntaxError') {
                    errorOptions.error = error;
                    errorOptions.fileName = error.file || file.path;
                    errorOptions.lineNumber = error.line;
                    errorOptions.showProperties = false;
                    errorOptions.showStack = false;
                    error = error.message + '\n\n' + error.showSourceCode() + '\n';
                }
                // Prevent stream’s unhandled exception from
                // being suppressed by Promise
                setImmediate(function () {
                    callback(new PluginError('css-target-device-width', error, errorOptions));
                });
            }
        };

        return stream;
    };
};