/*global config*/
if (!config.tasks.svg) return;

const gulp = require('gulp');

gulp.task('watch:svg', function () {
    return gulp.watch([
        config.varPath + 'svg/*.svg',
        config.srcPath + config.assetsDir + 'svg/*.svg',
        config.srcPath + config.assetsDir + 'img/*'
    ], gulp.parallel('svg'));
});