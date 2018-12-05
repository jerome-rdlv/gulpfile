/*global config*/
if (!config.tasks.svg) return;

const
    changed = require('gulp-changed'),
    clearSvgParams = require('../lib/clear-svg-params'),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    svgToSymbol = require('../lib/svg-to-symbol'),
    touch = require('../lib/touch')
;

// svg availability for inclusion as inline symbol in html
gulp.task('svg-symbol', function () {
    return gulp.src(config.varPath + config.assetsDir + 'svg/*.svg', {base: config.varPath})
        .pipe(changed(config.devPath, {extension: '.symbol.svg'}))
        .pipe(svgToSymbol())
        .pipe(clearSvgParams())
        .pipe(rename(function (path) {
            path.extname = '.symbol.svg'
        }))
        .pipe(gulp.dest(config.devPath)).pipe(touch())
        .pipe(gulp.dest(config.prodPath)).pipe(touch())
    ;
});
