var crypto = require("crypto"),
    packetServer = require("./packet-server/server.js"),
    cfg = require("./config"),
    log = require("./log"),
    store = require("./store"),
    Account = require("./common/account");
    LoginDeniedPacket = require("./packet-server/packets/login-denied");

log.init(cfg.master.logPath);

var accounts = {};
store.init(cfg.master.dbPath);
var server = new packetServer(cfg.master.host, cfg.master.port);

server.on("login-seed", (packet) => {
    var req = cfg.requiredClientVersion;
    var clv = packet.clientVersion;
    if(typeof req.major !== "undefined" && clv.major !== req.major ||
        typeof req.minor !== "undefined" && clv.minor !== req.minor ||
        typeof req.revision !== "undefined" && clv.revision !== req.revision ||
        typeof req.prototype !== "undefined" && clv.prototype !== req.prototype) {
        log.info("Client connection rejected due to incompatible client version " +
            clv.major + "." + clv.minor + "." + clv.revision + "." + clv.prototype);
        packet.netState.sendPacket(new LoginDeniedPacket(LoginDeniedPacket.ReasonCode.BadCommunication));
    } else {
        log.info("Client connected with version " +
            clv.major + "." + clv.minor + "." + clv.revision + "." + clv.prototype);
    }
});

server.on("login-request", (packet) => {
    var hash = crypto.createHash("sha256");
    hash.update(packet.accountPass);
    var passHash = hash.digest("hex");
    var account = accounts[packet.accountName];
    if(account === undefined) {
        account = new Account();
        account.name = packet.accountName;
        account.passHash = passHash;
        accounts[packet.accountName] = account;
        store.put(account);
        log.info("Creating new account " + packet.accountName);
    } else if(account.passHash != passHash) {
        log.info("Account " + accoun.name + " failed a login attempt");
        packet.netState.sendPacket(new LoginDeniedPacket(LoginDeniedPacket.ReasonCode.BadUserPass));
        return;
    }
    log.info("Account " + account.name + " successfuly logged in");
});

function atExit(err) {
    if(err)
        log.error("Error terminated process|" + err.stack);
    if(atExit.done)
        return;
    atExit.done = true;
    server.stop(() => {
        store.close();
    });
}
atExit.done = false;

process.on("exit", atExit.bind(null));
process.on("SIGINT", atExit.bind(null));
process.on("uncaughtException", atExit.bind(null));

// Load accounts and start the server
store.all((account) => {
    accounts[account.name] = account;
}, () => {
    server.start();
});
