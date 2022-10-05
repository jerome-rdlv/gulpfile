module.exports = function (config) {

    if (!config.tasks.svg) {
        return false;
    }

    const
        cacheBustSvgRefs = require('../lib/cachebust-svg-refs')(config),
        changed = require('gulp-changed'),
        cheerio = require('cheerio'),
        cleanSvg = require('../lib/clean-svg')(config),
        clearSvgParams = require('../lib/clear-svg-params'),
        crypto = require('crypto'),
        fs = require('fs'),
        gulp = require('gulp'),
        path = require('path'),
        rename = require('gulp-rename'),
        svgmin = require('gulp-svgmin'),
        svgToScss = require('../lib/svg-to-scss'),
        svgToSymbol = require('../lib/svg-to-symbol')(config),
        touch = require('../lib/touch');

    function svgminCallback(file) {
        const prefix = 'i' + crypto.createHash('sha1')
            .update(path.basename(file.relative, path.extname(file.relative)))
            .digest('hex')
            .substr(0, 4);

        /*
        This configuration can be overriden in svg files
        with following script:
        
            <script type="application/json" id="svgo-options">
                [
                    { "removeHiddenElems": false }
                ]
            </script>
         */
        const plugins = [
            {'name': 'removeDoctype'},
            {'name': 'removeComments'},
            {'name': 'removeTitle'},
            {'name': 'convertStyleToAttrs'},
            {
                'name': 'cleanupIDs',
                'params': {
                    prefix: prefix + '-',
                    minify: true
                }
            },
            {'name': 'removeViewBox', active: false},
            {'name': 'removeStyleElement'},
            {
                'name': 'cleanupNumericValues',
                'params': {
                    floatPrecision: 5
                }
            }
        ];

        // per file svgmin options
        const $ = cheerio.load(file.contents.toString(), config.cheerioParserSvgOptions);
        const $opts = $('#svgo-options');
        const opts = JSON.parse($opts.html());

        if (opts) {
            for (let i = 0; i < opts.length; ++i) {
                plugins.push(opts[i]);
            }
        }

        return {
            multipass: true,
            plugins: plugins,
        };
    }

    const svg = function () {
        return gulp.src(config.srcPath + config.assetsDir + 'svg/**/*.svg', {base: config.srcPath})
            .pipe(changed(config.varPath))
            .pipe(cacheBustSvgRefs())
            .pipe(svgmin(svgminCallback))
            .pipe(cleanSvg())
            .pipe(gulp.dest(config.varPath)).pipe(touch())
            .pipe(clearSvgParams())
            .pipe(gulp.dest(config.distPath)).pipe(touch());
    };

    // svg availability in SCSS
    const svg_scss = function () {

        // look for template
        let tpl = config.srcPath + 'svg.scss.mustache';
        if (!fs.existsSync(tpl)) {
            tpl = __dirname + '/../svg.scss.mustache';
        }

        return gulp.src(config.varPath + config.assetsDir + 'svg/**/*.svg', {base: config.varPath + config.assetsDir + 'svg'})
            .pipe(svgToScss({
                template: tpl,
                output: '_svg.scss'
            }))
            .pipe(gulp.dest(config.varPath)).pipe(touch())
            ;
    };

    // svg availability for inclusion as inline symbol in html
    const svg_symbol = function () {
        return gulp.src(config.varPath + config.assetsDir + 'svg/**/*.svg', {base: config.varPath})
            .pipe(changed(config.distPath, {extension: '.symbol.svg'}))
            .pipe(svgToSymbol())
            .pipe(clearSvgParams())
            .pipe(rename(function (path) {
                path.extname = '.symbol.svg';
            }))
            .pipe(gulp.dest(config.distPath)).pipe(touch());

    };

    const watch_svg = function () {
        // prepare svg, create symbols and update scss lib
        return gulp.watch([
            config.srcPath + 'svg.scss.mustache',
            config.srcPath + config.assetsDir + 'svg/**/*.svg',
            config.srcPath + config.assetsDir + 'img/*',
        ], gulp.series(svg, gulp.parallel(svg_scss, svg_symbol)));
    };

    return [
        svg,
        watch_svg,
        svg_scss,
        svg_symbol
    ];
};
