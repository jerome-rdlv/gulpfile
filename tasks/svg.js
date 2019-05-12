module.exports = function (config) {

    if (!config.tasks.svg) {
        return false;
    }

    const
        cacheBustSvgRefs = require('../lib/cachebust-svg-refs'),
        changed = require('gulp-changed'),
        cheerio = require('cheerio'),
        cleanSvg = require('../lib/clean-svg'),
        clearSvgParams = require('../lib/clear-svg-params'),
        crypto = require('crypto'),
        gulp = require('gulp'),
        path = require('path'),
        svgmin = require('gulp-svgmin'),
        touch = require('../lib/touch');


    function svgminCallback(file) {
        const prefix = 'i' + crypto.createHash('sha1')
            .update(path.basename(file.relative, path.extname(file.relative)))
            .digest('hex')
            .substr(0, 4);

        const plugins = [
            {removeDoctype: true},
            {removeComments: true},
            {removeTitle: true},
            {convertStyleToAttrs: true},
            {
                cleanupIDs: {
                    prefix: prefix + '-',
                    minify: true
                }
            },
            {removeViewBox: false},
            {removeStyleElement: true},
            {
                cleanupNumericValues: {
                    floatPrecision: 5
                }
            }
        ];

        // per file svgmin options
        const $ = cheerio.load(file.contents.toString(), config.cheerioParserSvgOptions);
        const $opts = $('#svgo-options');
        const opts = JSON.parse($opts.html());

        if (opts) {
            for (let i = 0; i < opts.length; ++i) {
                plugins.push(opts[i]);
            }
        }

        return {plugins: plugins};
    }

    const task = function () {
        return gulp.src(config.srcPath + config.assetsDir + 'svg/*.svg', {base: config.srcPath})
            .pipe(cacheBustSvgRefs())
            .pipe(changed(config.varPath))
            .pipe(svgmin(svgminCallback))
            .pipe(cleanSvg())
            .pipe(gulp.dest(config.varPath)).pipe(touch())
            .pipe(clearSvgParams())
            .pipe(gulp.dest(config.distPath)).pipe(touch());
    };

    // svg availability in SCSS
    const scssTask = function () {
        return gulp.src(config.varPath + config.assetsDir + 'svg/*.svg')
            .pipe(svgToScss({
                template: config.srcPath + 'svg.scss.mustache',
                output: '_icon-svg.scss'
            }))
            .pipe(gulp.dest(config.varPath)).pipe(touch())
            ;
    };

    // svg availability for inclusion as inline symbol in html
    const symbolTask = function () {
        return gulp.src(config.varPath + config.assetsDir + 'svg/*.svg', {base: config.varPath})
            .pipe(changed(config.distPath, {extension: '.symbol.svg'}))
            .pipe(svgToSymbol())
            .pipe(clearSvgParams())
            .pipe(rename(function (path) {
                path.extname = '.symbol.svg';
            }))
            .pipe(gulp.dest(config.distPath)).pipe(touch());

    };

    const watcher = function () {
        return gulp.parallel(
            // prepare svg and output to img dir
            gulp.watch([
                config.varPath + 'svg/*.svg',
                config.srcPath + config.assetsDir + 'svg/*.svg',
                config.srcPath + config.assetsDir + 'img/*'
            ], task),
            // create symbols and update scss lib
            gulp.watch([
                config.varPath + config.assetsDir + 'svg/*.svg',
                config.srcPath + 'svg.scss.mustache'
            ], gulp.parallel(scssTask, symbolTask))
        );
    };

    return {
        task: task,
        watch: watcher,
        scss: scssTask,
        symbol: symbolTask
    };
}
;
