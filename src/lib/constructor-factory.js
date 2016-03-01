"use strict";

var loader = require("./loader");

/** A factory that loads all modules within a directory recursively and exposes
 * them as constructor functions by name. All modules must export a single
 * constructor function as the module.exports object. All constructors must
 * handle being called without arguments gracefully.
 * 
 * @param {String} dir The path to the directory to load modules from
 * 
 * @constructor
 */
function ConstructorFactory(dir) {
    /// All constructors indexed by name
    this.ctors = {};

    var modules = loader(dir, true);
    for(let mod of modules) {
        if(typeof mod !== "function")
            throw new Error("Module " + mod.filename + " was not a constructor");
        if(this.ctors.hasOwnProperty(mod.name))
            throw new Error("Duplicate constructor name " + mod.name);
        this.ctors[mod.name] = mod;
    }
}

/** Creates a new object by name.
 * 
 * @param {String} name The name of the constructor to invoke
 */
ConstructorFactory.prototype.create = function(name) {
    var ctor = this.ctors[name];
    if(ctor === undefined)
        throw new Error("Constructor " + name + " not defined in this scope");
    if(arguments.length > 1) {
        throw new Error("ConstructorFactory.create() called with constructor arguments");
    }
    return new ctor();
};

module.exports = ConstructorFactory;
