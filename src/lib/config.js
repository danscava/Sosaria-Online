"use strict";

var cfg = {};

module.exports = function(which) {
    module.exports = require("../../config/" + which);
};
