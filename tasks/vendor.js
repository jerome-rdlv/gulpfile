/*global config*/
const
    gulp = require('gulp'),
    vfs = require('vinyl-fs')


gulp.task('vendor', function () {
    return vfs.src(config.srcPath + '/vendor')
        .pipe(vfs.symlink(config.distPath))
        
})