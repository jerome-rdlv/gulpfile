module.exports = function (config) {

    if (!config.tasks.js || !config.tasks.js.length) {
        return false;
    }

    const ESLintPlugin = require('eslint-webpack-plugin');
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

    function getWPConfig(watch) {
        return {
            target: 'web',
            module: {
                rules: [
                    // {
                    //     enforce: 'pre',
                    //     test: /\.m?jsx?$/,
                    //     exclude: /node_modules/,
                    //     loader: 'eslint-loader',
                    //     options: {
                    //         failOnError: false,
                    //         failOnWarning: false,
                    //     }
                    // },
                    {
                        test: /\.m?jsx?$/,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                exclude: 'node_modules/**',
                                cacheDirectory: true,
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        {
                                            corejs: 3.22,
                                            useBuiltIns: 'entry',
                                            modules: 'auto',
                                            debug: !!config.debug
                                        }
                                    ]
                                ]
                            }
                        },
                    },
                    {
                        test: /\.(txt|glsl|svg)$/i,
                        use: 'raw-loader',
                    },
                ],
            },
            watch: !!watch,
            watchOptions: {
                ignored: '/node_modules/',
            },
            devtool: config.production ? false : 'eval',
            mode: config.production ? 'production' : 'development',
            output: {
                filename: 'js/[name].js'
            },
            plugins: [
                new ESLintPlugin(),
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    reportFilename: config.distPath + '/report.html',
                    openAnalyzer: false,
                })
            ],
        };
    }

    const
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
            base: config.srcPath + 'js',
            sourcemaps: true,
        })
            .pipe(named(function (file) {
                return file.relative.substr(0, file.relative.length - file.extname.length);
            }))
            .pipe(webpack({
                watch: !!watch,
                config: getWPConfig(watch)
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
