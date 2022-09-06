module.exports = function (config) {

    const
        browserSync = require('../lib/browsersync'),
        gulp = require('gulp')
    ;

    // return the task
    return function browsersync() {
        if (!config.url || !config.url.length) {
            throw 'You must add --url argument for browserSync to work.';
        }
        return browserSync.init(config);
    };
};
