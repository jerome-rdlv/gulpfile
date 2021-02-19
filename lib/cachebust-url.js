const
    addUrlParams = require('./add-url-params')
;

module.exports = function (config) {
    switch (config.cacheBust) {
        case 'query':
            return function (url, signature) {
                return addUrlParams(url, {t: signature});
            };
        case 'path':
            return function (url, signature) {
                return url.replace(/(\.[^.]+)$/, '.v' + signature + '$1');
            };
    }
};