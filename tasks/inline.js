/*global config*/
if (config.tasks.js) {
    define()
}

function define() {
    const
        browserify = require('browserify'),
        transform = require('vinyl-transform'),
        gulp = require('gulp');
    

    gulp.task('inline', function () {
        var browserified = transform(function (filename) {
            return browserify(filename).bundle();
        });
        
        var entries = config.inlines.map(function (entry) {
            return config.srcPath + config.assetsDir + entry;
        });
        
        return gulp.src(entries, {bas: config.srcPath})
            .pipe(browserified)
            .pipe(gulp.dest(config.distPath)).pipe(touch())
    })
}