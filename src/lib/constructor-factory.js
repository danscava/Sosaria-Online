"use strict";

var loader = require("./loader");

function ConstructorFactory(dir) {
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

ConstructorFactory.prototype.create = function(name) {
    var ctor = this.ctors[name];
    if(ctor === undefined)
        throw new Error("Constructor " + name + " not defined in this scope");
    if(arguments.length > 1) {
        var args = Array.apply(null, arguments);
        return new (Function.prototype.bind.apply(ctor, args.slice(1)));
    }
    return new ctor();
};

module.exports = ConstructorFactory;
