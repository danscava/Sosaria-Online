"use strict";

var loader = require("./loader");

/** A factory that loads all modules within a directory recursively and allows
 * them to be treated as a subscription collection. All modules must export a
 * single function as module.exports that takes as its only argument an
 * EventEmitter object to subscribe to events on.
 * 
 * @param {String} dir The path to the directory to load modules from
 * 
 * @constructor
 */
function SubscriberFactory(dir) {
    /// An array of all modules in the factory
    this.modules = loader(dir, true);
    for(let mod of this.modules) {
        if(typeof mod !== "function")
            throw new Error("Module " + mod.filename + " was not a subscriber");
    }
};

/** Subscribes all modules loaded by this factory to the provied emitter.
 * 
 * @param {EventEmitter} emitter The EventEmitter to subscribe to.
 */
SubscriberFactory.prototype.subscribe = function(emitter) {
    for(let mod of this.modules) {
        mod(emitter);
    }
};

module.exports = SubscriberFactory;
