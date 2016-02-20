/*
var net = require("net"),
    cfg = require("./config");

var sock = net.createConnection(cfg.master.port);
sock.on("connect", () => {
    var buf = new Buffer(21 + 62);
    var ofs = 0;
    buf.writeUInt8(0xEF, ofs + 0);
    buf.writeUInt32BE(0, ofs + 1);
    buf.writeUInt32BE(7, ofs + 5);
    buf.writeUInt32BE(0, ofs + 9);
    buf.writeUInt32BE(47, ofs + 13);
    buf.writeUInt32BE(0, ofs + 17);
    ofs += 21;
    buf.writeUInt8(0x80, ofs + 0);
    buf.write("admin", ofs + 1, 30, "ascii");
    buf.write("asdf", ofs + 31, 30, "ascii");
    buf.writeUInt8(93, ofs + 61);
    sock.write(buf);
});
*/
"use strict";

require("./lib/extensions");

var a = 12;
console.log("0x" + a.toHex(2));
