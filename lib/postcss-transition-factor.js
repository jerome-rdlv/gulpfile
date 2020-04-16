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

            const props = ['transition-duration', 'transition-delay'];
            let m;

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
                rule.walkDecls('transition-delay', function (decl) {
                    newDecls.push({
                        original: decl,
                        new: {
                            prop: 'transition-delay',
                            value: 'calc(' + decl.value + ' * var(--transition-factor, 1))'
                        }
                    });
                });
                rule.walkDecls('transition', function (decl) {
                    const regex = /\b([0-9.]+)m?s\b/g;
                    for (let i = 0; i < props.length; ++i) {
                        m = regex.exec(decl.value);
                        if (!m) {
                            return;
                        }
                        if (m[1] == 0 || m[0] == '1ms') {
                            continue;
                        }
                        newDecls.push({
                            original: decl,
                            new: {
                                prop: props[i],
                                value: 'calc(' + m[0] + ' * var(--transition-factor, 1))'
                            }
                        });
                    }
                });
                newDecls.forEach(function (decl) {
                    rule.insertAfter(decl.original, decl.new);
                });
            });
        };
    });
};
