var fs = require("fs"),
    path = require("path");

function loadDirectory(dir, recursive) {
    if(recursive === undefined)
        recursive = true;
    
    var modules = [];
    var paths = fs.readdirSync(dir);
    for(var i = 0; i < paths.length; ++i) {
        var fullPath = path.join(dir, paths[i]);
        fullPath = path.resolve(fullPath);
        
        var stat = fs.statSync(fullPath);
        if(stat.isDirectory() && recursive)
            modules = modules.concat(loadDirectory(fullPath, true));
        else if(stat.isFile())
            modules.push(require(fullPath));
    }
    return modules;
}

exports.loadDirectory = loadDirectory;
