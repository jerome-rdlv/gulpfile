module.exports = function (config) {
    const
        gulp = require('gulp'),
        gulpClean = require('gulp-clean');

    return function clean() {
        return gulp.src(
            [
                config.distPath,
                config.varPath
            ], {
                allowEmpty: true,
                base: config.srcPath,
                read: false
            }
        ).pipe(gulpClean({force: true}));
    };
};