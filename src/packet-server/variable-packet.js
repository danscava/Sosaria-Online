"use strict";

var Packet = require("./packet"),
    util = require("util");

function VariablePacket() {
    Packet.call(this);
    this.length = -1;
};
util.inherits(VariablePacket, Packet);

VariablePacket.prototype.decode = function(buf) {
    if(this.length < 0) {
        if(buf.length() < 2)
            return;
        this.length = buf.readUInt16();        
    }
    if(this.length >= 0) {
        if(buf.length() >= this.length)
            this.variableDecode(buf);
    }
};

VariablePacket.prototype.variableDecode = function(buf) {
    throw new Error("variableDecode() not overrided for packet " + this.packetName)
};

VariablePacket.prototype.encode = function(buf) {
    buf.writeUInt8(this.packetId);
    buf.writeUInt16(0); // Length placeholder
    this.variableEncode(buf);
    var slice = buf.activeSlice();
    slice.writeUInt16BE(buf.length(), 1);
};

VariablePacket.prototype.variableEncode = function(buf) {
    throw new Error("variableEncode() not overrided for packet " + this.packetName)
};

module.exports = VariablePacket;
