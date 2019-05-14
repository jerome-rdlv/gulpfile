module.exports = function (config) {
    const
        gulp = require('gulp'),
        gulpClean = require('gulp-clean');

    var src = [
        config.distPath + '*',
        config.varPath + '*'
    ];

    if (config.tasks.cleanex) {
        config.tasks.cleanex.forEach(function (exclude) {
            src.push('!' + config.distPath + exclude);
        });
    }

    return function clean() {
        return gulp.src(src, {
            allowEmpty: true,
            base: config.srcPath,
            dot: true,
            read: false
        }).pipe(gulpClean());
    };
};