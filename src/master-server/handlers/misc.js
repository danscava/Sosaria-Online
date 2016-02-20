"use strict";

var log = require("../../lib/log");

function spyOnClient(packet) {
    log.info("Recieved spy-on-client packet");
};

module.exports = function(emitter) {
    emitter.on("spy-on-client", spyOnClient);
};
