module.exports = function (config) {

    if (!config.tasks.scss) {
        return false;
    }

    const
        autoprefixer = require('gulp-autoprefixer'),
        changed = require('gulp-changed'),
        browserSync = require('../lib/browsersync'),
        cacheBustCssRefs = require('../lib/cachebust-css-refs'),
        cssnano = require('gulp-cssnano'),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        rename = require('gulp-rename'),
        sass = require('gulp-sass'),
        touch = require('../lib/touch');


    const task = function () {
        return gulp.src(config.srcPath + config.assetsDir + 'scss/*.scss', {base: config.srcPath})
        // .pipe(changed(config.varPath))
            .pipe(sass({
                outputStyle: 'expanded',
                precision: 8
            }).on('error', sass.logError))
            .pipe(rename(function (path) {
                path.dirname = path.dirname.replace('scss', 'css');
            }))
            .pipe(autoprefixer(...config.tasks.scss.autoprefixer))
            .pipe(browserSync.stream())
            .pipe(cacheBustCssRefs(config.distPath + config.assetsDir + 'css/'))
            .pipe(gulpif(config.production, cssnano({
                autoprefixer: false,
                zindex: false
            })))
            .pipe(gulp.dest(config.varPath)).pipe(touch())
            .pipe(gulp.dest(config.distPath)).pipe(touch());

    };

    const watcher = function () {
        return gulp.watch([
            config.srcPath + config.assetsDir + 'scss/*.scss',
            config.srcPath + config.assetsDir + 'scss/**/*.scss',
            config.varPath + '_icon-svg.scss'
        ], gulp.parallel(task));
    };

    return {
        task: task,
        watch: watcher
    };

};
