module.exports = function (override) {
    const
        glob = require('glob'),
        gulp = require('gulp'),
        merge = require('./lib/merge'),
        path = require('path'),
        requireDir = require('require-dir');

    // globals
    watch = false;
    config = require('./defaults');

    // merge configuration
    merge(config, override);

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

    // environment
    config.production = false;
    for (let i in process.argv) {
        if (process.argv.hasOwnProperty(i)) {
            if (process.argv[i] === '--production' || process.argv[i] === '--prod') {
                config.production = true;
                break;
            }
        }
    }

    // let tasks = {};
    let watchers = {};
    let defaultTask = [];
    let defaultWatcher = [];

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

    return tasks;

    //
    // gulp.task('default', gulp.parallel(tasks));
    // gulp.task('watch', gulp.series(
    //     'default',
    //     gulp.parallel(watchers)
    // ));
};
