var uut = require("../../../src/lib/serialization");

describe("uut", function() {
    it("can serialize an empty object", function() {
        var a = {};
        var b = uut.serialize(a);
        expect(typeof b).toBe("string");
    });
    it("can deserialize an empty object", function() {
        var a = {};
        var b = uut.deserialize(uut.serialize(a));
        expect(Object.keys(b).length).toBe(0);
    });
    it("supports boolean values", function() {
        var a = {v: false};
        var b = uut.deserialize(uut.serialize(a));
        expect(Object.is(b.v, false)).toBe(true);
    });
    it("supports number values", function() {
        var a = {v: 17};
        var b = uut.deserialize(uut.serialize(a));
        expect(Object.is(b.v, 17)).toBe(true);
    });
    it("supports string values", function() {
        var a = {v: "copa"};
        var b = uut.deserialize(uut.serialize(a));
        expect(Object.is(b.v, "copa")).toBe(true);
    });
    it("supports undefined values", function() {
        var a = {v: undefined};
        var b = uut.deserialize(uut.serialize(a));
        expect(Object.is(b.v, undefined)).toBe(true);
    });
    it("does not support function values", function() {
        var a = {v: function(){}};
        var b = uut.deserialize(uut.serialize(a));
        expect(typeof b.a).not.toBe("function");
    });
    it("does not support function values", function() {
        var a = {v: function(){}};
        var b = uut.deserialize(uut.serialize(a));
        expect(b.hasOwnProperty("v")).toBe(false);
    });
    it("does not support symbol values", function() {
        var a = {v: Symbol()};
        var b = uut.deserialize(uut.serialize(a));
        expect(b.hasOwnProperty("v")).toBe(false);
    });
    it("supports object graphs", function() {
        var a = {
            v: {
                v: 17
            }
        };
        var b = uut.deserialize(uut.serialize(a));
        expect(typeof b.v).toBe("object");
        expect(Object.is(b.v.v, 17)).toBe(true);
    });
    it("supports recursive object graphs", function() {
        var a = {v: 17};
        var b = {a: a};
        a.b = b;
        var c = uut.deserialize(uut.serialize(a));
        expect(typeof c.b).toBe("object");
        expect(typeof c.b.a).toBe("object");
        expect(Object.is(c.b.a.v, 17)).toBe(true);
    });
    it("supports arrays", function() {
        var a = {v: [2, 3, 5, 7, 11, 13, 17, 19]};
        var b = uut.deserialize(uut.serialize(a));
        expect(typeof b.v).toBe("object");
        expect(Array.isArray(b.v)).toBe(true);
        expect(b.v[3]).toBe(7);
    });
    it("supports nested arrays", function() {
        var a = {v: [1, 2, 3, [4, 5, 6]]};
        var b = uut.deserialize(uut.serialize(a));
        expect(Array.isArray(a.v[3])).toBe(true);
        expect(a.v[3][1]).toBe(5);
    });
    it("supports objects in arrays", function() {
        var a = {v: [1, 2, 3, {v: 17}]};
        var b = uut.deserialize(uut.serialize(a));
        expect(typeof a.v[3]).toBe("object");
        expect(a.v[3].v).toBe(17);
    });
    it("supports recursive arrays", function() {
        var a = [1, 2, 3];
        var b = [4, 5, 6, a];
        a.push(b);
        var c = uut.deserialize(uut.serialize(a));
        expect(Array.isArray(a[3][3][3])).toBe(true);
        expect(a[3][3][0]).toBe(1);
    });
});
