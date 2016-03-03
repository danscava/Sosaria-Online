"use strict";

/** Manages a persistence service for the current process. Data is persisted as
 * key/value pairs. Keys and values are strings. See the
 * {@link module:Serialization} module for turning objects into persistable
 * strings.
 * 
 * @module Persistence
 */

var EventEmitter = require("events"),
    util = require("util"),
    fs = require("fs"),
    path = require("path"),
    log = require("./log");

var cfg;
var defaultCfg = {
    activePath = "./save"
};
var stores = {};
var BUFFER_SIZE = 1024 * 1024 * 8; // 8MB max record length

// Internal representation of a persistent store
function Store(collection) {
    EventEmitter.call(this);
    this.collection = collection;
    this.storePath = path.join(cfg.activePath, collection + ".db");
    this.storeFd = undefined;
    this.storeBuffer = new Buffer(BUFFER_SIZE);
    this.storeTransactionQueue = [];
    this.inCompaction = false;
    this.stalePath = path.join(cfg.activePath, collection + ".stale.db");
    this.staleFd = undefined;
}
util.inherits(Store, EventEmitter);

// Initializes the store object
Store.prototype.init = function() {
    var self = this;
    fs.mkdir(cfg.activePath, function(err) {
        if(err) {
            self.emit("error", err);
            return;
        }
        fs.open(self.storePath, "a+", function(err, fd) {
            if(err) {
                self.emit("error", err);
                return;
            }
            self.storeFd = fd;
            self.buildIndex();
        });
    })
};

// Builds the index of a persistent store
Store.prototype.buildIndex = function() {
    // TODO
};

// Executes the next transaction on the store queue if available
function executeNextTransaction(self) {
    var transaction = self.storeTransactionQueue.shift();
    if(!transaction)
        return;
    
    // Prepare the transaction buffer
    var bufLen = 8;
    var keyLen = self.storeBuffer.write(transaction.key, 4);
    bufLen += keyLen;
    self.storeBuffer.writeUInt32LE(keyLen);
    if(transaction.value !== undefined) {
        var valLen = self.storeBuffer.write(transaction.value, keyLen + 8);
        bufLen += valLen;
        self.storeBuffer.writeUInt32(valLen, keyLen + 4);
    } else {
        self.storeBuffer.writeUInt32(0, keyLen + 4);
    }
    
    // Write the transaction buffer
    fs.write(self.storeFd, self.storeBuffer, 0, bufLen, undefined,
             function(err, written, buffer) {
        if(err)
            self.emit("error", err);
        if(written !== bufLen)
            self.emit(new Error("Failed to write the entire buffer to persistent store"));
        setImmediate(executeNextTransaction, self);
    });
}

// Adds a single transaction to the queue, and starts the queue running if it is
// empty.
Store.prototype.addToTransactionQueue = function(key, value) {
    this.storeTransactionQueue.push({key: key, value: value});
    
    // We just put a transaction into an empty queue, prime the pump
    if(this.storeTransactionQueue.length === 1) {
        setImmediate(executeNextTransaction, this);
    }
};

// Internal function to get or create the Store object for a give collection
function getStore(collection) {
    var store = stores[collection];
    if(store !== undefined)
        return store;
    store = new Store(collection);
    stores[collection] = store;
    store.on("error", function(err) {
        log.error("A persistent storage error occured for collection " + collection + "|" + e.stack);
    });
    return store;
}

/** The expected configuration object for {@link module:Persistence#init}.
 * 
 * @typedef PersistenceConfig
 * @type {Object}
 * @property {String} activePath Path to the directory to store active datasets.
 *                               Defaults to "./save".
 */

/** Initialize the {@link module:Persistence} module. Must be called before any
 * other methods.
 * 
 * @param {PersistenceConfig} The configuration for the module to use. If not
 *                            provided the defaults are used.
 */
function init(config) {
    if(config !== undefined)
        cfg = config;
    else
        cfg = defaultCfg;
    
    // Validate the configuration
    var missing = [];
    for(var key in defaultCfg) {
        if(!defaultCfg.hasOwnProperty(key))
            continue;
        if(!cfg.hasOwnProperty(key))
            missing.push(key);
    }
    if(missing.length > 0)
        throw new Error("Missing configuration entries in PersistenceConfig: "
                            + missing.join(" "));
}

/** Shuts down the persistent storage system process-wide.
 */
function kill() {
}

/** Store a value. The storage operation will complete before the node process
 * will exit normally. Hint: Do not call process.exit() with pending store()
 * calls (or any ongoing critical I/O in any node app for that matter).
 * 
 * @param {String} collection The name of the collection into which the
 *                            key/value pair should be stored. Each collection
 *                            has a seperate set of persistence files and can
 *                            store up to about one million key/value pairs. If
 *                            the collection does not yet exist it will be
 *                            created.
 * @param {String} key The key to store the value under. If a value is already
 *                     associated with this key it will be overwritten.
 * @param {String} value The value to store. If undefined the key will be
 *                       removed from the store.
 * @returns {Boolean} True if the write request was made successfully, false
 *                    otherwise.
 */
function store(collection, key, value) {
    var s = getStore(collection);
    if(s === null)
        return false;
    s.addToTransactionQueue(key, value);    
}

exports.init = init;
exports.kill = kill;
exports.store = store;
