/*global config*/
if (!config.tasks.scss) return;

const gulp = require('gulp');

gulp.task('watch:scss', function () {
    return gulp.watch([
        config.srcPath + config.assetsDir + 'scss/*.scss',
        config.srcPath + config.assetsDir + 'scss/**/*.scss',
        config.varPath + '_icon-svg.scss'
    ], gulp.parallel('scss'));
});