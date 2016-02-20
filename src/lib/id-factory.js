"use strict";

var ConstructorFactory = require("./constructor-factory"),
    util = require("util");

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

IdFactory.prototype.createById = function(id) {
    var ctor = this.ctorsById[id];
    if(ctor === undefined)
        throw new Error("No module found for ID " + id);
    if(arguments.length > 1) {
        var args = Array.apply(null, arguments);
        return new (Function.prototype.bind.apply(ctor, args.slice(1)));
    }
    return new ctor();
}

module.exports = IdFactory;
