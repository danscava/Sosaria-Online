var crypto = require("crypto"),
    packetServer = require("./packet-server/server.js"),
    cfg = require("./config"),
    log = require("./log"),
    store = require("./store"),
    Account = require("./common/account");
    LoginDeniedPacket = require("./packet-server/packets/login-denied");

log.init(cfg.master.logPath);

var accounts = null;
var server = new packetServer(cfg.master.host, cfg.master.port);
var timer = setInterval(() => { store.updateRoot(accounts); }, cfg.master.dbSaveInterval);

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
    } else if(account.passHash != passHash) {
        log.info("Account " + accoun.name + " failed a login attempt");
        packet.netState.sendPacket(new LoginDeniedPacket(LoginDeniedPacket.ReasonCode.BadUserPass));
        return;
    }
    log.info("Account " + account.name + " successfuly logged in");
});

store.init(cfg.master.dbPath, () => {
    store.getRoot((err, root) => {
        if(root === null) {
            accounts = {};
        } else {
            accounts = root;
        }
        server.start();
    })
});

function atExit(doExit, err) {
    if(err)
        log.error("Error terminated process|" + err.stack);
    if(atExit.done)
        return;
    atExit.done = true; 
    log.info("AtExit!")
    clearTimeout(timer);
    store.updateRoot(accounts, () => {
        store.close();
        if(doExit)
            process.exit();
    });       
}
atExit.done = false;

process.on("exit", atExit.bind(null, false));
process.on("SIGINT", atExit.bind(null, true));
process.on("uncaughtException", atExit.bind(null, true));
