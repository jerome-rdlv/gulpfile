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

    // create browserSync instance
    // require('browser-sync').create('bs');

    const tasks = glob.sync(__dirname + '/tasks/*.js').reduce(function (loaded, file) {
        const module = require(file)(config);
        const name = path.basename(file).replace(/\.[^.]+/, '');

        if (module instanceof Function) {
            loaded[name] = module;
            defaultTask.push(module);
        } else if (module instanceof Object) {
            Object.keys(module).forEach(function (key) {
                loaded[key === 'task' ? name : key + ':' + name] = module[key];
                switch (key) {
                    case 'task':
                        defaultTask.push(module[key]);
                        break;
                    case 'watch':
                        defaultWatcher.push(module[key]);
                        break;
                }
            });
        }

        return loaded;
    }, {});

    // if (config.tasks.browsersync) {
    //
    //     const {task} = require('./tasks/browsersync')(config);
    //
    //     tasks['browsersync'] = task;
    //     defaultTask.push(task);
    // }
    //
    // if (config.tasks.static && config.tasks.static.length) {
    //     const {task, watcher} = require('./tasks/static')(config);
    //     tasks['static'] = task;
    //     tasks['watch:static'] = watcher;
    //     defaultTask.push(task);
    //     defaultWatcher.push(watcher);
    // }
    //
    // if (config.tasks.img) {
    //     const {task, watcher} = require('./tasks/img')(config);
    //     tasks['img'] = task;
    //     tasks['watch:img'] = watcher;
    //     defaultTask.push(task);
    //     defaultWatcher.push(watcher);
    // }
    //
    // if (config.tasks.font) {
    //     const {task, watcher} = require('./tasks/font')(config);
    //     tasks.push('font');
    //     watchers.push('watch:font');
    // }
    //
    // if (config.tasks.scss) {
    //     const {task, watcher} = require('./tasks/scss')(config);
    // }

    // if (config.tasks.svg) {
    //     if (config.tasks.scss) {
    //         tasks.push(gulp.series(
    //             'svg',
    //             gulp.parallel(
    //                 'svg-symbol',
    //                 gulp.series('svg-scss', 'scss')
    //             )
    //         ));
    //     } else {
    //         tasks.push(gulp.series('svg', 'svg-symbol'));
    //     }
    //     watchers.push('watch:svg');
    //     watchers.push('watch:svg-var');
    // } else if (config.tasks.scss) {
    //     tasks.push('scss');
    // }

    // if (config.tasks.scss) {
    //     watchers.push('watch:scss');
    // }
    // if (config.tasks.js) {
    //     tasks.push('js');
    //     watchers.push('watch:js');
    //
    //     tasks.push('inline');
    //     watchers.push('watch:inline');
    // }
    //
    // if (config.templates && config.templates.length && config.tasks.template) {
    //     tasks.push('template');
    //     watchers.push('watch:template');
    // }

    if (defaultTask.length) {
        tasks['default'] = gulp.parallel(defaultTask);

        if (defaultWatcher.length) {
            tasks['watch'] = gulp.series(
                tasks.default,
                gulp.parallel(defaultWatcher)
            );
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
