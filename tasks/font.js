/*global config*/
const
    changed = require('gulp-changed'),
    gulp = require('gulp'),
    touch = require('../lib/touch')


gulp.task('font', function () {
    return gulp.src(config.srcPath + config.assetsDir + 'font/*', {base: config.srcPath})
        .pipe(changed(config.distPath))
        .pipe(gulp.dest(config.distPath)).pipe(touch())
        
})