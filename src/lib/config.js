"use strict";

var cfg = {};

/** Exposes an interface for loading configuration data for the current process.
 * The first time this module is required it will resovle to a function which
 * takes a single parameter, the name of the configuration file in the config
 * directory to load. After the initial call all references to this module
 * will resolve to the object exported by that configuration file.
 * 
 * @module {Object} Config
 */
module.exports = function(which) {
    module.exports = require("../../config/" + which);
    return module.exports;
};
