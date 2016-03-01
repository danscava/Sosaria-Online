"use strict";

require("../lib/extensions");

var uuid = require("uuid"),
    PacketServer = require("../packet-server/packet-server.js"),
    cfg = require("../lib/config"),
    store = require("../lib/store"),
    SubscriberFactory = require("../lib/subscriber-factory"),
    handlers = new SubscriberFactory("./src/master-server/handlers");

/** The master server. This is responsible for handling all accounting
 * transactions and negotiating connections with clients to game servers.
 * 
 * @constructor
 */
function MasterServer() {
    /// The {@link PacketServer} used to handle client connections
    this.server = null;
};

MasterServer.prototype.start = function() {
    this.server = new PacketServer(cfg.ipv4, cfg.port);
    handlers.subscribe(this.server);
    this.server.start();
};

MasterServer.prototype.stop = function() {
    if(this.server !== null) {
        this.server.stop(() => {
            store.close();
        });
    } else {
        store.close();
    }
};

module.exports = MasterServer;
