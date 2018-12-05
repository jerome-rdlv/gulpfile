/*global config*/
const
    gulp = require('gulp'),
    requireDir = require('require-dir')
;

// create browserSync instance
require('browser-sync').create('bs');

global.config = require('./lib/get-config');
global.watch = false;

config.cheerioParserSvgOptions = {
    recognizeSelfClosing: true,
    lowerCaseTags: false,
    decodeEntities: false,
    xmlMode: true
};

let tasks = [
    'favicon',
    'htaccess'
];

let watchers = [];

requireDir('./tasks', {recurse: true});

if (config.tasks.browsersync) {
    watchers.push('browsersync');
}
if (config.tasks.img) {
    tasks.push('img');
    watchers.push('watch:img');
}
if (config.tasks.font) {
    tasks.push('font');
    watchers.push('watch:font');
}
if (config.tasks.svg) {
    if (config.tasks.scss) {
        tasks.push(gulp.series(
            'svg',
            gulp.parallel(
                'svg-symbol',
                gulp.series('svg-scss', 'scss')
            )
        ));
    }
    else {
        tasks.push(gulp.series('svg', 'svg-symbol'));
    }
    watchers.push('watch:svg');
    watchers.push('watch:svg-var');
}
else if (config.tasks.scss) {
    tasks.push('scss');
}

if (config.tasks.scss) {
    watchers.push('watch:scss');
}
if (config.tasks.js) {
    tasks.push('js');
    watchers.push('watch:js');
}



gulp.task('default', gulp.parallel(tasks));
gulp.task('watch', gulp.series(
    'default',
    gulp.parallel(watchers)
));
