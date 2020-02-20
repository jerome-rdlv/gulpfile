const
    mqr = require('postcss-remove-media-query-ranges'),
    path = require('path'),
    postcss = require('postcss'),
    Vinyl = require('vinyl'),
    Stream = require('stream');

module.exports = function (config) {
    return function () {

        var stream = new Stream.Transform({objectMode: true});

        stream._transform = function (file, encoding, callback) {
            const self = this;
            this.push(file);

            if (file.isNull()) {
                return callback();
            }

            if (file.isStream()) {
                return handleError('Streams are not supported!');
            }

            const source = file.contents;
            if (source.length < 20000) {
                return callback();
            }

            // Protect `from` and `map` if using gulp-sourcemaps
            var isProtected = file.sourceMap
                ? {from: true, map: true}
                : {};

            var tasks = [];
            var targets = config.tasks.scss.split;
            for (let target in targets) {
                if (Object.prototype.hasOwnProperty.call(targets, target)) {
                    tasks.push(process(target, targets[target]));
                }
            }

            Promise.all(tasks).then(function () {
                callback();
            });

            function process(target, bounds) {
                const splitOptions = {
                    min: bounds[0],
                    removeMin: true,
                };
                if (bounds.length > 1) {
                    splitOptions.max = bounds[1];
                    splitOptions.removeMax = true;
                }

                var postcssOptions = {
                    from: file.path,
                    to: rename(file.path, target),
                    // // Generate a separate source map for gulp-sourcemaps
                    map: file.sourceMap ? {annotation: false} : false
                };

                return postcss([mqr(splitOptions)])
                    .process(source, postcssOptions)
                    .then(function (result) {
                        return handleResult(target, result);
                    }, handleError);
            }

            function rename(path, target) {
                return path.replace(/(\.css)$/, '.' + target + '$1');
            }

            function handleResult(target, result) {
                const css = result.css;
                if (css.length && css.length / source.length < .85) {
                    
                    let targeted = file.clone({deeply: false});
                    targeted.path = rename(file.path, target);
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
                    callback(new PluginError('gulp-postcss', error, errorOptions));
                });
            }
        };

        return stream;
    };
};