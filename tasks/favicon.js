/*global config*/
const
    gulp = require('gulp'),
    touch = require('../lib/touch')
;

gulp.task('favicon', function () {
    return gulp.src(config.srcPath + 'favicon.ico', {allowEmpty: true})
        .pipe(gulp.dest(config.devPath)).pipe(touch())
        .pipe(gulp.dest(config.prodPath)).pipe(touch())
    ;
});