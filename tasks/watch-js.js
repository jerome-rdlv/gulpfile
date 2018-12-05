/*global config*/
if (!config.tasks.js) return;

const gulp = require('gulp');

gulp.task('watch:js', gulp.series(
    function setWatchTrue(done) {
        global.watch = true;
        done();
    },
    'js'
    // watching is done by WebPack when global.watch is true
    // function watchJs() {
    //     return gulp.watch(config.srcPath + config.assetsDir + 'js/*.js', gulp.parallel('js'));
    // }
));