module.exports = function (config) {
    if (!config.tasks.critical || !config.tasks.critical.length) {
        return false;
    }

    const
        crit = require('critical'),
        fs = require('fs/promises'),
        gulp = require('gulp'),
        through = require('through2'),
        Vinyl = require('vinyl');

    const baseDir = config.distPath + config.assetsDir + 'css/critical';

    return function critical() {
        return Promise.all(config.tasks.critical.map(function (item) {
            return crit.generate({
                src: item.url,
                dimensions: [
                    {
                        height: 640,
                        width: 360,
                    },
                    {
                        height: 700,
                        width: 1300,
                    },
                ]
            }).then(function ({css}) {
                return fs.mkdir(baseDir, {recursive: true}).then(function () {
                    return fs.writeFile(`${baseDir}/${item.name}.css`, css);
                });
            }).catch(console.error);
        }));
    };
};