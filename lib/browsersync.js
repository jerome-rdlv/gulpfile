const name = 'bs';
const browserSync = require('browser-sync');
const passthrough = require('./passthrough');
let ready = false;

module.exports = {
    init: function (options) {
        browserSync.create(name);
        browserSync.get(name).init(options);
        ready = true;
        return browserSync.get(name);
    },
    ready: function () {
        return ready;
    },
    get: function () {
        return ready ? browserSync.get(name) : false;
    },
    stream: function () {
        if (ready) {
            return browserSync.get(name).stream();
        } else {
            return passthrough();
        }
    }
};
