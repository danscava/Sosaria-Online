"use strict";

var cfg = require("../../../src/lib/config").reload("../test/integration/master-config"),
    uut = require("../../../src/lib/persistence");

fdescribe("Persistence", function() {
    beforeEach(function() {
        uut.init(cfg.persistence);
    });
    
    it("can initialize", function() {
    });
    it("can store a value", function() {
        uut.store("test", "key", "value");
    });
});
