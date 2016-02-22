"use strict";

/* Measures the performance of the ConstructorFactory object for relative
 * comparison only.
 */

var ConstructorFactory = require("../../src/lib/constructor-factory"),
    factory = new ConstructorFactory("./src/packet-server/packets");

var start = process.hrtime();
for(let i = 0; i < 1000000; ++i) {
    let packet = factory.create("LoginDeniedPacket");
}
var t = process.hrtime(start);
console.log("1Mil itterations, no arguments, %d nanoseconds", t[0] * 1e9 + t[1]);
