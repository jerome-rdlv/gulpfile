/*
Check and compress scripts to be inlined in HTML. This task
is different from `js` because it does not bundle dependencies.
 */
module.exports = function (config) {

    if (!config.tasks.jsil || !config.tasks.jsil.length) {
        return false;
    }

    const
        browserSync = require('../lib/browsersync'),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        touch = require('../lib/touch'),
        uglify = require('gulp-uglify');

    const src = config.tasks.jsil.map(function (entry) {
        return config.srcPath + config.assetsDir + entry;
    });

    const jsil = function (cb) {
        return gulp.src(src, {base: config.srcPath})
            .pipe(gulpif(config.production, uglify()))
            .pipe(gulp.dest(config.distPath)).pipe(touch())
            .pipe(browserSync.stream());
    };

    const watch_jsil = function (cb) {
        return gulp.watch(src, {base: config.srcPath}, jsil);
    };

    return [
        jsil,
        watch_jsil
    ];
};
