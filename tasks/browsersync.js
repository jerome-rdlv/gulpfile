module.exports = function (config) {

    if (!config.tasks.browsersync) {
        return false;
    }

    if (!config.url.length) {
        // eslint-disable-next-line no-console
        throw 'You must configure project URL for browserSync to work';
    }

    const
        browserSync = require('../lib/browsersync'),
        gulp = require('gulp')
    ;

    // return the task
    return function () {
        return browserSync.init({
            proxy: config.url,
            open: false,
        });
    };
};

