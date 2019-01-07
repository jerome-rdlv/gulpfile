/*global config*/
if (!config.tasks.svg) return

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
    touch = require('../lib/touch')


function svgminCallback(file) {
    const prefix = 'i' + crypto.createHash('sha1')
        .update(path.basename(file.relative, path.extname(file.relative)))
        .digest('hex')
        .substr(0, 4)

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
    ]

    // per file svgmin options
    const $ = cheerio.load(file.contents.toString(), config.cheerioParserSvgOptions)
    const $opts = $('#svgo-options');
    const opts = JSON.parse($opts.html());
    
    if (opts) {
        for (let i = 0; i < opts.length; ++i) {
            plugins.push(opts[i]);
        }
    }
    
    return {plugins: plugins}
}

gulp.task('svg', function () {
    return gulp.src(config.srcPath + config.assetsDir + 'svg/*.svg', {base: config.srcPath})
        .pipe(cacheBustSvgRefs())
        .pipe(changed(config.varPath))
        .pipe(svgmin(svgminCallback))
        .pipe(cleanSvg())
        .pipe(gulp.dest(config.varPath)).pipe(touch())
        .pipe(clearSvgParams())
        .pipe(gulp.dest(config.distPath)).pipe(touch())

})
