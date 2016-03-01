require("../../../src/lib/config")("../test/integration/master-config");
//require("../../packet-server-spy");
var MasterServer = require("../../../src/master-server/master-server"),
    Client = require("../../client"),
    cfg = require("../../../src/lib/config");

describe("Login Process", function() {
    var master, client;
    
    beforeEach(function(){
        master = new MasterServer();
        master.start();
        spyOn(master.server, "emit");
        client = new Client(cfg.ipv4, cfg.port);
        spyOn(client.server, "emit");
    });
    
    afterEach(function(){
        client.disconnect();
        master.stop();
    });
    
    it("Can create a new account", function() {
        client.login("test", "asdf", 7, 0, 47, 0);
//      master._expectEvent("accountCreated", 1);
        
    });
});
