"use strict";

var log = require("../lib/log"),
    PacketBuffer = require("./packet-buffer"),
    packets = require("./packets");

function NetState(socket, parent) {
    this.socket = socket;
    this.parent = parent;
    this.inbuf = new PacketBuffer();
    this.outbuf = new PacketBuffer();
    this.packet = null;
    allStates[this.uuid] = this;
};

NetState.prototype.handleData = function handleData(buf) {
    this.inbuf.append(buf);
    while(true) {
        if(this.inbuf.length() <= 0)
            break;
        if(this.packet === null && this.inbuf.length() > 0) {
            var id = this.inbuf.readUInt8();
            try {
                this.packet = packets.createById(id);                
            }
            catch(e) {
                log.error("Unsupported packet 0x" + id.toHex(2));
            }
            if(this.packet === null) {
                this.parent.disconnect(this);
                return;
            }
            this.packet.netState = this;
        }
        if(this.packet === null)
            break;
        this.packet.decode(this.inbuf);
        if(this.packet.decoded) {
            this.parent.queuePacket(this.packet);
            this.packet = null;
        }
        else {
            break;
        }
    }
};

NetState.prototype.sendPacket = function(packet) {
    if(this.socket === null)
        return;
    packet.netState = this;
    packet.encode(this.outbuf);
    this.socket.write(this.outbuf.activeSlice());
    this.outbuf.clear();
};

module.exports = NetState;
