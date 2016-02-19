var net = require("net"),
    EventEmitter = require("events"),
    util = require("util"),
    log = require("../log"),
    NetState = require("./net-state");

function PacketServer(host, port){
    EventEmitter.call(this);
    this.host = host;
    this.port = port;
    this.server = null;
    this.packetQueue = [];
    this.timer = null;
};
util.inherits(PacketServer, EventEmitter);

PacketServer.prototype.start = function(){
    var self = this;
    this.server = net.Server((socket) => {
        var state = new NetState(socket, self);

        log.info("Client connected from " + socket.remoteAddress);
        socket.setNoDelay();
        socket.setTimeout(15 * 1000, function(socket){
            state.disconnect();
        });
        
        socket.on("data", (chunk) => {
            state.handleData(chunk);
        });
        
        socket.on("end", (socket) => {
            state.disconnect();
        });
        
        socket.on("error", (socket) => {
            state.disconnect();
        });
    }).listen({
        host: self.host,
        port: self.port,
        exclusive: true
    }, function() {
        log.info("Packet server listening on " + self.host + ":" + self.port);
    });
    
    // 50 times per second stop all I/O and drain the packet queue
    this.timer = setInterval(() => { this.processQueue(); }, 20);
};

PacketServer.prototype.stop = function(cb) {
    log.info("Packet server stopping");
    // Stop accepting new connections and disconnect clients
    if(this.server !== null) {
        this.server.on("close", cb);
        this.server.close();
    }
    NetState.disconnectAll();
    
    // Drain the packet queue
    clearInterval(this.timer);
    this.processQueue();
};

PacketServer.prototype.queuePacket = function(event) {
    this.packetQueue.push(event);
};

PacketServer.prototype.processQueue = function() {
    while(this.packetQueue.length > 0) {
        var packet = this.packetQueue.shift();
        try {
            this.emit(packet.packetName, packet);            
        } catch(e) {
            log.error("Error in packet handler " + packet.packetName + "|" + e.message);
        }
    }
};

module.exports = PacketServer;
