module.exports = function (override) {
    const
        gulp = require('gulp'),
        merge = require('./lib/merge'),
        path = require('path'),
        requireDir = require('require-dir')

    // globals
    watch = false
    config = require('./defaults')

    // create browserSync instance
    require('browser-sync').create('bs')

    // merge configuration
    merge(config, override)

    // paths
    if (!/\/$/.test(config.basePath)) {
        config.basePath += '/'
    }
    config.srcPath = config.basePath + config.srcDir + '/'
    config.varPath = config.basePath + config.varDir + '/'
    config.distPath = config.basePath + config.distDir + '/'

    config.cheerioParserSvgOptions = {
        recognizeSelfClosing: true,
        lowerCaseTags: false,
        decodeEntities: false,
        xmlMode: true
    }

    // environment
    config.production = false
    for (let i in process.argv) {
        if (process.argv.hasOwnProperty(i)) {
            if (process.argv[i] === '--production' || process.argv[i] === '--prod') {
                config.production = true
                break
            }
        }
    }

    let tasks = [
        'favicon',
        'htaccess'
    ]

    let watchers = []

    requireDir('./tasks', {recurse: true})

    if (config.tasks.browsersync) {
        watchers.push('browsersync')
    }
    if (config.tasks.img) {
        tasks.push('img')
        watchers.push('watch:img')
    }
    if (config.tasks.font) {
        tasks.push('font')
        watchers.push('watch:font')
    }
    if (config.tasks.svg) {
        if (config.tasks.scss) {
            tasks.push(gulp.series(
                'svg',
                gulp.parallel(
                    'svg-symbol',
                    gulp.series('svg-scss', 'scss')
                )
            ))
        } else {
            tasks.push(gulp.series('svg', 'svg-symbol'))
        }
        watchers.push('watch:svg')
        watchers.push('watch:svg-var')
    } else if (config.tasks.scss) {
        tasks.push('scss')
    }

    if (config.tasks.scss) {
        watchers.push('watch:scss')
    }
    if (config.tasks.js) {
        tasks.push('js')
        watchers.push('watch:js')
    }


    gulp.task('default', gulp.parallel(tasks))
    gulp.task('watch', gulp.series(
        'default',
        gulp.parallel(watchers)
    ))
}
