var log = require("../log"),
    PacketBuffer = require("./packet-buffer"),
    factory = require("./packets/packet-factory");

function NetState(socket, parent) {
    this.socket = socket;
    this.parent = parent;
    this.inbuf = new PacketBuffer();
    this.outbuf = new PacketBuffer();
    this.packet = null;
};

NetState.prototype.disconnect = function disconnect() {
    this.socket.end();
};

NetState.prototype.handleData = function handleData(buf) {
    this.inbuf.append(buf);
    while(true) {
        if(this.inbuf.length() <= 0)
            break;
        if(this.packet === null) {
            this.packet = factory(this.inbuf);
            if(this.packet === null)
                this.disconnect();
            this.packet.netState = this;
        }
        this.packet.decode(this.inbuf);
        if(this.packet.decodeComplete) {
            this.parent.queuePacket(this.packet);
            this.packet = null;
        }
        else {
            break;
        }
    }
};

NetState.prototype.sendPacket = function(packet) {
    packet.netState = this;
    packet.encode(this.outbuf);
    this.socket.write(this.outbuf.activeSlice());
    this.outbuf.clear();
};

module.exports = NetState;
