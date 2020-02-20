module.exports = function (config) {

    if (!config.tasks.scss) {
        return false;
    }

    const
        autoprefixer = require('gulp-autoprefixer'),
        browserSync = require('../lib/browsersync'),
        cacheBustCssRefs = require('../lib/cachebust-css-refs')(config),
        changed = require('gulp-changed'),
        cssnano = require('../lib/cssnano-stream'),
        mqsplit = require('../lib/css-mq-split')(config),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        path = require('path'),
        rename = require('gulp-rename'),
        run = require('../lib/run'),
        sass = require('gulp-sass'),
        touch = require('../lib/touch');


    const scss = function (src) {

        if (!src || typeof src !== 'string' || /^_/.test(path.basename(src))) {
            src = [
                config.srcPath + config.assetsDir + 'scss/*.scss',
                config.srcPath + config.assetsDir + 'scss/**/*.scss',
            ];
        }

        return gulp.src(src, {base: config.srcPath})
            .pipe(changed(config.distPath))
            .pipe(sass({
                outputStyle: 'expanded',
                precision: 8
            }).on('error', sass.logError))
            .pipe(rename(function (path) {
                path.dirname = path.dirname.replace('scss', 'css');
            }))
            .pipe(autoprefixer())
            .pipe(mqsplit())
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
            .pipe(touch())
            ;
    };

    const watch_scss = function () {
        return gulp.watch([
            config.srcPath + config.assetsDir + 'scss/*.scss',
            config.srcPath + config.assetsDir + 'scss/**/*.scss',
            config.varPath + '_icon-svg.scss'
        ])
            .on('change', function (path) {
                return run(scss, path);
            })
            .on('add', function (path) {
                return run(scss, path);
            })
            ;
    };

    return [
        scss,
        watch_scss
    ];

};
