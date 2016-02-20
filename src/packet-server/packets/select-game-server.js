"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

function SelectGameServerPacket() {
    FixedPacket.call(this);
    this.packetId = 0xA0;
    this.packetName = "select-game-server";
    this.length = 2;
    this.server = -1;
}
util.inherits(SelectGameServerPacket, FixedPacket);
SelectGameServerPacket.id = 0xA0;

SelectGameServerPacket.prototype.fixedDecode = function(buf) {
    this.server = buf.readUInt16();
};

module.exports = SelectGameServerPacket;
