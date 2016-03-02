"use strict";

/** An automatically expanding buffer used for string writes.
 * 
 * @constructor
 */
function StringBuffer() {
    /// The internal buffer
    this.buffer = new Buffer(512);
    /// The current write offset
    this.offset = 0;
}

/** Write a string to the buffer.
 * 
 * @param {String} str The string to write
 */
StringBuffer.prototype.write = function(str) {
    if(this.buffer.length < this.offset + str.length) {
        var newSize;
        do {
            newSize = this.buffer.length * 2;
        } while(newSize < this.offset + str.length);
        var newBuff = new Buffer(newSize);
        this.buffer.copy(newBuff, 0, 0, this.offset);
        this.buffer = newBuff;
    }
    this.offset += this.buffer.write(str, this.offset);
};

/** Gets the active buffer region.
 * 
 * @returns {Buffer} A buffer slice of the valid string.
 */
StringBuffer.prototype.getBuffer = function() {
    return this.buffer.slice(0, this.offset);
};

module.exports = StringBuffer;
