/*
Check and compress scripts to be inlined in HTML. This task
is different from `js` because it does not bundle dependencies.
 */
module.exports = function (config) {

    const
        browserSync = require('../lib/browsersync'),
        eslint = require('gulp-eslint'),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        touch = require('../lib/touch'),
        terser = require('gulp-terser');

    const src = config.tasks.jsil.map(function (entry) {
        return config.srcPath + config.assetsDir + entry;
    });

    src.push(config.srcPath + config.assetsDir + 'js/inline/*.js');

    const jsil = function () {
        return gulp.src(src, {base: config.srcPath})
            .pipe(eslint())
            .pipe(gulpif(config.production, terser()))
            .pipe(gulp.dest(config.distPath))
            .pipe(touch())
            ;
    };

    const watch_jsil = function () {
        return gulp.watch(src, {base: config.srcPath}, jsil);
    };

    return [
        jsil,
        watch_jsil
    ];
};
