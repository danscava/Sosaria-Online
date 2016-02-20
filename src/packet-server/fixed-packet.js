var Packet = require("./packet"),
    util = require("util");

function FixedPacket() {
    Packet.call(this);
    this.length = 0;
};
util.inherits(FixedPacket, Packet);

FixedPacket.prototype.decode = function(buf) {
    if(buf.length() >= this.length) {
        this.fixedDecode(buf);
        this.decoded = true;
    }
};

FixedPacket.prototype.fixedDecode = function(buf) {
    throw new Error("fixedDecode() method not overridded for packet " + this.packetName);
};

FixedPacket.prototype.encode = function(buf) {
    buf.writeUInt8(this.packetId);
    this.fixedEncode(buf);
    this.encoded = true;
};

FixedPacket.prototype.fixedEncode = function(buf) {
    throw new Error("fixedEncode() method not overridded for packet " + this.packetName);
};

module.exports = FixedPacket;
