var VariablePacket = require("./variable-packet"),
    util = require("util");

function GameServerListPacket() {
    VariablePacket.call(this);
    this.packetId = 0xA8;
    this.packetName = "game-server-list";
}
util.inherits(GameServerListPacket, VariablePacket);

module.exports = GameServerListPacket;
