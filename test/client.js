var PacketServer = require("../src/packet-server/packet-server"),
    packets = require("../src/packet-server/packets");

function Client(ipv4, port) {
    this.server = new PacketServer(null, null);
    this.server.start();
    this.client = this.server.connect(ipv4, port);
    this.ipv4 = ipv4;
}

Client.prototype.disconnect = function() {
    if(this.client && this.server)
        this.server.disconnect(this.client);
};

Client.prototype.login = function(user, pass, major, minor, revision, prototype) {
    var ls = packets.create("LoginSeedPacket");
    ls.encryptionSeed = (this.ipv4[0] << 24) | (this.ipv4[1] << 16) |
        (this.ipv4[2] << 8) | this.ipv4[3];
    ls.clientVersion = {
        major: major,
        minor: minor,
        revision: revision,
        prototype: prototype
    };
    this.client.sendPacket(ls);
    var lr = packets.create("LoginRequestPacket");
    lr.accountName = user;
    lr.accountPass = pass;
    lr.nextLoginKey = 97;
    this.client.sendPacket(lr);
};

module.exports = Client;
