"use strict";

require("../lib/extensions");

var packetServer = require("../packet-server/server.js"),
    cfg = require("../lib/config"),
    log = require("../lib/log"),
    store = require("../lib/store"),
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

log.init(cfg.logPath);
store.init(cfg.dbPath);
var server = new packetServer(cfg.ipv4, cfg.port);

function atExit(err) {
    if(err)
        log.error("Error terminated process|" + err.stack);
    if(atExit.done)
        return;
    atExit.done = true;
    server.stop(() => {
        store.close();
    });
}
atExit.done = false;

process.on("exit", atExit.bind(null));
process.on("SIGINT", atExit.bind(null));
process.on("uncaughtException", atExit.bind(null));

server.on("spy-on-client", (packet) => { log.info("Recieved spy-on-client packet"); });

require("./accounting")(server, serverInfo);
require("./game-server")(server, serverInfo);
server.start();
