var store = require("../store");

function Account() {
    this.name = "";
    this.passHash = "";
};

module.exports = Account;
store.register("Common.Account", Account);
