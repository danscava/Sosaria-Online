"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

/** This packet is sometimes sent from the client after a
 * {@link module:Packets#packetLoginRequest} packet. It should be ignored.
 * This packet is only sent from the client to a {@link MasterServer}.
 * 
 * @event module:Packets#packetSpyOnClient
 * @type {Object}
 */
function SpyOnClientPacket() {
    FixedPacket.call(this);
    this.packetId = 0xD9;
    this.packetName = "packetSpyPnClient";
    this.length = 267;
}
util.inherits(SpyOnClientPacket, FixedPacket);
SpyOnClientPacket.id = 0xD9;

SpyOnClientPacket.prototype.fixedDecode = function(buf) {
    buf.ignore(this.length);
};

module.exports = SpyOnClientPacket;
