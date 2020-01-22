const browserSync = require('browser-sync'),
    gulp = require('gulp'),
    passthrough = require('./passthrough'),
    through = require('through2');
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
                return through.obj(function (file, encoding, callback) {
                    Promise.all(instances.map(function (instance) {
                        return new Promise(function (resolve) {
                            (instance.stream())._transform(file, encoding, resolve);
                        });
                    })).then(function () {
                        callback();
                    });
                });
            }
        } else {
            return passthrough();
        }
    }
};
