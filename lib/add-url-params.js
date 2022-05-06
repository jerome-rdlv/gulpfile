const urlUtil = require('url');

module.exports = function (url, params) {
    let parsedUrl = urlUtil.parse(url, { parseQueryString: true});
    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            parsedUrl.query[key] = params[key];
        }
    }
    return urlUtil.format(parsedUrl);
};