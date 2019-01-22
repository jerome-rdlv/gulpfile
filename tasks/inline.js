/*global config*/
if (config.tasks.js) {
    define();
}

function define() {
    const
        browserSync = require('browser-sync').get('bs'),
        browserify = require('browserify'),
        buffer = require('vinyl-buffer'),
        gulp = require('gulp'),
        touch = require('../lib/touch'),
        source = require('vinyl-source-stream'),
        transform = require('vinyl-transform'),
        through = require('through2');
    uglify = require('gulp-uglify');

    var bundler = function () {
        return through.obj(function (file, encoding, callback) {
            file.contents = browserify(file.path).bundle();
            this.push(file);
            callback();
        });
    };

    var entries = config.inlines.map(function (entry) {
        return config.srcPath + config.assetsDir + entry;
    });

    gulp.task('inline', function () {
        return gulp.src(entries, {base: config.srcPath})
            // .pipe(bundler())
            // .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest(config.distPath)).pipe(touch())
            .pipe(browserSync.stream());
    });

    gulp.task('watch:inline', function () {
        return gulp.watch(entries, {base: config.srcPath}, gulp.parallel('inline'));
    });
}
