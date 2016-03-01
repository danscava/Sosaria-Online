var EventEmitter = require("events");

// Records all emit() calls
EventEmitter.prototype._emit = EventEmitter.prototype.emit;
EventEmitter.prototype.emit = function() {
    if(arguments.length < 1)
        return;
    var event = arguments[0];
    var args = Array.prototype.slice.call(arguments, 1);
    if(this._events === undefined)
        this._events = {};
    if(this._events[event] === undefined)
        this._events[event] = [];
    this._events[event].push(args);
    return this._emit.apply(this, arguments);
};

// Expect the named event to have been called n number of times (defaults to 1)
EventEmitter.prototype._expectEvent = function(event, n) {
    if(n === undefined)
        n = 1;
    var count = 0;
    if(this._events !== undefined &&
        this._events[event] !== undefined)
        count = this._events[event].length;
    expect(count).toBe(n);
};
