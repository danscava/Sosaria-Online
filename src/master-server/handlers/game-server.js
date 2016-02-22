"use strict";

var servers = require("../server-info");

function selectGameServer(packet) {
    if(!packet.netState.isAuthenticated)
        throw new Error("Invalid state, client selected server while not authenticated");
};

module.exports = function(server) {
    server.on("select-game-server", selectGameServer);
};
