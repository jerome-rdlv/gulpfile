module.exports = function (config) {

    if (!config.tasks.img) {
        return false;
    }

    const
        changed = require('gulp-changed'),
        gulp = require('gulp'),
        imagemin = require('gulp-imagemin'),
        imageResize = require('gulp-image-resize'),
        rename = require('gulp-rename'),
        touch = require('../lib/touch');

    // image sizes
    const thumbs = [];
    // landscape / original format
    // var inc = 80, i;
    // for (i = 320; i <= 1800; i += inc) {
    //     thumbs.push({
    //         width: i,
    //         suffix: '_ls'+ i
    //     });
    //     if (i >= 800) {
    //         inc = 200;
    //     }
    // }

    const extGlob = '(gif|jpg|jpeg|png)';
    const imgGlob = `img/**/*.+${extGlob}`;
    const imgSrc = config.srcPath + config.assetsDir + imgGlob;

    const mainTask = function () {
        return gulp.src(imgSrc, {base: config.srcPath})
            .pipe(changed(config.distPath))
            .pipe(imageResize({
                quality: 0.85
            }))
            .pipe(imagemin(config.imageminOptions, {verbose: false}))
            .pipe(gulp.dest(config.distPath)).pipe(touch());

    };

    let subtasks = [mainTask];

    let thumbTasks = thumbs.map(function (item) {
        const name = 'img_resize' + item.suffix;
        const srcs = [config.srcPath + config.assetsDir + `img/*.+${extGlob}`];

        if (/^_p/.test(item.suffix)) {
            srcs.push(config.srcPath + config.assetsDir + `img/portrait/*.+${extGlob}`);
        }

        item.quality = 0.85;
        item.upscale = false;
        item.format = 'jpg';
        item.filter = 'Catrom';

        return function () {
            return gulp.src(srcs, {base: config.srcPath})
                .pipe(rename({
                    suffix: item.suffix
                }))
                .pipe(changed(config.distPath)).pipe(touch())
                .pipe(imageResize(item))
                .pipe(imagemin(config.imageminOptions, {verbose: false}))
                .pipe(gulp.dest(config.distPath)).pipe(touch());

        };
    });

    if (thumbTasks.length) {
        subtasks.push.apply(null, thumbTasks);
    }

    const watcher = function () {
        return gulp.watch(imgSrc, gulp.parallel(subtasks));
    };

    return {
        task: mainTask,
        watcher: watcher,
    };
};