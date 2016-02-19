var fs = require("fs"),
    path = require("path"),
    readline = require("readline"),
    sansa = require("sansa"),
    Arya = sansa.Arya,
    cfg = require("./config"),
    log = require("./log");

var arya = new Arya();

var dbPath = "",
    items = {},
    outStream = null,
    rootUuid = null;

function init(dbp, cb) {
    if(Array.isArray(dbp))
        dbp = path.join.apply(path, dbp);
    dbPath = dbp;
    items = {};
    outStream = null;
    
    load(() => {
        rewrite(() => {
            cb();
        });
    });
}

function load(cb) {
    // Load all JSON into memory
    log.info("Loading storage database " + dbPath);
    rootUuid = null;
    var stream = fs.createReadStream(dbPath, {
        flags: "r"
    });
    stream.on("error", (err) => {
        cb();
    });
    var reader = readline.createInterface({
        input: stream,
        terminal: false
    });
    reader.on("line", (line) => {
        var parts = line.split(" ", 2);
        if(parts[0] === "root") {
            rootUuid = parts[1];
        } else {
            items[parts[0]] = parts[1];            
        }
    });
    reader.on("close", () => {
        cb();
    });
}

function rewrite(cb) {
    log.info("Rewriting storage database " + dbPath);
    
    if(outStream != null)
        outStream.close();
    outStream = null;
    
    var backupPath = dbPath + ".backup";
    fs.rename(dbPath, backupPath, () => {
        openOutStream();
        for(var key in items) {
            if(!items.hasOwnProperty(key))
                continue;
            appendRecordToDatabase(key, items[key]);
        }
        if(rootUuid !== null)
            appendRootUuid(rootUuid);
        fs.unlink(backupPath, cb);
    });
}

function openOutStream() {
    var dirname = path.dirname(dbPath);
    fs.mkdir(dirname, () => {
        outStream = fs.createWriteStream(dbPath, {
            flags: "a",
        });
    });
}

function appendRecordToDatabase(uuid, json) {
    outStream.write(uuid);
    outStream.write(" ");
    outStream.write(json);
    outStream.write("\n");
}

function appendRootUuid(uuid) {
    outStream.write("root ");
    outStream.write(uuid);
}

function writeRecord(uuid, json, cb) {
    console.log("writeRecord " + uuid + " " + json);
    items[uuid] = json;
    appendRecordToDatabase(uuid, json);
    cb();
}

function loadRecord(uuid, cb) {
    cb(null, itmes[uuid])
};

function close() {
    if(outStream !== null) {
        outStream.end();
        outStream.on("finish", () => {
            console.log("finished");
        });
    }
}

function register(name, constr, proxy) {
    if(typeof proxy !== "undefined")
        arya.register(name, constr, proxy);
    else
        arya.register(name, constr);
}

function update(obj, cb) {
    arya.save(obj, writeRecord, cb);
}

function updateRoot(obj, cb) {
    arya.save(obj, writeRecord, (err, uuid) => {
        rootUuid = uuid;
        appendRootUuid(uuid);
        cb();
    });
}

function getRoot(cb) {
    if(rootUuid === null)
        cb(null, null);
    else
        arya.load(rootUuid, loadRecord, cb)
}

exports.init = init;
exports.close = close;
exports.register = register;
exports.update = update;
exports.updateRoot = updateRoot;
exports.getRoot = getRoot;
