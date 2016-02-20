"use strict";

var servers;

function selectGameServer(packet) {
    
};

module.exports = function(server, serverInfo) {
    servers = serverInfo;
    server.on("select-game-server", selectGameServer);
};
