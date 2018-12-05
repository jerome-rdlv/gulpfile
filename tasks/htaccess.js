/*global config*/
const
    gulp = require('gulp'),
    touch = require('../lib/touch')
;

gulp.task('htaccess', function () {
    return gulp.src(config.srcPath + config.assetsDir + '.htaccess', {
        base: config.srcPath,
        allowEmpty: true
    })
        .pipe(gulp.dest(config.prodPath)).pipe(touch())
    ;
});
