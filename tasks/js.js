module.exports = function (config) {

    if (!config.tasks.js || !config.tasks.js.length) {
        return false;
    }

    function getBabelConfig(legacy, modules) {
        const envOptions = {
            corejs: "3",
            useBuiltIns: "usage",
            modules: modules,
            debug: config.debug
        };

        if (!legacy) {
            envOptions.targets = {
                esmodules: true
            };
        } else {
            envOptions.targets = '> 0.25% in FR, not dead';
        }

        return {
            exclude: 'node_modules/**',
            presets: [
                [
                    "@babel/preset-env",
                    envOptions
                ]
            ]
        };
    }

    function getWPConfig(legacy, watch) {

        const babelConfig = getBabelConfig(legacy, true);
        babelConfig.cacheDirectory = true;

        return {
            target: 'web',
            module: {
                rules: [
                    {
                        enforce: 'pre',
                        test: /\.m?jsx?$/,
                        exclude: /node_modules/,
                        loader: 'eslint-loader',
                        options: {
                            failOnError: false,
                            failOnWarning: false,
                        }
                    },
                    {
                        test: /\.m?jsx?$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: getBabelConfig(legacy)
                        },
                    },
                ],
            },
            watch: !!watch,
            devtool: config.production ? false : 'eval',
            mode: config.production ? 'production' : 'development',
            output: {
                filename: legacy ? 'js/[name].legacy.js' : 'js/[name].js'
            }
        };
    }

    const
        browserSync = require('../lib/browsersync'),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        named = require('vinyl-named'),
        touch = require('../lib/touch'),
        terser = require('gulp-terser'),
        webpack = require('webpack-stream');

    let src;
    if (config.tasks.js.length) {
        src = config.tasks.js.map(function (entry) {
            return config.srcPath + config.assetsDir + entry;
        });
    } else {
        src = [config.srcPath + config.assetsDir + 'js/*.js'];
    }

    const js = function (cb, watch) {

        return gulp.src(src, {
            base: config.srcPath,
            sourcemaps: true,
        })
            .pipe(named())
            .pipe(webpack({
                watch: !!watch,
                config: [getWPConfig(true, watch), getWPConfig(false, watch)]
            }))
            .pipe(gulpif(config.production, terser()))
            .pipe(gulp.dest(config.distPath, {
                sourcemaps: true
            }))
            .pipe(touch())
            ;
    };

    const watch_js = function (cb) {
        // if (config.production) {
        //     return gulp.watch(src, js);
        // } else {
        return js(cb, true);
        // }
    };

    return [
        js,
        watch_js
    ];
};