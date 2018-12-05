/*global config*/
const
    addUrlParams = require('../lib/add-url-params'),
    cacheBustHtmlRefs = require('../lib/cachebust-html-refs'),
    cheerio = require('cheerio'),
    concat = require('gulp-concat'),
    fs = require('fs'),
    gulp = require('gulp'),
    htmlBeautify = require('gulp-html-beautify'),
    htmlmin = require('gulp-htmlmin'),
    mustache = require('mustache'),
    touch = require('../lib/touch'),
    through = require('through2')
;

function generateHtml() {
    return through.obj(function (file, encoding, callback) {
        const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserHtmlOptions);
            
        // build nav menu from page’s sections
        const $menu = $('.Nav-menu');
        $('section[data-title]').each(function () {
            const $section = $(this);
            const $link = $('<a></a>')
                .attr('href', '#' + $section.attr('id'))
                .addClass('Nav-link')
                .text($section.data('title'));
            const $item = $('<li></li>')
                .addClass('Nav-item');
            $item.append($link);
            $menu.append($item);
        });

        // svg include
        $('svg[data-src]').replaceWith(function () {
            const $placeholder = $(this);
            try {
                const path = $(this).data('src');
                return $('<noscript></noscript>')
                    .attr('data-class', $placeholder.attr('class'))
                    .attr('data-svg', addUrlParams(path, {
                        t: fs.statSync(config.varPath + '/'+ path).mtime.getTime()
                    }))
                    ;
            }
            catch (e) {
                callback(e);
            }
            return $placeholder;
        });

        // build equipe items
        const $cols = $('.Equipe-col');
        const $tpl = $('.Equipe-item');

        const alunites = JSON.parse(fs.readFileSync(config.srcPath + '/alunites.json', 'utf8'));
        for (let i = 0; i < alunites.length; ++i) {
            const $item = $tpl.clone();
            if (alunites[i].photo.length) {
                $item.find('.Equipe-photo').css('background-image', 'url(\''+ alunites[i].photo +'\')');
            }
            $item.find('.Equipe-firstname').text(alunites[i].first);
            $item.find('.Equipe-lastname').text(alunites[i].last);
            $item.find('.Equipe-email')
                .attr('href', 'mailto:'+ alunites[i].email)
                .text(alunites[i].email);
            $item.find('.Equipe-likes').append(alunites[i].like);
            $item.find('.Equipe-dislikes').append(alunites[i].dislike);

            $item.attr('id', 'equipe-item-'+ i);

            if (i < alunites.length / 2) {
                $cols.first().append($item);
            }
            else {
                $cols.last().append($item);
            }
        }
        $tpl.remove();

        file.contents = Buffer.from($.xml(), 'utf8');
        this.push(file);

        callback();
    });
}


function inlineAssets() {
    return through.obj(function (file, encoding, callback) {
        const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserHtmlOptions);
            
        // styles
        try {
            $('link.inline').each(function () {
                const $link = $(this);
                const $style = $('<style></style>')
                    .attr('type', 'text/css');
                $style.text(fs.readFileSync(config.varPath + $link.attr('href'), 'utf8').replace(/^@charset .*?;/i, ''));
                $link.after($style);
                $link.remove();
            });
        }
        catch (e) {
            callback(e);
        }

        // scripts
        try {
            $('script.inline').each(function () {
                const $script = $(this);
                $script
                    .text(fs.readFileSync(config.varPath + $script.attr('src'), 'utf8'))
                    .removeAttr('src')
                    .removeClass('inline')
                ;
            });
        }
        catch (e) {
            callback(e);
        }

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
        const $scripts = $('body script.merge');
        const scripts = $scripts.map(function () {
            const path = $(this).attr('src');
            return (/^vendor/.test(path) ? config.srcPath : config.varPath) + path;
        }).toArray();

        promises.push(
            gulp.src(scripts)
                .pipe(concat('combined.js'))
                .pipe(gulp.dest(config.prodPath +'js')).pipe(touch())
        );

        const $scriptCombined = $('<script async></script>')
            .attr('src', 'js/combined.js')
            .addClass('async');

        $scripts.last().after($scriptCombined);
        $scripts.remove();

        // merge styles
        const $links = $('head link.merge[rel="stylesheet"]');
        const links = $links.map(function () {
            return config.varPath + $(this).attr('href');
        }).toArray();

        promises.push(
            gulp.src(links)
                .pipe(concat('combined.css'))
                .pipe(gulp.dest(config.prodPath +'css')).pipe(touch())
        );

        const $linkCombined = $('<link />')
            .addClass($links.attr('class'))
            .attr('rel', 'stylesheet')
            .attr('href', 'css/combined.css');

        $links.last().after($linkCombined);
        $links.remove();

        return Promise.all(promises).then(function () {

            file.contents = Buffer.from($.xml(), 'utf8');
            self.push(file);

            callback();
        });    
    });
}

function asyncAssets() {
    return through.obj(function (file, encoding, callback) {
        const $ = cheerio.load(file.contents.toString(encoding), config.cheerioParserHtmlOptions);

        // styles
        const $links = $('head link.async');

        // noscript include for styles
        const $noscript = $('<noscript></noscript>').append($links);
        $('head').append($noscript);

        const asyncs = $('head link.async, script.async, iframe.async, svg image').map(function () {
            const $item = $(this).removeClass('async');
            if ($item.is('script')) {
                $item.remove();
                return {
                    type: 'script',
                    atts: $item.attr()
                };
            }
            else if ($item.is('link')) {
                return {
                    type: 'link',
                    atts: $item.attr()
                };
            }
            else if ($item.is('iframe')) {
                const id = 'iframe-'+ crypto.createHash('sha1')
                    .update($item.attr('src'))
                    .digest('hex')
                    .substr(0, 8);
                const $wrapper = $('<div></div>')
                    .attr('id', id)
                    .css('display', 'none');
                $item.after($wrapper);
                $item.remove();
                return {
                    type: $item[0].tagName,
                    id: id,
                    atts: $item.attr()
                };
            }
            // else if ($item.is('image')) {
            //     $item.attr('data-href', $item.attr('xlink:href'));
            //     $item.removeAttr('xlink:href');
            // }
        }).toArray();

        // scripts
        const template = fs.readFileSync(config.srcPath +'/asyncjs.mustache', 'utf8');
        $('body').append(mustache.render(template, {
            asyncs: JSON.stringify(asyncs)
        }));
        
        
        file.contents = Buffer.from($.xml(), 'utf8');
        this.push(file);

        callback();
    });
}

gulp.task('template', function () {
    return gulp.src(config.srcPath + '/index.html')
        // insert inline css for header
        .pipe(generateHtml())
        .pipe(htmlBeautify({
            indentSize: 4,
            indent_char: ' ',
            wrap_line_length: 120
        }))
        .pipe(gulp.dest(config.devPath))
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
        .pipe(gulp.dest(config.prodPath))
        .pipe(touch())
    ;
});

gulp.task('template:watch', function () {
    return gulp.watch([
        config.srcPath + 'index.html',
        config.varPath + 'css/*',
        config.varPath + 'js/*',
        config.varPath + 'svg/*.svg',
        config.srcPath + 'thumbs.json',
        config.srcPath + 'alunites.json',
        config.srcPath + 'asyncjs.mustache'
    ], gulp.parallel('template'));
});
