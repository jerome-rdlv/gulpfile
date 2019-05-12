module.exports = function (config) {

    if (!config.tasks.symlink || !config.tasks.symlink.length) {
        return false;
    }

    const
        gulp = require('gulp'),
        vfs = require('vinyl-fs');

    return function () {
        return vfs.src(config.tasks.symlink.map(function (item) {
            return config.srcPath + item;
        })).pipe(vfs.symlink(config.distPath));
    };
};