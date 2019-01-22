/*global config*/
if (config.tasks.js) {
    define();
}

function define() {
    const
        browserify = require('browserify'),
        gulp = require('gulp'),
        touch = require('../lib/touch'),
        source = require('vinyl-source-stream'),
        transform = require('vinyl-transform'),
        uglify = require('gulp-uglify');

    var browserified = transform(function (filename) {
        var b = browserify(filename);
        return b.bundle();
    });

    var entries = config.inlines.map(function (entry) {
        return config.srcPath + config.assetsDir + entry;
    });

    gulp.task('inline', function () {
        return browserify({
            entries: entries
        }).bundle()
            .pipe(source('bundle.js'))
            .pipe(gulp.dest(config.distPath)).pipe(touch());
        // return gulp.src('header.js', {base: config.srcPath})
        //     .pipe(browserified)
        //     .pipe(uglify())
        //     .pipe(gulp.dest(config.distPath)).pipe(touch());
    });
}