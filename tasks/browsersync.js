/*global config*/
if (!config.tasks.browsersync) return;

if (!config.url.length) {
    // eslint-disable-next-line no-console
    console.error('You must configure project URL for browserSync to work');
    process.exit(1);
}

const
    browserSync = require('browser-sync').get('bs'),
    gulp = require('gulp')
;

gulp.task('browsersync', function () {
    return browserSync.init({
        proxy: config.url,
        open: false,
    });
});