/**
 * @see node_modules/gulpfile/defaults.js for possible options.
 * Some options can be overridden by CLI arguments:
 *  - --url=http://example.org
 *  - --production or --prod
 */
module.exports = require('../index.js')({
    url: "https://example.org",
    basePath: __dirname,
    tasks: {
        // static assets to copy
//        copy: [
//            'font/*.{woff,woff2}',
//            '.htaccess',
//            '.htaccess.production',
//        ],
        js: [
            'js/main.js',
        ],
        jsil: [
            'js/reveal.js',
        ],
        scss: {
            // because block editor can not transform compressed CSS
            nonano: ['editor.css'],
            engine: 'dart', // dart or node
        }
    }
});
