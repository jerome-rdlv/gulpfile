/*global config*/
const
    changed = require('gulp-changed'),
    fs = require('fs'),
    gm = require('gm'),
    gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    mustache = require('mustache'),
    path = require('path'),
    through = require('through2'),
    touch = require('../lib/touch'),
    Vinyl = require('vinyl')


function normalizeSizes(sizes) {
    for (let key in sizes) {
        if (sizes.hasOwnProperty(key)) {
            for (let i = 0; i < sizes[key].length; ++i) {
                if (!(sizes[key][i] instanceof Array)) {
                    sizes[key][i] = [
                        sizes[key][i],
                        sizes[key][i]
                    ]
                }
            }
        }
    }
    return sizes
}

const generateThumbScss = function (opts) {

    opts = typeof opts === 'undefined' ? {} : opts
    opts.sizes = opts.sizes ? normalizeSizes(opts.sizes) : null
    opts.template = opts.template ? opts.template : 'thumb.scss.mustache'
    opts.output = opts.output ? opts.output : '_thumb.scss'

    const data = {
        items: []
    }

    const eachFile = function (file, encoding, callback) {

        const filename = path.basename(file.relative)
        if (opts.sizes.hasOwnProperty(filename)) {
            const sizes = opts.sizes[filename].sort(function (a, b) {
                return b[0] - a[0]
            })
            const ext = path.extname(file.relative)
            data.items.push({
                name: path.basename(file.relative, ext),
                ext: ext,
                sizes: sizes.map(function (size) {
                    return size[0] + ': ' + size[1]
                }).join(', '),
                max: sizes[0][0]
            })
        }

        callback()
    }

    const endStream = function (callback) {
        try {
            const template = fs.readFileSync(opts.template, 'utf8')
            const scss = mustache.render(template, data)
            const buffer = Buffer.from(scss, 'utf8')

            this.push(new Vinyl({
                path: opts.output,
                contents: buffer
            }))
            callback()
        } catch (error) {
            callback(error)
        }
    }

    return through.obj(eachFile, endStream)

}

const generateThumb = function (opts) {

    opts = typeof opts === 'undefined' ? {} : opts
    opts.sizes = opts.sizes ? normalizeSizes(opts.sizes) : null

    return through.obj(function (file, encoding, callback) {

        const filename = path.basename(file.relative)
        if (opts.sizes.hasOwnProperty(filename)) {

            const pipe = this
            const promises = []

            const ext = path.extname(filename)
            const base = path.basename(filename, ext)

            for (let i = 0; i < opts.sizes[filename].length; ++i) {
                promises.push(new Promise(function (resolve) {
                    (function (width) {
                        gm(file.path).resize(width).toBuffer(function (err, buffer) {
                            pipe.push(new Vinyl({
                                path: base + '_' + width + ext,
                                contents: buffer
                            }))
                            resolve()
                        })
                    })(opts.sizes[filename][i][1])
                }))
            }

            Promise.all(promises).then(function () {
                callback()
            })
        } else {
            callback()
        }
    })

}
module.exports = generateThumb

const thumbFile = config.srcPath + '/thumbs.json'

if (fs.existsSync(thumbFile)) {
    const thumbSizes = JSON.parse(fs.readFileSync(thumbFile, 'utf8'))
    gulp.task('thumb-scss', function () {
        return gulp.src(config.srcPath + config.assetsDir + '/img/*')
            .pipe(generateThumbScss({
                sizes: thumbSizes,
                output: '_thumb.scss',
                template: config.srcPath + '/thumb.scss.mustache'
            }))
            .pipe(gulp.dest(config.varPath)).pipe(touch())
            
    })
    gulp.task('thumb', gulp.series(
        'thumb-scss',
        function thumbCore() {
            return gulp.src(config.srcPath + '/img/*')
                .pipe(generateThumb({
                    sizes: thumbSizes
                }))
                .pipe(changed(config.distPath + '/img/thumb')).pipe(touch())
                .pipe(imagemin(config.imageminOptions))
                .pipe(gulp.dest(config.distPath + '/img/thumb')).pipe(touch())
                
        }
    ))

    gulp.task('thumb:watch', function () {
        return gulp.watch([
            config.srcPath + config.assetsDir + 'img/*',
            config.srcPath + 'thumb.scss.mustache'
        ], 'thumb')
    })
}
