var FixedPacket = require("../fixed-packet"),
    util = require("util");

function LoginRequestPacket() {
    FixedPacket.call(this);
    this.packetId = 0x80;
    this.packetName = "login-request";
    this.length = 61;
}
util.inherits(LoginRequestPacket, FixedPacket);
LoginRequestPacket.id = 0x80;

LoginRequestPacket.prototype.fixedDecode = function(buf) {
    this.accountName = buf.readAsciiString(30);
    this.accountPass = buf.readAsciiString(30);
    this.nextLoginKey = buf.readUInt8();
};

module.exports = LoginRequestPacket;
