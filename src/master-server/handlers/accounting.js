"use strict";

var crypto = require("crypto"),
    cfg = require("../../lib/config"),
    log = require("../../lib/log"),
    store = require("../../lib/store"),
    Account = require("../../common/account"),
    packets = require("../../packet-server/packets"),
    servers = require("../server-info");

var accounts = {};

function loginSeed(packet) {
    var req = cfg.requiredClientVersion;
    var clv = packet.clientVersion;
    if(typeof req.major !== "undefined" && clv.major !== req.major ||
        typeof req.minor !== "undefined" && clv.minor !== req.minor ||
        typeof req.revision !== "undefined" && clv.revision !== req.revision ||
        typeof req.prototype !== "undefined" && clv.prototype !== req.prototype) {
        log.info("Client connection rejected due to incompatible client version " +
            clv.major + "." + clv.minor + "." + clv.revision + "." + clv.prototype);
        packet.netState.sendPacket(packets.create("LoginDeniedPacket", 4)); // Bad communication
    } else {
        log.info("Client connected with version " +
            clv.major + "." + clv.minor + "." + clv.revision + "." + clv.prototype);
    }    
}

function loginRequest(packet) {
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
    var gsl = packets.create("GameServerListPacket");
    for(let server of servers) {
        gsl.servers.push(server);
    }
    packet.netState.sendPacket(gsl);
}

module.exports = function(server) {
    store.all((account) => {
        accounts[account.name] = account;
    }, () => {
        server.on("login-seed", loginSeed);
        server.on("login-request", loginRequest);        
    });
};
