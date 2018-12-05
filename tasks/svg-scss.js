/*global config*/
if (!config.tasks.scss || !config.tasks.svg) return;

const
    gulp = require('gulp'),
    svgToScss = require('../lib/svg-to-scss'),
    touch = require('../lib/touch')
;

// svg availability in SCSS
gulp.task('svg-scss', function () {
    return gulp.src(config.varPath + config.assetsDir +'svg/*.svg')
        .pipe(svgToScss({
            template: config.srcPath + 'svg.scss.mustache',
            output: '_icon-svg.scss'
        }))
        .pipe(gulp.dest(config.varPath)).pipe(touch())
    ;
});
