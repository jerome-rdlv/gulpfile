module.exports = function (config) {

    if (!config.tasks.template || !config.tasks.template.length) {
        return false;
    }

    const
        addUrlParams = require('../lib/add-url-params'),
        cacheBustHtmlRefs = require('../lib/cachebust-html-refs')(config),
        cheerio = require('cheerio'),
        concat = require('gulp-concat'),
        crypto = require('crypto'),
        fs = require('fs'),
        gulp = require('gulp'),
        htmlmin = require('gulp-htmlmin'),
        path = require('path'),
        touch = require('../lib/touch'),
        through = require('through2');

    const php = {};
    const generators = {};

    function phpStash() {
        return through.obj(function (file, encoding, callback) {
            if (file.extname === '.php') {
                php[file.path] = {};
                file.contents = Buffer.from(
                    file.contents.toString(encoding).replace(
                        /<\?php\s.*?\s\?>/gms,
                        function (m) {
                            const hash = crypto.createHash('sha1').update(m).digest('hex');
                            php[file.path][hash] = m;
                            return `<!-- php:${hash} -->`;
                        }
                    ),
                    encoding
                );
            }

            this.push(file);
            callback();
        });
    }

    function phpPop() {
        return through.obj(function (file, encoding, callback) {
            if (file.extname === '.php' && php[file.path]) {
                file.contents = Buffer.from(
                    file.contents.toString(encoding).replace(
                        /(?:<|&lt;)!-- php:([a-z0-9]+) --(?:>|&gt;)/g,
                        function (m, hash) {
                            if (!php[file.path][hash]) {
                                console.error(`Can not find hash ${hash} for file ${file.path} in phpPop.`);
                            }
                            const code = php[file.path][hash];
                            delete php[file.path][hash];
                            return code;
                        }
                    ),
                    encoding
                );

                // should not have any properties left
                if (Object.keys(php[file.path]).length) {
                    console.error(`Some PHP tags have not been popped for file ${file.path}:`, php[file.path]);
                }
            }

            this.push(file);
            callback();
        });
    }

    function generateHtml() {
        return through.obj(function (file, encoding, callback) {
            const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserHtmlOptions);

            // svg include
            $('svg[data-src]').replaceWith(function () {
                const $placeholder = $(this);
                try {
                    const filepath = $(this).data('src');
                    return $('<noscript></noscript>')
                        .attr('data-class', $placeholder.attr('class'))
                        .attr('data-svg', addUrlParams(filepath, {
                            t: fs.statSync(config.varPath + '/' + filepath).mtime.getTime()
                        }));

                } catch (e) {
                    callback(e);
                }
                return $placeholder;
            });

            if (generators[file.path] instanceof Function) {
                generators[file.path]($);
            }

            file.contents = Buffer.from($.xml(), 'utf8');

            this.push(file);
            callback();
        });
    }

    function inlineAssets() {
        return through.obj(function (file, encoding, callback) {
            const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserHtmlOptions);

            function resolveResourceUri(filepath, uri) {
                if (uri.match(/^(https?:)?\/\//)) {
                    return uri;
                }
                return path.relative(
                    path.dirname(file.path.replace(config.srcPath, config.distPath)),
                    path.resolve(path.dirname(filepath), uri)
                );
            }

            // styles
            $('link[data-inline]').each(function () {
                const $link = $(this);
                const filepath = config.distPath + $link.attr('href');
                if (fs.existsSync(filepath)) {
                    const $style = $('<style></style>');
                    $style.text(
                        fs.readFileSync(filepath, 'utf8')
                            .replace(/^@charset .*?;/i, '')
                            .replace(/(?:\b|\s)url\((['"]?)(.*?)\1\)/mg, function (m, quote, src) {
                                return `url(${quote}${resolveResourceUri(filepath, src)}${quote})`;
                            })
                    );
                    $link.after($style);
                    $link.remove();
                } else {
                    console.warn(`file ${filepath} does not exist for inlining in ${file.basename}.`);
                }
            });

            // scripts
            $('script[data-inline]').each(function () {
                const $script = $(this);
                const filepath = config.distPath + $script.attr('src');
                if (fs.existsSync(filepath)) {
                    $script
                        .text(fs.readFileSync(filepath, 'utf8'))
                        .removeAttr('type')
                        .removeAttr('data-inline')
                        .removeAttr('src');
                } else {
                    console.warn(`file ${filepath} does not exist for inlining in ${file.basename}.`);
                }
            });

            file.contents = Buffer.from($.xml(), 'utf8');

            this.push(file);
            callback();
        });
    }

    function mergeAssets() {
        return through.obj(function (file, encoding, callback) {
            const self = this;
            const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserHtmlOptions);

            const promises = [];

            // merge scripts
            const $scripts = $('body script[data-merge]');
            const scripts = $scripts.map(function () {
                const filepath = $(this).attr('src');
                return (/^vendor/.test(filepath) ? config.srcPath : config.varPath) + filepath;
            }).toArray();

            if (scripts.length) {
                promises.push(
                    gulp.src(scripts)
                        .pipe(concat('combined.js'))
                        .pipe(gulp.dest(config.distPath + 'js')).pipe(touch())
                );

                const $scriptCombined = $('<script async></script>')
                    .attr('src', 'js/combined.js')
                    .addClass('async');

                $scripts.last().after($scriptCombined);
                $scripts.remove();
            }

            // merge styles
            const $links = $('head link.merge[rel="stylesheet"]');
            const links = $links.map(function () {
                return config.varPath + $(this).attr('href');
            }).toArray();

            if (links.length) {

                promises.push(
                    gulp.src(links)
                        .pipe(concat('combined.css'))
                        .pipe(gulp.dest(config.distPath + 'css')).pipe(touch())
                );

                const $linkCombined = $('<link />')
                    .addClass($links.attr('class'))
                    .attr('rel', 'stylesheet')
                    .attr('href', 'css/combined.css');

                $links.last().after($linkCombined);
                $links.remove();
            }

            return Promise.all(promises).then(function () {
                file.contents = Buffer.from($.xml(), 'utf8');
                self.push(file);
                callback();
            });
        });
    }

    function asyncAssets() {
        return through.obj(function (file, encoding, callback) {
            // const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserHtmlOptions);
            //
            // const asyncs = $('head link.async, script.async, iframe.async, svg image').map(function () {
            //     const $item = $(this).removeClass('async');
            //     if ($item.is('script')) {
            //         $item.remove();
            //         return {
            //             type: 'script',
            //             atts: $item.attr()
            //         };
            //     } else if ($item.is('link')) {
            //         return {
            //             type: 'link',
            //             atts: $item.attr()
            //         };
            //     } else if ($item.is('iframe')) {
            //         const id = 'iframe-' + crypto.createHash('sha1')
            //             .update($item.attr('src'))
            //             .digest('hex')
            //             .substr(0, 8);
            //         const $wrapper = $('<div></div>')
            //             .attr('id', id)
            //             .css('display', 'none');
            //         $item.after($wrapper);
            //         $item.remove();
            //         return {
            //             type: $item[0].tagName,
            //             id: id,
            //             atts: $item.attr()
            //         };
            //     }
            //     // else if ($item.is('image')) {
            //     //     $item.attr('data-href', $item.attr('xlink:href'));
            //     //     $item.removeAttr('xlink:href');
            //     // }
            // }).toArray();
            //
            // if (asyncs.length) {
            //
            //     // styles
            //     const $links = $('head link.async');
            //     if ($links.length) {
            //         // noscript include for styles
            //         const $noscript = $('<noscript></noscript>').append($links);
            //         $('head').append($noscript);
            //     }
            //
            //     // scripts
            //     const template = fs.readFileSync(__dirname + '/../asyncjs.mustache', 'utf8');
            //     $('body').append(mustache.render(template, {
            //         asyncs: JSON.stringify(asyncs)
            //     }));
            // }
            //
            // file.contents = Buffer.from($.xml(), 'utf8');
            this.push(file);
            callback();
        });
    }

    function getSrc() {
        return config.tasks.template.map(function (template) {
            if (template instanceof Object) {
                if (!template.file) {
                    throw `You must set \`file\` property if template is an object.`;
                }
                const filepath = config.srcPath + template.file;
                if (template.generate instanceof Function) {
                    generators[filepath] = template.generate;
                }
                return filepath;
            }
            return config.srcPath + template;
        });
    }

    function getWatchIgnored() {
        return config.tasks.template.map(function (template) {
            return config.distPath + (template instanceof Object ? template.file : template);
        });
    }

    const template = function () {

        return gulp.src(getSrc(), {
            base: config.srcPath,
        })
            .pipe(phpStash())
            .pipe(generateHtml())
            // .pipe(htmlBeautify({
            //     indentSize: 4,
            //     indent_char: ' ',
            //     wrap_line_length: 120
            // }))
            .pipe(inlineAssets())
            .pipe(mergeAssets())
            .pipe(cacheBustHtmlRefs())
            .pipe(asyncAssets())
            .pipe(htmlmin({
                collapseWhitespace: false,
                collapseBooleanAttributes: true,
                decodeEntities: true,
                html5: true
            }))
            .pipe(phpPop())
            .pipe(gulp.dest(config.distPath))
            .pipe(touch())
            ;
    };

    const watch_template = function () {

        let src = getSrc();

        src.push(
            config.distPath + '**/*',
        );

        return gulp.watch(src, {
            delay: 500,
            ignored: getWatchIgnored()
        }, template);
    };

    return [
        template,
        watch_template
    ];
};
