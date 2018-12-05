/*global config*/
if (config.tasks.js) {
    define();
}

function define() {
    const
        browserSync = require('browser-sync').get('bs'),
        // eslint = require('gulp-eslint'),
        gulp = require('gulp'),
        named = require('vinyl-named'),
        touch = require('../lib/touch'),
        terser = require('gulp-terser'),
        webpack = require('webpack-stream')
    ;

    gulp.task('js', function () {

        let src = [];
        if (config.entries.length) {
            for (let i = 0; i < config.entries.length; ++i) {
                src.push(config.srcPath + config.assetsDir + config.entries[i]);
            }
        }
        else {
            src.push(config.srcPath + config.assetsDir + 'js/*.js');
        }

        return gulp.src(src, {base: config.srcPath})
            // .pipe(eslint())
            // .pipe(eslint.format())
            .pipe(named())
            .pipe(webpack({
                target: 'web',
                module: {
                    rules: [
                        {
                            enforce: 'pre',
                            test: /.jsx?$/,
                            exclude: /node_modules/,
                            loader: 'eslint-loader',
                            options: {
                                failOnError: false,
                                failOnWarning: false,
                            }
                        },
                        // {
                        //     test: /.jsx?$/,
                        //     exclude: /node_modules/,
                        //     loader: 'babel-loader',
                        // },
                    ],
                },
                watch: global.watch,
                devtool: 'inline-source-map',
                output: {
                    filename: 'js/[name].js',
                }
            }))
            // .pipe(through.obj(function (file, enc, cb) {
            //     file.path = file.path.replace(file.base, config.srcPath);
            //     file.base = config.srcPath;
            //     this.push(file);
            //     cb();
            // }))
            .pipe(gulp.dest(config.devPath)).pipe(touch())
            // .pipe(through.obj(function (file, enc, cb) {
            //     // Don’t pipe through any source map files as it will be handled by gulp-sourcemaps
            //     if (!/\.map$/.test(file.path)) {
            //         this.push(file);
            //     }
            //     cb();
            // }))
            .pipe(browserSync.stream())
            .pipe(terser())
            .pipe(gulp.dest(config.prodPath)).pipe(touch())
            .pipe(gulp.dest(config.varPath)).pipe(touch())
            ;
    });
}