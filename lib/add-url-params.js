const urlUtil = require('url');

module.exports = function (url, params) {
    urlObject = new URL(url);
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            urlObject.searchParams.append(key, params[key]);
        }
    }
    return urlObject.toString();
};