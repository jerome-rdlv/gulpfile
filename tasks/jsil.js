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
        touch = require('../lib/touch'),
        uglify = require('gulp-uglify');

    const src = config.tasks.jsil.map(function (entry) {
        return config.srcPath + config.assetsDir + entry;
    });

    const task = function (cb) {
        return gulp.src(src, {base: config.srcPath})
            .pipe(uglify())
            .pipe(gulp.dest(config.distPath)).pipe(touch())
            .pipe(browserSync.stream());
    };

    const watcher = function (cb) {
        return gulp.watch(src, {base: config.srcPath}, gulp.parallel('inline'));
    };

    return {
        task: task,
        watch: watcher
    };
};
