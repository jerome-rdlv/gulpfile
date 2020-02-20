/**
 * @see node_modules/gulpfile/defaults.js for possible options
 * Some options can be overriden by CLI arguments:
 *  - --url=http://example.org
 *  - --production or --prod
 *
 *  url option accepts an array
 */
module.exports = {
    url: null,
    srcDir: 'src',
    varDir: 'var',
    distDir: 'assets',
    assetsDir: '',
    cacheBust: 'path',
    production: false,
    tasks: {
        browsersync: true,
        // exclude from cleaning
        cleanex: [],
        // static assets to copy
        copy: [
            'font/*.{woff,woff2}',
        ],
        img: true,
        js: [], // script entrypoints
        jsil: [], // inline scripts
        scss: {
            autoprefixer: [],
            nonano: [],
            split: {
                mobile: [0, 420 / 16],
                tablet: [420 / 16, 1200 / 16],
                desktop: [1200 / 16],
            },
        },
        svg: true,
        symlink: [], // symlink
        template: [], // templates
        thumb: false // thumbnail file
    }
};