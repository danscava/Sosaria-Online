"use strict";

var FixedPacket = require("../fixed-packet"),
    util = require("util");

function LoginDeniedPacket() {
    FixedPacket.call(this);
    this.packetId = 0x82;
    this.packetName = "login-denied";
    this.length = 1;
    this.reason = 4; // Bad communications
}
util.inherits(LoginDeniedPacket, FixedPacket);
LoginDeniedPacket.id = 0x82;

LoginDeniedPacket.prototype.fixedEncode = function(buf) {
    buf.writeUInt8(this.reason);
};

/* Reason Codes
0 Bad username or password
1 Account in use
2 Account blocked
3 Invalid account credentials
4 Bad communications
5 IGR concurrency limit met
6 IGR time limit met
7 IGR authorization error
*/

module.exports = LoginDeniedPacket;
