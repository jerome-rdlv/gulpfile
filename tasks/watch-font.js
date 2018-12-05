const gulp = require('gulp');

gulp.task('watch:font', function () {
    return gulp.watch(config.srcPath + config.assetsDir + 'font/*', gulp.series('font'));
});