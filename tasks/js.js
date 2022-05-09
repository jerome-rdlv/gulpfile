module.exports = function (config) {

    if (!config.tasks.js || !config.tasks.js.length) {
        return false;
    }

    function getBabelConfig(legacy, modules) {
        const envOptions = {
            corejs: 3,
            useBuiltIns: "usage",
            shippedProposals: true,
            modules: !!modules,
            debug: !!config.debug && legacy
        };

        if (!legacy) {
            envOptions.ignoreBrowserslistConfig = true;
            envOptions.targets = {
                esmodules: true
            };
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

        const babelConfig = getBabelConfig(legacy, false);
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
                            options: babelConfig
                        },
                    },
                    {
                        test: /\.(txt|glsl|svg)$/i,
                        use: 'raw-loader',
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
            base: config.srcPath +'js',
            sourcemaps: true,
        })
            .pipe(named(function (file) {
                return file.relative.substr(0, file.relative.length - file.extname.length);
            }))
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
        return js(cb, true);
    };

    return [
        js,
        watch_js
    ];
};