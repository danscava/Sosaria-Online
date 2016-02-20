"use strict";

Number.prototype.toHex = function(len) {
    var str = this.toString(16);
    str = str.toUpperCase();
    str = str.substr(0, len);
    while(str.length < len)
        str = "0" + str;
    return str;
};
