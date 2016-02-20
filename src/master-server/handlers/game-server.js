"use strict";

var servers = require("../server-info");

function selectGameServer(packet) {
    
};

module.exports = function(server) {
    server.on("select-game-server", selectGameServer);
};
