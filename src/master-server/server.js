"use strict";

require("../lib/extensions");

var packetServer = require("../packet-server/server.js"),
    cfg = require("../../config"),
    log = require("../lib/log"),
    store = require("../lib/store");

log.init(cfg.master.logPath);
store.init(cfg.master.dbPath);
var server = new packetServer(cfg.master.host, cfg.master.port);

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

require("./accounting")(server);
server.start();
