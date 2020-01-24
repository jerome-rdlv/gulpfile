const gulp = require('gulp');

module.exports = function run(task, ...args) {
    var dummy = function () {
        return task.apply(null, args);
    };
    Object.defineProperty(dummy, 'name', {
        value: task.name
    });
    return new Promise(function (resolve, reject) {
        gulp.series(dummy)(function (error) {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};
