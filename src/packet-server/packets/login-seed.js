var FixedPacket = require("./fixed-packet"),
    util = require("util");

function LoginSeedPacket() {
    FixedPacket.call(this);
    this.packetId = 0xEF;
    this.packetName = "login-seed";
    this.length = 20;
}
util.inherits(LoginSeedPacket, FixedPacket);

LoginSeedPacket.prototype.fixedDecode = function(buf) {
    this.encryptionSeed = buf.readUInt32();
    this.clientVersion = {
        major: buf.readInt32(),
        minor: buf.readInt32(),
        revision: buf.readInt32(),
        prototype: buf.readInt32()
    };
};

module.exports = LoginSeedPacket;
