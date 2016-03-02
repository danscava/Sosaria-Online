var oliveBranch = require("../../src/lib/olive-branch");

fdescribe("OliveBranch", function() {
    it("can serialize an empty object", function() {
        console.log(oliveBranch.serialize({}));
    });
    it("can deserialize an empty object", function() {
        var a = {};
        var b = oliveBranch.deserialize(oliveBranch.serialize(a));
        expect(Object.equals(a, b)).toBe(true);
    });
});
