/*global config*/
if (!config.tasks.img) return;

const
    changed = require('gulp-changed'),
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    imageResize = require('gulp-image-resize'),
    rename = require('gulp-rename'),
    touch = require('../lib/touch')
;

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

const imgGlob = 'img/**/*.+(png|jpg|gif|jpeg)';
const imgSrc = config.srcPath + config.assetsDir + imgGlob;

gulp.task('img', function () {
    return gulp.src(imgSrc, {base: config.srcPath})
        .pipe(changed(config.devPath))
        .pipe(imageResize({
            quality: 0.85
        }))
        .pipe(imagemin(config.imageminOptions, {verbose: false}))
        .pipe(gulp.dest(config.devPath)).pipe(touch())
        .pipe(gulp.dest(config.prodPath)).pipe(touch())
    ;
});


let imgTasks = [];
thumbs.forEach(function (item) {
    const name = 'img_resize'+ item.suffix;
    const srcs = [config.srcPath + config.assetsDir + 'img/*.+(png|jpg|jpeg)'];

    if (/^_p/.test(item.suffix)) {
        srcs.push(config.srcPath + config.assetsDir + 'img/portrait/*.+(png|jpg|jpeg)');
    }

    item.quality = 0.85;
    item.upscale = false;
    item.format = 'jpg';
    item.filter = 'Catrom';

    gulp.task(name, function () {
        return gulp.src(srcs, {base: config.srcPath})
            .pipe(rename({
                suffix: item.suffix
            }))
            .pipe(changed(config.devPath)).pipe(touch())
            .pipe(imageResize(item))
            .pipe(imagemin(config.imageminOptions, {verbose: false}))
            .pipe(gulp.dest(config.devPath)).pipe(touch())
            .pipe(gulp.dest(config.prodPath)).pipe(touch())
        ;
    });
    imgTasks.push(name);
});

let watches = ['img'];

if (imgTasks.length) {
    let imgLarge = gulp.parallel(imgTasks);
    gulp.task('imglarge', imgLarge);
    watches.push = imgLarge;
}


gulp.task('watch:img', function () {
    return gulp.watch(imgSrc, gulp.parallel(watches));
});