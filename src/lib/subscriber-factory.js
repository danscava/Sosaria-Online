"use strict";

var loader = require("./loader");

function SubscriberFactory(dir) {
    this.modules = loader(dir, true);
    for(let mod of this.modules) {
        if(typeof mod !== "function")
            throw new Error("Module " + mod.filename + " was not a subscriber");
    }
};

SubscriberFactory.prototype.subscribe = function(emitter) {
    for(let mod of this.modules) {
        mod(emitter);
    }
};

module.exports = SubscriberFactory;
