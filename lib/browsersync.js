const name = 'bs';
const browserSync = require('browser-sync'),
    gulp = require('gulp'),
    passthrough = require('./passthrough');
let ready = false;

const instances = [];

module.exports = {
    init: function (config) {

        var urls = config.url;
        if (typeof urls === 'string') {
            urls = [urls];
        }

        let promise = Promise.resolve();
        urls.forEach(function (url, index) {
            promise = promise.then(function () {
                return new Promise(function (resolve) {
                    const instance = browserSync.create('bs-' + index);
                    instance.init({
                        files: config.distPath + '**/*',
                        open: false,
                        proxy: url,
                        ui: false,
                    }, resolve);
                    instances.push(instance);
                });
            });
        });

        return promise.then(function () {
            ready = true;
        });
    },
    ready: function () {
        return ready;
    },
};
