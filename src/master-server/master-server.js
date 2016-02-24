"use strict";

require("../lib/extensions");

var uuid = require("uuid"),
    PacketServer = require("../packet-server/packet-server.js"),
    cfg = require("../lib/config"),
    log = require("../lib/log"),
    store = require("../lib/store"),
    SubscriberFactory = require("../lib/subscriber-factory"),
    handlers = new SubscriberFactory("./src/master-server/handlers");

function MasterServer() {
};

MasterServer.prototype.start = function() {
    log.init(cfg.logPath);
    store.init(cfg.dbPath);
    this.server = new PacketServer(cfg.ipv4, cfg.port);
    handlers.subscribe(this.server);
    this.server.start();
};

MasterServer.prototype.stop = function() {
    this.server.stop(() => {
        store.close();
    });
};

module.exports = MasterServer;
