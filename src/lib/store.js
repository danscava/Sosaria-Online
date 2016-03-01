"use strict";

var fs = require("fs"),
    path = require("path"),
    uuid = require("uuid"),
    levelup = require("levelup"),
    sansa = require("sansa"),
    Arya = sansa.Arya,
    log = require("./log");

var arya = new Arya(),
    dbPath = "",
    db = null;

/** Provides process-wide persistent sotrage capabilities.
 * 
 * @module {Object} Store
 */

/** Initializes the persistent store. If the store does not currently exist, a
 * new one is created.
 * 
 * @param {String} dbp Path to the database directory. If null the persistent
 *                     store will not be initialized and all store calls will be
 *                     ignored.
 */
function init(dbp) {
    if(Array.isArray(dbp))
        dbp = path.join.apply(path, dbp);
    dbPath = dbp;
    if(dbPath)
        db = levelup(dbPath);
}

function writeRecord(uuid, json, cb) {
    db.put(uuid, json, {}, cb);
}

function loadRecord(uuid, cb) {
    db.get(uuid, {}, cb);
};

/** Close the persistent storage system if it is open.
 */
function close() {
    if(db !== null) {
        db.close();
    }
}

/** Register a constructor function by name with the serialization engine. All
 * constructor functions for every object that is stored must be registered or
 * an error will be thrown.
 * 
 * @param {String} name The name of the constructor function exactly as it
 *                      appears in code.
 * @param {Function} constr The function to call to construct an object of this
 *                          type. If this is not a constructor function (it
 *                          should not be used with the new keyword), then
 *                          the proxy parameter must be set to true.
 * @param {Boolean} proxy If true the new keyword will not be used to construct
 *                        objects using teh constr function.
 */
function register(name, constr, proxy) {
    if(typeof proxy !== "undefined")
        arya.register(name, constr, proxy);
    else
        arya.register(name, constr);
}

/** Called after put has persisted an object to the store.
 * 
 * @callback Store~putCallback
 * @param {Error} err An error object describing the nature of the failure, or
 *                    null if no error occured.
 * @param {String} uuid The UUIDv4 key under which the object was stored in the
 *                      persistent storeage.
 */

/** Store an object in the persistent store.
 * 
 * @param {Object} obj The object to store. Note that the object's prototype
 *                     constructor must have been registered previously with
 *                     the Store#register function. The same is true for all
 *                     objects in the object graph.
 * @param {Store~putCallback} cb Called after the object as been persisted.
 */
function put(obj, cb) {
    if(!db)
        if(cb)
            return cb(null, uuid.v4);
        else
            return;
    if(cb)
        arya.save(obj, writeRecord, cb);
    else
        arya.save(obj, writeRecord, (err, uuid) => {
            if(err)
                log.error("Error persisting object " + uuid);
        });
}

/** Called for each object loaded from all.
 * 
 * @callback Store~allCallback
 * @param {Error} err An error object describing the nature of the failure, or
 *                    null if no error occured.
 * @param {Object} obj The object loaded from the store.
 */

/** Called after all objects have been loaded from storage.
 * 
 * @callback Store~doneCallback
 * @param {Error} err An error object describing the nature of the failure, or
 *                    null if no error occured.
 */

/** Loads all objects from the persistent store.
 * 
 * @param {Store~allCallback} cb Called for each object that is loaded from the
 *                               store.
 * @param {Store~doneCallback} done Called after all objects have been loaded.
 */
function all(cb, done) {
    if(!db)
        return done();
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
