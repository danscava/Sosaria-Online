"use strict";

var ConstructorFactory = require("./constructor-factory"),
    util = require("util");

/** A factory that loads all modules within a directory recursively and exposes
 * them as constructor functions by name and ID. All modules must export a
 * single constructor function as the module.exports object, and that function
 * object must have a property named "id". This property may be of any type that
 * supports equality comparison. All constructors must handle being called
 * without arguments gracefully.
 * 
 * @param {String} dir The path to the directory to load modules from
 * 
 * @constructor
 * @extends ConstructorFactory
 */
function IdFactory(dir) {
    ConstructorFactory.call(this, dir);
    
    this.ctorsById = {};
    for(let key in this.ctors) {
        if(!this.ctors.hasOwnProperty(key))
            continue;
        var mod = this.ctors[key];
        if(mod.id === undefined)
            throw new Error("Module " + mod.filename + " does not define an ID");
        if(this.ctorsById.hasOwnProperty(mod.id))
            throw new Error("Duplicate module ID " + mod.id);
        this.ctorsById[mod.id] = mod;
    }
}
util.inherits(IdFactory, ConstructorFactory);

/** Creates a new object by ID.
 * 
 * @param {Object} id The ID of the constructor to invoke. This must equal the
 *                    "id" property of one of the constructors loaded by the
 *                    constructor.
 */
IdFactory.prototype.createById = function(id) {
    var ctor = this.ctorsById[id];
    if(ctor === undefined)
        throw new Error("No module found for ID " + id);
    if(arguments.length > 1) {
        throw new Error("IdFactory.create() called with constructor arguments");
    }
    return new ctor();
}

module.exports = IdFactory;
