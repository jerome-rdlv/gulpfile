/*global config*/
if (!config.tasks.scss) return;

if (config.tasks.scss.browsersync && !config.url.length) {
    // eslint-disable-next-line no-console
    console.error('You must configure project URL for browserSync to work');
    process.exit(1);
}

const
    autoprefixer = require('gulp-autoprefixer'),
    changed = require('gulp-changed'),
    browserSync = require('browser-sync').get('bs'),
    cacheBustCssRefs = require('../lib/cachebust-css-refs'),
    cssnano = require('gulp-cssnano'),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    touch = require('../lib/touch')
;

gulp.task('scss', function () {
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
        .pipe(gulp.dest(config.devPath)).pipe(touch())
        .pipe(browserSync.stream())
        .pipe(cacheBustCssRefs(config.prodPath + config.assetsDir +'css/'))
        .pipe(cssnano({
            autoprefixer: false,
            zindex: false
        }))
        .pipe(gulp.dest(config.varPath)).pipe(touch())
        .pipe(gulp.dest(config.prodPath)).pipe(touch())
    ;
});
