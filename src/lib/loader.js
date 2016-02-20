"use strict";

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
        else if(stat.isFile()) {
            var mod = require(fullPath);
            mod.__path = fullPath;
            modules.push(mod);
        }
    }
    return modules;
}

function constructorFactory(dir, recursive) {
    var modules = loadDirectory(dir, recursive);
    var ctors = {};
    for(let mod of modules) {
        if(typeof mod !== "function")
            throw new Error("Module " + mod.__path + " was not a constructor");
        if(ctors.hasOwnProperty(mod.name))
            throw new Error("Duplicate constructor name " + mod.name);
        ctors[mod.name] = mod;
    }
    
    function makeFactory(ctorMap) {
        return {
            create: function(name) {
                var ctor = ctorMap[name];
                if(ctor === undefined)
                    throw new Error("Constructor " + name + " not defined in this scope");
                if(arguments.length > 1) {
                    var args = Array.apply(null, arguments);
                    return new (Function.prototype.bind.apply(ctor, args.slice(1)));
                }
                return new ctor();
            }
        }
    }
    return makeFactory(ctors);
}

exports.loadDirectory = loadDirectory;
exports.constructorFactory = constructorFactory;
exports.constructorIdFactory = constructorFactory;
