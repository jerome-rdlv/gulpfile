module.exports = function (config) {

    if (config.production || !config.tasks.browsersync) {
        return false;
    }

    if (!config.url.length) {
        throw 'You must configure project URL for browserSync to work';
    }

    const
        browserSync = require('../lib/browsersync'),
        gulp = require('gulp')
    ;

    // return the task
    return function watch_browsersync() {
        return browserSync.init(config);
    };
};
