"use strict";

var fs = require("fs");

var fileLogger = null;

/** Provides process-wide centralized logging capabilities.
 * @module {Object} Log
 */

/** Initializes or stops the logging module.
 * 
 * @param {String} path The path to the log file. If null logging will be
 *                      disabled. 
 */
exports.init = function(path){
    if(fileLogger != null)
        fileLogger.end();
    if(!path)
        return;
    fileLogger = fs.createWriteStream(path, {
        flags: "a",
        defaultEncoding: "utf8",
        autoClose: true
    });
    write("INFO", "Logging started");
}

/** Writes a single timestamped message to the log.
 * 
 * @param {String} type The type of the message
 * @param {String} msg The message text
 */
function write(type, msg){
    var now = (new Date()).toUTCString();
    var line = now + "|" + type + "|" + msg;
    console.log(line);
    if(fileLogger == null)
        return;
    fileLogger.write(line);
    fileLogger.write("\n");
};

/** Writes a single timestamped message of type INFO to the log.
 * 
 * @param {String} msg The message text
 */
exports.info = function(msg) {
    write("INFO", msg);
}

/** Writes a single timestamped message of type WARN to the log.
 * 
 * @param {String} msg The message text
 */
exports.warn = function(msg) {
    write("WARN", msg);
}

/** Writes a single timestamped message of type ERROR to the log.
 * 
 * @param {String} msg The message text
 */
exports.error = function(msg) {
    write("ERROR", msg);
}

/** Stops the log system. Equivalent to calling Log#init(null);
 */
exports.kill = function() {
    if(fileLogger != null)
        fileLogger.end();
};
