"use strict";

var net = require("net"),
    uuid = require("uuid"),
    EventEmitter = require("events"),
    util = require("util"),
    log = require("../lib/log"),
    NetState = require("./net-state");

/** An eventing framework that is responsible for all network I/O and event
 * processing for a shard or master.
 * 
 * @constructor
 * @param {number[]} ipv4 The IPv4 address the server is to listen on as an
 *                        array of numbers. The Ultima Online client can only
 *                        handle IPv4 addresses, so we have to bind to one. If
 *                        this is null, no listener will be started and the
 *                        server will be in client-only mode.
 * @param {number}   port The TCP port number to bind to. Ultima Online only
 *                        uses TCP.
 */
function PacketServer(ipv4, port){
    EventEmitter.call(this);
    if(ipv4 !== null)
        /** The hostname to bind to.
         * @type {String}
         */
        this.host = ipv4.join(".");
    else
        this.host = null;
    /** The port number to bind to.
     * @type {Number}
     */
    this.port = port;
    /** The net.Server that drives the network I/O.
     * @type {net.Server}
     */
    this.server = null;
    /** A queue of incomming packets waiting to be processed.
     * @type {Packet[]}
     */
    this.packetQueue = [];
    /** The timer identifier of the packet queue processing timer.
     * @type {Number}
     */
    this.timer = null;
    /** A map of all connected {@link NetState}s.
     * @type {Object}
     */
    this.netStates = {};
    /** If true all input chunks will be dumped to the log. Defaults to false.
     * @type {Boolean}
     */
    this.debug = false;
};
util.inherits(PacketServer, EventEmitter);

/** Starts the server accepting connections and processing events.
 */
PacketServer.prototype.start = function(){
    var self = this;
    if(this.host !== null) {
        this.server = net.Server((socket) => {
            var state = new NetState(socket, self);
            socket.netState = state;
            state.uuid = uuid.v4();
            this.netStates[uuid] = state;

            this.emit("netstate-connected", state);

            socket.setNoDelay();

            socket.setTimeout(15 * 1000, function(socket){
                self.disconnect(state);
            });

            socket.on("data", (chunk) => {
                try {
                    state.handleData(chunk);                
                } catch(e) {
                    log.error("Exception while processing data|" + e.stack);
                }
            });

            socket.on("end", (socket) => {
                self.disconnect(state);
            });

            socket.on("error", (socket) => {
                self.disconnect(state);
            });
        }).listen({
            host: self.host,
            port: self.port,
            exclusive: true
        }, function() {
            log.info("Packet server listening on " + self.host + ":" + self.port);
        });
    }
    
    // 50 times per second stop all I/O and drain the packet queue
    this.timer = setInterval(() => { this.processQueue(); }, 20);
};

/** Begins the process of stopping the server. During this time all clients are
 * gracefully disconnected and all pending events are processed. This is usually
 * a quick process but may take up to several minutes if there are half-open
 * sockets waiting to time out.
 * 
 * @param {funciton} cb A callback function that will be called with no
 *                      arguments when the server has completely stopped.
 */
PacketServer.prototype.stop = function(cb) {
    log.info("Packet server stopping");
    // Stop accepting new connections
    if(this.server !== null) {
        this.server.on("close", cb);
        this.server.close();
    }
    
    // Stop processing packets
    clearInterval(this.timer);
    
    // Disconnect all clients
    for(let uuid in this.netStates)
        this.disconnect(this.netStates[uuid]);
    
    // Drain the packet queue
    this.processQueue();
};

/** Disconnect a single connected client.
 * 
 * @param {NetState} netstate The NetState object to disconnect.
 */
PacketServer.prototype.disconnect = function(netstate) {
    if(!netstate)
        return;
    if(netstate.socket) try { netstate.socket.disconnect(); } catch(e) {}
    try { delete this.netStates[netstate.uuid]; } catch(e) {}
};

/** Establishes a client connection to a server.
 * 
 * @param {Number[]} ipv4 The IPv4 address of the desitnation server
 * @param {Number}   port The port the destination server is listening on
 * @returns {NetState} The NetState object representing the client connection
 */
PacketServer.prototype.connect = function(ipv4, port) {
    var socket = new net.Socket();
    socket.connect({
        host: ipv4.join("."),
        port: port
    });
    socket.on("error", function(err) {
        log.error("Client socket error|" + err.stack);
    });
    
    var state = new NetState(socket, this);
    socket.netState = state;
    state.isClient = true;
    state.uuid = uuid.v4();
    this.netStates[state.uuid] = state;
    return state;
};

/** Queues a single client packet object onto the queue of packets to be
 * emitted as events.
 * 
 * @param {object} event The packet object
 */
PacketServer.prototype.queuePacket = function(event) {
    this.packetQueue.push(event);
};

/** Processes the entire pending client packet queue.
 */
PacketServer.prototype.processQueue = function() {
    while(this.packetQueue.length > 0) {
        var packet = this.packetQueue.shift();
        try {
            this.emit(packet.packetName, packet);            
        } catch(e) {
            log.error("Error in packet handler " + packet.packetName + "|" + e.stack);
        }
    }
};

module.exports = PacketServer;
