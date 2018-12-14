/*global config*/
if (config.tasks.js) {
    define()
}

function define() {
    const
        browserSync = require('browser-sync').get('bs'),
        // eslint = require('gulp-eslint'),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        named = require('vinyl-named'),
        touch = require('../lib/touch'),
        terser = require('gulp-terser'),
        webpack = require('webpack-stream')
    

    gulp.task('js', function () {

        let src = []
        if (config.entries.length) {
            for (let i = 0; i < config.entries.length; ++i) {
                src.push(config.srcPath + config.assetsDir + config.entries[i])
            }
        } else {
            src.push(config.srcPath + config.assetsDir + 'js/*.js')
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
                mode: config.production ? 'production' : 'development',
                output: {
                    filename: 'js/[name].js',
                }
            }))
            .pipe(gulpif(config.production, terser()))
            .pipe(gulp.dest(config.distPath)).pipe(touch())
            .pipe(gulp.dest(config.varPath)).pipe(touch())
            .pipe(browserSync.stream())
            
    })
}