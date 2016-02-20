"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

function LoginDeniedPacket(reason) {
    FixedPacket.call(this);
    this.packetId = 0x82;
    this.packetName = "login-denied";
    this.length = 1;
    if(typeof reason !== "undefined")
        this.reason = reason;
    else
        this.reason = LoginDeniedPacket.ReasonCode.BadCommunication;
}
util.inherits(LoginDeniedPacket, FixedPacket);
LoginDeniedPacket.id = 0x82;

LoginDeniedPacket.prototype.fixedEncode = function(buf) {
    buf.writeUInt8(this.reason);
};

LoginDeniedPacket.ReasonCode = {
    BadUserPass: 0,
    InUse: 1,
    Blocked: 2,
    Invalid: 3,
    BadCommunication: 4,
    IGRConcurrency: 5,
    IGRLimit: 6,
    IGRAuth: 7
};

module.exports = LoginDeniedPacket;
