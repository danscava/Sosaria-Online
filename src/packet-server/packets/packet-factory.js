var log = require("../../log"),
    LoginRequest = require("./login-request");
    LoginSeed = require("./login-seed");

var packets = {
    0x80: LoginRequest,
    0xEF: LoginSeed
};

module.exports = function(buf) {
    var id = buf.readUInt8();
    var ctor = packets[id];
    if(typeof ctor === "undefined") {
        log.error("Unknown packet 0x" + id.toString(16));
        return null;
    }
    return new ctor();
};
