module.exports = function (config) {

    if (!config.url.length) {
        throw 'You must configure project URL for browserSync to work';
    }

    const
        browserSync = require('../lib/browsersync'),
        gulp = require('gulp')
    ;

    // return the task
    return function browsersync() {
        return browserSync.init(config);
    };
};
