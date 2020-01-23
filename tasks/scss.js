module.exports = function (config) {

    if (!config.tasks.scss) {
        return false;
    }

    const
        autoprefixer = require('gulp-autoprefixer'),
        changed = require('gulp-changed'),
        browserSync = require('../lib/browsersync'),
        cacheBustCssRefs = require('../lib/cachebust-css-refs')(config),
        cssnano = require('../lib/cssnano-stream'),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        rename = require('gulp-rename'),
        sass = require('gulp-sass'),
        touch = require('../lib/touch');


    const scss = function () {
        return gulp.src([
            config.srcPath + config.assetsDir + 'scss/*.scss',
            config.srcPath + config.assetsDir + 'scss/**/*.scss',
        ], {base: config.srcPath})
            // .pipe(changed(config.varPath))
            .pipe(sass({
                outputStyle: 'expanded',
                precision: 8
            }).on('error', sass.logError))
            .pipe(rename(function (path) {
                path.dirname = path.dirname.replace('scss', 'css');
            }))
            .pipe(autoprefixer(...config.tasks.scss.autoprefixer))
            .pipe(cacheBustCssRefs(config.distPath + config.assetsDir + 'css/'))
            .pipe(gulpif(
                function (file) {
                    // disable cssnano for some files
                    return config.production && config.tasks.scss.nonano.indexOf(file.basename) === -1;
                },
                cssnano({
                    autoprefixer: false,
                    zindex: false
                })
            ))
            .pipe(gulp.dest(config.distPath))
            .pipe(browserSync.stream())
            .pipe(touch())
            ;
    };

    const watch_scss = function () {
        return gulp.watch([
            config.srcPath + config.assetsDir + 'scss/*.scss',
            config.srcPath + config.assetsDir + 'scss/**/*.scss',
            config.varPath + '_icon-svg.scss'
        ], scss);
    };

    return [
        scss,
        watch_scss
    ];

};
