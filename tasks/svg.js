/*global config*/
if (!config.tasks.svg) return

const
    cacheBustSvgRefs = require('../lib/cachebust-svg-refs'),
    changed = require('gulp-changed'),
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
                prefix: prefix + '-'
            }
        },
        {removeViewBox: false},
        {removeStyleElement: false},
        {
            cleanupNumericValues: {
                floatPrecision: 5
            }
        }
    ]

    if (/_anim\.svg$/.test(file.path)) {
        plugins.push({mergePaths: false})
    }
    return {plugins: plugins}
}

gulp.task('svg', function () {
    return gulp.src(config.srcPath + config.assetsDir + 'svg/*.svg', {base: config.srcPath})
        .pipe(cacheBustSvgRefs())
        .pipe(changed(config.varPath))
        .pipe(cleanSvg())
        .pipe(svgmin(svgminCallback))
        .pipe(gulp.dest(config.varPath)).pipe(touch())
        .pipe(clearSvgParams())
        .pipe(gulp.dest(config.distPath)).pipe(touch())
        
})
