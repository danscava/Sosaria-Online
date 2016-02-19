"use strict";

var fs = require("fs"),
    path = require("path"),
    levelup = require("levelup"),
    sansa = require("sansa"),
    Arya = sansa.Arya,
    cfg = require("./config"),
    log = require("./log");

var arya = new Arya(),
    dbPath = "",
    db = null;

function init(dbp, cb) {
    if(Array.isArray(dbp))
        dbp = path.join.apply(path, dbp);
    dbPath = dbp;
    db = levelup(dbPath);
}

function writeRecord(uuid, json, cb) {
    db.put(uuid, json, {}, cb);
}

function loadRecord(uuid, cb) {
    db.get(uuid, {}, cb);
};

function close() {
    if(db !== null) {
        db.close();
    }
}

function register(name, constr, proxy) {
    if(typeof proxy !== "undefined")
        arya.register(name, constr, proxy);
    else
        arya.register(name, constr);
}

function put(obj, cb) {
    if(cb)
        arya.save(obj, writeRecord, cb);
    else
        arya.save(obj, writeRecord, (err, uuid) => {
            if(err)
                log.error("Error persisting object " + uuid);
        });
}

function all(cb, done) {
    var keyStream = db.createKeyStream({});
    keyStream.on("data", (key) => {
        arya.load(key, loadRecord, (err, obj) => {
            if(err)
                log.error("Error deserializing object|" + err.message);
            else
                cb(obj);
        });
    });
    keyStream.on("end", done);
    keyStream.on("error", (err) => {
        log.error("Error while reading database keys from " + this.dbPath +
            "|" + err.message);
    });
}

exports.init = init;
exports.close = close;
exports.register = register;
exports.put = put;
exports.all = all;
