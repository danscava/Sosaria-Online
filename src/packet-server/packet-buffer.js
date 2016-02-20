function PacketBuffer() {
    this.buffer = new Buffer(64 * 1024);
    this.offset = 0;
    this.end = 0;
}

PacketBuffer.prototype.append = function(buf) {
    buf.copy(this.buffer, this.end, 0, buf.length);
    this.end += buf.length;
};

PacketBuffer.prototype.flush = function() {
    var l = this.length();
    if(l > 0)
        this.buffer.copy(this.buffer, 0, this.offset, l);
    this.offset = 0;
    this.end = l;
};

PacketBuffer.prototype.length = function() {
    return this.end - this.offset;
};

PacketBuffer.prototype.activeSlice = function() {
    return this.buffer.slice(this.offset, this.end);
};

PacketBuffer.prototype.clear = function() {
    this.offset = this.end = 0;
};

PacketBuffer.prototype.dump = function() {
    var ret = "";
    var bank = 0;
    var dataStr = "";
    var asciiStr = "";
    for(var i = this.offset; i < this.end; ++i) {
        var col = i % 16;
        if(i != 0 && col == 0) {
            var bankStr = bank.toString(16);
            while(bankStr.length < 3)
                bankStr = "0" + bankStr;
            bankStr += "0";
            while(dataStr.length < 32)
                dataStr += "  ";
            while(asciiStr.length < 16)
                asciiStr += " ";
            ret += bankStr + "|" + dataStr + "|" + asciiStr + "\n";
            ++bank;
        }
        var byte = this.buffer.readUInt8(i);
        var data = byte.toString(16);
        if(data.length == 1)
            data = "0" + data;
        dataStr += data;
        if(col != 15)
            dataStr += " ";
        var chr;
        if(byte >= 0x20 && byte <= 0x7f)
            chr = String.fromCharCode(byte);
        else
            chr = ".";
        asciiStr += chr;
    }
    if(dataStr.length > 0) {
        var bankStr = bank.toString(16);
        while(bankStr.length < 3)
            bankStr = "0" + bankStr;
        bankStr += "0";
        while(dataStr.length < 47)
            dataStr += "  ";
        while(asciiStr.length < 16)
            asciiStr += " ";
        ret += bankStr + "|" + dataStr + "|" + asciiStr + "\n";
    }
    return ret;
};

PacketBuffer.prototype.readUInt8 = function() {
    var ret = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return ret;
};

PacketBuffer.prototype.readInt8 = function() {
    var ret = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return ret;
};

PacketBuffer.prototype.readUInt16 = function() {
    var ret = this.buffer.readUInt16BE(this.offset);
    this.offset += 2;
    return ret;
};

PacketBuffer.prototype.readInt16 = function() {
    var ret = this.buffer.readInt16BE(this.offset);
    this.offset += 2;
    return ret;
};

PacketBuffer.prototype.readUInt32 = function() {
    var ret = this.buffer.readUInt32BE(this.offset);
    this.offset += 4;
    return ret;
};

PacketBuffer.prototype.readInt32 = function() {
    var ret = this.buffer.readInt32BE(this.offset);
    this.offset += 4;
    return ret;
};

PacketBuffer.prototype.readAsciiString = function(length) {
    var ret = this.buffer.toString("ascii", this.offset, this.offset + length);
    var end = ret.indexOf("\0");
    ret = ret.substr(0, end);
    this.offset += length;
    return ret;
};

PacketBuffer.prototype.readUnicodeString = function(length) {
    var ret = this.buffer.toString("utf16", this.offset, this.offset + length);
    var end = ret.indexOf("\0");
    ret = ret.substr(0, end);
    this.offset += length;
    return ret;
};

PacketBuffer.prototype.ignore = function(length) {
    this.offset += length;
};

PacketBuffer.prototype.writeUInt8 = function(v) {
    this.buffer.writeUInt8(v, this.end);
    this.end += 1;
};

PacketBuffer.prototype.writeInt8 = function(v) {
    this.buffer.writeInt8(v, this.end);
    this.end += 1;
};

PacketBuffer.prototype.writeUInt16 = function(v) {
    this.buffer.writeUInt16BE(v, this.end);
    this.end += 2;
};

PacketBuffer.prototype.writeInt16 = function(v) {
    this.buffer.writeInt16BE(v, this.end);
    this.end += 2;
};

PacketBuffer.prototype.writeUInt32 = function(v) {
    this.buffer.writeUInt32BE(v, this.end);
    this.end += 4;
};

PacketBuffer.prototype.writeInt32 = function(v) {
    this.buffer.writeInt32BE(v, his.end);
    this.end += 4;
};

PacketBuffer.prototype.writeAsciiString = function(v, length) {
    this.buffer.write(v, this.end, length, "ascii");
    this.end += length;
}

PacketBuffer.prototype.writeUnicodeString = function(v, length) {
    this.buffer.write(v, this.end, length, "utf16");
    this.end += length;
}

module.exports = PacketBuffer;
