const path = require('path');
const postcss = require('postcss');
const Stream = require('stream');
const Vinyl = require('vinyl');

module.exports = function (enabled) {
    return postcss.plugin('extractPrint', function (opts = {}) {
        return function (root, result) {
            if (!enabled) {
                return;
            }
            root.walkRules(function (rule) {
                const newDecls = [];
                rule.walkDecls('transition-duration', function (decl) {
                    newDecls.push({
                        original: decl,
                        new: {
                            prop: 'transition-duration',
                            value: 'calc(' + decl.value + ' * var(--transition-factor, 1))'
                        }
                    });
                });
                rule.walkDecls('transition', function (decl) {
                    const m = /\b([0-9.]+)m?s\b/.exec(decl.value);
                    if (!m || m[1] == 0) {
                        return;
                    }
                    newDecls.push({
                        original: decl,
                        new: {
                            prop: 'transition-duration',
                            value: 'calc(' + m[0] + ' * var(--transition-factor, 1))'
                        }
                    });
                });
                newDecls.forEach(function (decl) {
                    rule.insertAfter(decl.original, decl.new);
                });
            });
        };
    });
};
