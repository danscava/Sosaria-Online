"use static";

var factory = require("../lib/id-factory");

/** Prvoides an {@link IdFactory} for all Packet objects. The constructors in
 * this module follow a naming convention similar to the events defined below.
 * To arive at the constructor name, remove "packet" from the begining of the
 * event name and add "Packet" to the end of the event name. For instance, the
 * event "packetLoginSeed" would become "LoginSeedPacket".
 * 
 * @module {IdFactory} Packets
 */
module.exports = new factory("./src/packet-server/packets");
