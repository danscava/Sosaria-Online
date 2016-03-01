"use strict";

var log = require("../../lib/log");

function spyOnClient(packet) {
    log.info("Recieved Spy on Client packet");
};

module.exports = function(emitter) {
    emitter.on("packetSpyOnClient", spyOnClient);
};
