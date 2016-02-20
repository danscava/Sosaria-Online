"use strict";

var log = require("../lib/log");
    loader = require("../lib/loader");

var packets = {};
(()=>{
    var modules = loader.loadDirectory("./src/packet-server/packets", true);
    for(var i = 0; i < modules.length; ++i) {
        var mod = modules[i];
        if(mod.id === undefined)
            log.error("Packet constructor " + mod.toString() + " has no id set");
        else
            packets[mod.id] = mod;
    }
})();

module.exports = function(buf) {
    var id = buf.readUInt8();
    var ctor = packets[id];
    if(ctor === undefined) {
        log.error("Unsupported packet 0x" + id.toString(16));
        return null;
    }
    return new ctor();
};
