/*global config*/
const
    changed = require('gulp-changed'),
    gulp = require('gulp'),
    touch = require('../lib/touch')
;

gulp.task('font', function () {
    return gulp.src(config.srcPath + config.assetsDir + 'font/*', {base: config.srcPath})
        .pipe(changed(config.devPath))
        .pipe(gulp.dest(config.devPath)).pipe(touch())
        .pipe(gulp.dest(config.prodPath)).pipe(touch())
    ;
});