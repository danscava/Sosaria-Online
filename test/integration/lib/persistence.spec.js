"use strict";

var cfg = require("../../../src/lib/config").reload("../test/integration/master-config"),
    uut = require("../../../src/lib/persistence");

fdescribe("Persistence", function() {
    beforeEach(function() {
        uut.init(cfg.persistence);
    });
    
    afterEach(function() {
        uut.kill();
    });
    
    it("can initialize", function() {
    });
    it("can store a value", function() {
        uut.store("test", "key", "value");
    });
    it("can get a value from cache", function() {
        uut.store("test", "key", "value", function() {
            uut.load("test", "key", function(value) {
                expect(value).toBe("value");
            });
        });
    });
    it("can get a value from disk", function() {
        uut.store("test", "key", "value", function() {
            var s = uut._stores["test"];
            uut._prune(s, true);
            expect(Object.keys(s.cache).length).toBe(0);
            uut.load("test", "key", function(value) {
                expect(value).toBe("value");
            });
        });
    });
});
