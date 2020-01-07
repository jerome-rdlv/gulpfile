module.exports = function merge(obj1, obj2) {
    for (let p in obj2) {
        if (Object.prototype.hasOwnProperty.call(obj2, p)) {
            // noinspection EqualityComparisonWithCoercionJS
            if (obj2[p].constructor == Object && (Object.keys(obj2[p]).length > 0)) {
                if (typeof obj1[p] === 'object') {
                    merge(obj1[p], obj2[p]);
                } else {
                    obj1[p] = obj2[p];
                }
            } else {
                obj1[p] = obj2[p];
            }
        }
    }
};
