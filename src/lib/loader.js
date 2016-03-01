"use strict";

var fs = require("fs"),
    path = require("path");

/** Provides convenience methods for loading modules.
 * @module {Function} Loader
 */

/** Loads all modules within a directory as an array.
 * 
 * @param {String} dir The directory name to load modules from
 * @param {Boolean} recursive If true directories will be searched recursively
 * @returns {Object[]} An array of all objects exported by the modules loaded
 */
function loader(dir, recursive) {
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

module.exports = loader;
