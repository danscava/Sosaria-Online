require("../src/lib/config")("../test/integration/master-config");
var MasterServer = require("../src/master-server/master-server"),
    PacketServer = require("../src/packet-server/packet-server"),
    cfg = require("../src/lib/config"),
    packets = require("../src/packet-server/packets");

describe("Login Process", function() {
    var master, client;
    
    function beforeEach() {
        master = new MasterServer();
        master.start();
        client = master.connect(cfg.ipv4, cfg.port);
    }
    
    function afterEach() {
        master.stop();
        master.disconnect(client);
    }
    
    it("Can create a new account", function() {
        var 
    });
});
