"use strict";

var Store = require("../lib/store");

/** A user account.
 * 
 * @constructor
 */
function Account() {
    /// The user name
    this.name = "";
    /// The hash of the password
    this.passHash = "";
};

module.exports = Account;
Store.register("Account", Account);
