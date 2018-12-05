module.exports = (function () {
    return function (obj1, obj2) {
        for (let p in obj2) {
            if (obj2.hasOwnProperty(p)) {
                // noinspection EqualityComparisonWithCoercionJS
                if (obj2[p].constructor == Object && (Object.keys(obj2[p]).length > 0)) {
                    if (obj1[p]) {
                        merge(obj1[p], obj2[p])
                    }
                } else {
                    obj1[p] = obj2[p]
                }
            }
        }
    }
})()
