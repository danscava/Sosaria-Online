"use strict";

var cfg = {};

/** Exposes an interface for loading configuration data for the current process.
 * 
 * @module {Object} Config
 */

/** Reloads the current configuration or loads a new one.
 * 
 * @param {String} which The path of the configuration file relative to the
 *                       config directory. If undefined the current
 *                       configuration will be reloaded.
 */
function reload(which) {
    var path;
    if(which === undefined)
        path = module.exprts.__path;
    else
        path = "../../config/" + which;
    module.exports = require(path);
    module.exports.reload = reload;
    module.exports.__path = path;
    return module.exports;
};

exports.reload = reload;
