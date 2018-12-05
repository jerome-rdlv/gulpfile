const
    addUrlParams = require('./add-url-params')
;

module.exports = function (url, timestamp) {
    switch (global.config.cacheBust) {
        case 'query':
            url = addUrlParams(url, {t: timestamp});
            break;
        case 'path':
            url = url.replace(/(\.[^.]+)$/, '.v'+ timestamp +'$1');
    }
    return url;
};