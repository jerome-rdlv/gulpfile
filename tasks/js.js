module.exports = function (config) {

    if (!config.tasks.js || !config.tasks.js.length) {
        return false;
    }

    const
        browserSync = require('../lib/browsersync'),
        // eslint = require('gulp-eslint'),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        named = require('vinyl-named'),
        touch = require('../lib/touch'),
        terser = require('gulp-terser'),
        webpack = require('webpack-stream');

    const task = function () {

        let src;
        if (config.tasks.js.length) {
            src = config.tasks.js.map(function (entry) {
                return config.srcPath + config.assetsDir + entry;
            });
        } else {
            src = [config.srcPath + config.assetsDir + 'js/*.js'];
        }

        return gulp.src(src, {
            base: config.srcPath,
            sourcemaps: true,
        })
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
                mode: config.production ? 'production' : 'development',
                output: {
                    filename: 'js/[name].js',
                }
            }))
            .pipe(gulpif(config.production, terser()))
            .pipe(gulp.dest(config.distPath, {
                sourcemaps: true
            })).pipe(touch())
            .pipe(browserSync.stream());
    };

    const watcher = gulp.series(
        function setWatchTrue(done) {
            global.watch = true;
            done();
        },
        task
        // watching is done by WebPack when global.watch is true
        // function watchJs() {
        //     return gulp.watch(config.srcPath + config.assetsDir + 'js/*.js', gulp.parallel('js'));
        // }
    );

    return {
        task: task,
        watch: watcher
    };
};