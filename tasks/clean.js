module.exports = function (config) {
    const
        gulp = require('gulp'),
        clean = require('gulp-clean');

    return function () {
        return gulp.src(
            [
                config.distPath + '*',
                config.varPath + '*'
            ], {
                base: config.srcPath,
                read: false
            }
        ).pipe(clean({force: true}));
    };
};