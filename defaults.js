/**
 * @see node_modules/gulpfile/defaults.js for possible options
 * Some options can be overriden by CLI arguments:
 *  - --url=http://example.org
 *  - --production or --prod
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
            autoprefixer: [
                'last 5 version',
                'ie 8',
                'ie 9'
            ],
            nonano: [],
        },
        svg: true,
        symlink: [], // symlink
        template: [], // templates
        thumb: false // thumbnail file
    }
};