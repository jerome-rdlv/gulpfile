module.exports = function (config) {

    if (!config.tasks.scss) {
        return false;
    }

    const
        autoprefixer = require('autoprefixer'),
        cacheBustCssRefs = require('../lib/cachebust-css-refs')(config),
        changed = require('gulp-changed'),
        cssnano = require('cssnano'),
        splitPrint = require('../lib/postcss-split-print')(config.tasks.scss.print),
        subset = require('../lib/css-targeted-subset')(config.tasks.scss.split),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        path = require('path'),
        postcss = require('gulp-postcss'),
        pxtorem = require('postcss-pxtorem'),
        rename = require('gulp-rename'),
        touch = require('../lib/touch');


    const scss = function (src) {

        if (!src || typeof src !== 'string' || /^_/.test(path.basename(src))) {
            src = [
                config.srcPath + config.assetsDir + 'scss/*.scss',
                '!' + config.srcPath + config.assetsDir + 'scss/_*.scss',
                config.srcPath + config.assetsDir + 'scss/**/*.scss',
                '!' + config.srcPath + config.assetsDir + 'scss/**/_*.scss',
            ];
        }

        let compile;

        if (config.tasks.scss.engine === 'dart') {
            compile = require('gulp-exec')(file => `/usr/bin/sass "${file.path}"`, {
                continueOnError: false,
                pipeStdout: true
            }).on('error', console.log);
        } else {
            const sass = require('gulp-sass')(require('sass'));
            compile = sass({
                outputStyle: 'expanded',
                precision: 8
            }).on('error', sass.logError);
        }

        return gulp.src(src, {base: config.srcPath})
            .pipe(changed(config.distPath))
            .pipe(compile)
            .pipe(rename(function (path) {
                path.extname = path.extname.replace('scss', 'css');
                path.dirname = path.dirname.replace('scss', 'css');
            }))
            // these transforms are needed for cross-platform tests during development
            .pipe(postcss([
                autoprefixer({}),
                pxtorem(config.tasks.scss.pxtorem),
            ]))
            .pipe(splitPrint())
            .pipe(subset())
            .pipe(gulpif(
                config.production,
                cacheBustCssRefs(config.distPath + config.assetsDir + 'css/')
            ))
            .pipe(gulpif(
                function (file) {
                    // disable cssnano for some files
                    return config.production && config.tasks.scss.nonano.indexOf(file.basename) === -1;
                },
                postcss([
                    cssnano(config.tasks.scss.cssnano),
                ])
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
        ], gulp.series(scss));
    };

    return [
        scss,
        watch_scss
    ];

};
