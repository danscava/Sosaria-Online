"use strict";

var fs = require("fs");

var fileLogger = null;

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

function write(type, msg){
    var now = (new Date()).toUTCString();
    var line = now + "|" + type + "|" + msg;
    console.log(line);
    if(fileLogger == null)
        return;
    fileLogger.write(line);
    fileLogger.write("\n");
};

exports.info = (msg) => {
    write("INFO", msg);
}

exports.warn = (msg) => {
    write("WARN", msg);
}

exports.error = (msg) => {
    write("ERROR", msg);
}

exports.kill = () => {
    if(fileLogger != null)
        fileLogger.end();
};
