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
    log = require("./log"),
    timestamp = require("./timestamp");

var cfg;
var defaultCfg = {
    activePath: "./save",
    pruneFrequency: 150,    // Milliseconds
    prunePercent: 15,       // 15% of the cache pruned per cycle
    maxCache: 1024 * 1024 * 32,  // 32MB
    timeToLive: 120         // Seconds
};
var stores = {};
var BUFFER_SIZE = 1024 * 1024 * 8; // 8MB max record length

// Internal representation of a persistent store
function Store(collection) {
    EventEmitter.call(this);
    this.shuttingDown = false;
    this.collection = collection;
    this.index = {};
    this.cache = {};
    this.cacheLength = 0;
    this.storePath = path.join(cfg.activePath, collection + ".db");
    this.storeFd = undefined;
    this.storeBuffer = new Buffer(BUFFER_SIZE);
    this.storeTransactionQueue = [];
    this.storeOffset = 0;
    this.readToExecuteTransactions = false;
    this.pruneInterval = null;
    this.lastPruneKey = undefined;
    this.inCompaction = false;
    this.stalePath = path.join(cfg.activePath, collection + ".stale.db");
    this.staleFd = undefined;
}
util.inherits(Store, EventEmitter);

// Closes the file descriptors
Store.prototype.closeFds = function() {
    var self = this;
    if(this.storeFd !== undefined)
        fs.close(this.storeFd, function(err) {
            if(err)
                self.emit("error", err);
        });
};

// Places the store in a state to shut down
Store.prototype.kill = function() {
    this.shuttingDown = true;
    if(this.pruneInterval)
        clearInterval(this.pruneInterval);
    process.nextTick(executeNextTransaction, this);
};

// Initializes the store object
Store.prototype.init = function() {
    var self = this;
    fs.mkdir(cfg.activePath, function(err) {
        if(err &&
            err.code !== "EEXIST") {
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
    });
};

// Builds the index of a persistent store
Store.prototype.buildIndex = function() {
    // TODO: Build the index and compact the store
    
    this.setReadyToExecute();
};

// Places the store in a state ready to execute
Store.prototype.setReadyToExecute = function() {
    // Kick-start the transaction queue
    this.readyToExecuteTransactions = true;
    process.nextTick(executeNextTransaction, this);
    this.pruneInterval = setInterval(pruneCache, cfg.pruneFrequency, this);
};

// Executes the next transaction on the store queue if available
function executeNextTransaction(self) {
    // Do not attempt to execute transactions while the store is initializing
    if(!self.readyToExecuteTransactions)
        return;
    
    var transaction = self.storeTransactionQueue.shift();
    if(!transaction) {
        if(self.shuttingDown)
            self.closeFds();
        return;
    }
    
    if(transaction.isLoad) {
        // Locate the key in the index
        if(self.index[transaction.key] === undefined)
            throw new Error("Invalid state, key not found in index: " + transaction.key);
        var idx = self.index[transaction.key];
        if(idx.length < 0 ||
            idx.offset < 0)
            throw new Error("Invalid state, attempted to read an uncommited index: " + transaction.key);
        
        // Read the transaction buffer
        fs.read(self.storeFd, self.storeBuffer, 0, idx.length, idx.offset, function(err, bytesRead, buffer) {
            if(err)
                self.emit("error", err);
            if(bytesRead !== idx.length)
                self.emit(new Error("Failed to read the entire record from persistent store"));
            var keyLen = buffer.readUInt32LE(0);
            var valLen = buffer.readUInt32LE(4);
            var key = buffer.toString("utf8", 8, 8 + keyLen);
            var val = buffer.toString("utf8", 8 + keyLen, 8 + keyLen + valLen);
            if(key !== transaction.key)
                throw new Error("Invalid state, read key did not match index: " + transaction.key);
            if(transaction.cb)
                transaction.cb(key, val);
            process.nextTick(executeNextTransaction, self);
        });
    } else {
        // Prepare the transaction buffer
        var bufLen = 8;
        var keyLen = self.storeBuffer.write(transaction.key, 8);
        bufLen += keyLen;
        self.storeBuffer.writeUInt32LE(keyLen, 0);
        var valLen = 0;
        if(transaction.value !== undefined) {
            valLen = self.storeBuffer.write(transaction.value, keyLen + 8);
            bufLen += valLen;
        }
        self.storeBuffer.writeUInt32LE(valLen, 4);

        // Write the transaction buffer
        fs.write(self.storeFd, self.storeBuffer, 0, bufLen, undefined, function(err, written, buffer) {
            var offset = self.storeOffset;
            self.storeOffset += written;
            if(err)
                self.emit("error", err);
            if(written !== bufLen)
                self.emit(new Error("Failed to write the entire buffer to persistent store"));
            self.index[transaction.key] = {
                offset: offset,
                length: written
            };
            if(transaction.cb)
                transaction.cb();
            process.nextTick(executeNextTransaction, self);
        });
    }
}

// Adds a single transaction to the queue, and starts the queue running if it is
// empty.
Store.prototype.addToTransactionQueue = function(isLoad, key, value, cb) {
    this.storeTransactionQueue.push({isLoad: isLoad, key: key, value: value, cb: cb});
    
    if(!isLoad) {
        // Update the cache
        this.cache[key] = {
            value: value,
            when: timestamp.now()
        };
        this.cacheLength += key.length + value.length;
        
        // Invalidate the index
        this.index[key] = {
            offset: -1,
            length: -1
        };
    }
    
    // We just put a transaction into an empty queue, prime the pump
    if(this.storeTransactionQueue.length === 1) {
        process.nextTick(executeNextTransaction, this);
    }
};

// Prunes a portion of the cache based on the configuration options on the store
function pruneCache(self, full) {
    var keys = Object.keys(self.cache);
    if(keys.length <= 0)
        return;
    
    var maxCache = cfg.maxCache / 4; // Convert MB into characters (in UTF32)
    var lastTTL = timestamp.now() - cfg.timeToLive * 1000;
    
    if(full)
        maxCache = 0;
    
    console.log(keys);
    console.log(keys.findIndex);
    var idx = keys.findIndex(self.lastPruneKey);
    if(idx < 0)
        idx = 0;
    
    var toPrune = self.index.length * cfg.prunePercent * 0.01;
    if(toPrune < 1)
        toPrune = 1;
    
    while(toPrune-- > 0) {
        if(idx >= keys.length)
            idx = 0;
        var key = keys[idx++];
        
        // Value is pending write to disk
        if(self.index[key].offset < 0)
            continue;
        
        if(self.cacheLength > maxCache || // We are over the cache limit, prune regardless of age
            self.cache[key].when < lastTTL) { // Older than TTL cutoff
            self.cacheLength -= key.length + self.cache[key].value.length;
            delete self.cache[key];
        }
    }
}

// Internal function to get or create the Store object for a give collection
function getStore(collection) {
    var store = stores[collection];
    if(store !== undefined)
        return store;
    store = new Store(collection);
    store.init();
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
    for(var key in stores) {
        if(!stores.hasOwnProperty(key))
            continue;
        stores[key].kill();
    }
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
 * @param {Function} cb Callback function called after the store operation has
 *                      completed and written to disk.
 * @returns {Boolean} True if the write request was made successfully, false
 *                    otherwise.
 */
function store(collection, key, value, cb) {
    var s = getStore(collection);
    if(s === null)
        return false;
    s.addToTransactionQueue(false, key, value, cb);    
}

/** Callback called after a load operation completes.
 * 
 * @callback module:Persistence~loadCallback
 * @param {String} key The key of the value requested.
 * @param {String} value The value loaded.
 */

/** Load a value by key. The load operation will complete before the node
 * process will exit normally. Hint: Do not call process.exit() with pending
 * load() calls (or any ongoing critical I/O in any node app for that matter).
 * 
 * @param {String} collection The name of the collection into which the
 *                            key/value pair should be loaded from. If
 *                            the collection does not yet exist an empty
 *                            collection will be created, but the operation will
 *                            ultimately fail.
 * @param {String} key The key under which the value is stored. If the key is
 *                     not contained within the collection the operation will
 *                     fail.
 * @param {module:Persistence~loadCallback} cb (Optional) The callback function
 *                     to call after the operation completes. This function will
 *                     only be called if the operation is successful.
 */
function load(collection, key, value, cb) {
    var s = getStore(collection);
    if(s.index[key] === undefined)
        return false;
    if(s.cache[key] !== undefined) {
        if(cb)
            cb(key, s.cache[key].value);
    } else {
        s.addToTransactionQueue(true, key, value, cb);
    }
    return true;
}

exports.init = init;
exports.kill = kill;
exports.store = store;
exports.load = load;

// Exposing some internals for testing purposes
exports._stores = stores;
exports._prune = pruneCache;
