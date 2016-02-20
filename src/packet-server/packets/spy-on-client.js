"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

function SpyOnClientPacket() {
    FixedPacket.call(this);
    this.packetId = 0xD9;
    this.packetName = "spy-on-client";
    this.length = 267;
}
util.inherits(SpyOnClientPacket, FixedPacket);
SpyOnClientPacket.id = 0xD9;

SpyOnClientPacket.prototype.fixedDecode = function(buf) {
    buf.ignore(this.length);
};

module.exports = SpyOnClientPacket;
