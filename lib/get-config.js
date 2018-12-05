const
    projectPath = require('./projectPath'),
    fs = require('fs'),
    path = require('path')
;

function merge(obj1, obj2) {
    for (let p in obj2) {
        if (obj2.hasOwnProperty(p)) {
            // noinspection EqualityComparisonWithCoercionJS
            if (obj2[p].constructor == Object && (Object.keys(obj2[p]).length > 0)) {
                if (obj1[p]) {
                    merge(obj1[p], obj2[p]);
                }
            } else {
                obj1[p] = obj2[p];
            }
        }
    }
} 

function getConfig() {
    const defaultConfigPath = projectPath('gulp-config.json');
    let config = require('../defaults.json');

    if (fs.existsSync(defaultConfigPath)) {
        merge(config, require(defaultConfigPath));
    }
    else {
        const packageConfigPath = projectPath('package.json');
        if (fs.existsSync(packageConfigPath)) {
            const packageConfig = require(packageConfigPath);
            if (packageConfig.gulp !== undefined) {
                merge(config, packageConfig.gulp);
            }
        }
    }
    
    config.rootPath = path.resolve(__dirname +'/../../'+ config.basePath) +'/';
    
    config.srcPath = config.rootPath + config.srcDir +'/';
    config.varPath = config.rootPath + config.varDir +'/';
    config.devPath = config.rootPath + config.devDir +'/';
    config.prodPath = config.rootPath + config.prodDir +'/';
    
    return config;
}

module.exports = getConfig();
