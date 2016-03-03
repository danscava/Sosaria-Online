require("../../../src/lib/config")("../test/integration/master-config");
var cfg = require("../../../src/lib/config");
    uut = require("../../../src/lib/persistence");

fdescribe("Persistence", function() {
    beforeEach(function() {
        uut.init(cfg.persistence);
    });
    
    it("can initialize", function() {
    });
});
