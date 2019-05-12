module.exports = {
    url: null,
    srcDir: 'src',
    varDir: 'var',
    distDir: 'assets',
    assetsDir: '',
    cacheBust: 'path',
    tasks: {
        browsersync: true,
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
            ]
        },
        svg: true,
        symlink: false, // symlink
        template: [], // templates
        thumb: false // thumbnail file
    }
};