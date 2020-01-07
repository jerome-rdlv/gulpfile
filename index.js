module.exports = function (override) {
    const
        glob = require('glob'),
        gulp = require('gulp'),
        imagemin = require('gulp-imagemin'),
        merge = require('./lib/merge'),
        path = require('path'),
        // requireDir = require('require-dir'),
        argv = require('yargs').argv
    ;

    // globals
    const config = require('./defaults');

    // merge configuration
    merge(config, override);

    // override with possible CLI arguments
    config.url = argv.url || config.url;
    config.production = argv.production || argv.prod || config.production;
    config.debug = argv.debug || config.debug;

    // paths
    if (!config.basePath && (!config.srcPath || !config.varPath || !config.distPath)) {
        throw 'You must set `basePath` or `srcPath`, `varPath` and `distPath`';
    }

    if (config.basePath) {
        if (!/\/$/.test(config.basePath)) {
            config.basePath += '/';
        }
        config.srcPath = config.basePath + config.srcDir + '/';
        config.varPath = config.basePath + config.varDir + '/';
        config.distPath = config.basePath + config.distDir + '/';
    }

    config.cheerioParserSvgOptions = {
        recognizeSelfClosing: true,
        lowerCaseTags: false,
        decodeEntities: false,
        xmlMode: true
    };

    config.imageminOptions = [
        imagemin.gifsicle({interlaced: true}),
        imagemin.jpegtran({progressive: true}),
        // levels greater than 0 causes some black PNGs on Safari
        imagemin.optipng({optimizationLevel: 0})
    ];

    // let tasks = {};
    // let watchers = {};
    // let defaultTask = [];
    // let defaultWatcher = [];

    const tasks = glob.sync(__dirname + '/tasks/*.js').reduce(function (loaded, file) {
        const module = require(file)(config);
        const name = path.basename(file).replace(/\.[^.]+/, '');

        if (module instanceof Function) {
            loaded[module.name ? module.name : name] = module;
        } else if (module instanceof Array) {
            module.forEach(function (task) {
                if (task instanceof Function) {
                    loaded[task.name ? task.name : name] = task;
                }
            });
        }

        return loaded;
    }, {});

    if (Object.keys(tasks).length) {

        let levels = [
            [
                tasks['copy'],
                tasks['symlink'],
                tasks['thumb'],
                tasks['svg'],
                tasks['img'],
            ],
            [
                tasks['svg_symbol'],
                tasks['svg_scss'],
            ],
            [
                tasks['jsil'],
                tasks['js'],
                tasks['scss'],
            ],
            [
                tasks['template'],
            ]
        ];

        levels = levels
            .map(function (tasks) {
                tasks = tasks.filter(function (task) {
                    return task instanceof Function;
                });
                return tasks.length ? gulp.parallel.apply(null, tasks) : null;
            })
            .filter(function (tasks) {
                return tasks !== null;
            });

        if (levels.length) {
            tasks['default'] = gulp.series.apply(null, levels);

            const watchers = Object.keys(tasks).reduce(function (accumulator, key) {
                if (/^watch_/.test(tasks[key].name)) {
                    accumulator.push(tasks[key]);
                }
                return accumulator;
            }, []);
            if (watchers.length) {
                tasks['watch_default'] = gulp.series(
                    tasks['default'],
                    gulp.parallel.apply(null, watchers)
                );
            }
        }
    }

    // return sorted tasks
    return Object.keys(tasks).sort().reduce(function (accumulator, key) {
        accumulator[key] = tasks[key];
        return accumulator;
    }, {});

};
