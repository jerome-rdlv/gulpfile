/*global config*/
if (!config.tasks.svg) return;

const gulp = require('gulp');

gulp.task('watch:svg-var', function () {
    return gulp.watch([
        config.varPath + config.assetsDir + 'svg/*.svg',
        config.srcPath + 'svg.scss.mustache'
    ], gulp.parallel('svg-scss', 'svg-symbol'));
});