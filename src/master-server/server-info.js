"use strict";

var cfg = require("../lib/config"),
    GameServerInfo = require("../common/game-server-info");

var serverInfo = [];
for(var i = 0; i < cfg.servers.length; ++i) {
    let serverName = cfg.servers[i];
    let server = require("../../config/" + serverName);
    let info = new GameServerInfo();
    info.name = server.name;
    info.playerLimit = server.limit;
    info.gmtOffset = server.gmtOffset;
    info.ipv4 = server.ipv4;
    serverInfo.push(info);
}

module.exports = serverInfo;
