"use strict";

var Store = require("../lib/store");

function Account() {
    this.name = "";
    this.passHash = "";
};

module.exports = Account;
Store.register("Account", Account);
