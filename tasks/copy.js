module.exports = function (config) {

    if (!config.tasks.copy || !config.tasks.copy.length) {
        return false;
    }

    const
        changed = require('gulp-changed'),
        gulp = require('gulp'),
        touch = require('../lib/touch');

    const resources = config.tasks.copy.map(function (resource) {
        return config.srcPath + resource;
    });

    const task = function () {
        return gulp.src(resources, {
            allowEmpty: true,
            base: config.srcPath
        })
            .pipe(changed(config.distPath))
            .pipe(gulp.dest(config.distPath))
            .pipe(touch());
    };

    return {
        task: task,
        watcher: function () {
            return gulp.watch(resources, task);
        }
    };
};