const browserSync = require('browser-sync');
const gulp = require('gulp');
const passthrough = require('./passthrough');
let ready = false;
const instances = [];

module.exports = {
    init: function (urls) {
        if (typeof urls === 'string') {
            urls = [urls];
        }

        let promise = Promise.resolve();
        urls.forEach(function (url, index) {
            promise = promise.then(function () {
                return new Promise(function (resolve) {
                    const instance = browserSync.create('bs-' + index);
                    instance.init({
                        proxy: url,
                        open: false
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
    get: function (name) {
        return ready ? browserSync.get(name) : false;
    },
    stream: function (name) {
        if (ready) {
            if (name) {
                return browserSync.get(name).stream();
            } else {
                const stream = gulp;
                instances.forEach(function (instance) {
                    console.log('pipe stream');
                    stream = stream.pipe(instance.stream());
                });
                return stream;
            }
        } else {
            return passthrough();
        }
    }
};
