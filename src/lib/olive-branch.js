"use strict";

/** Provides capabilities to serialize and deserialize objects to and from
 * strings while performing some specific tasks that are needed for Sosaria-
 * Online. Objects serialized may have circular references. All objects
 * referenced must have had their constructors registerd with the {@link
 * OliveBranch#register} function.
 * 
 * <pre>
 * Special properties and thier usage:
 * Σ U+03A3 UUID of the object.
 * Ψ U+03A8 Constructor name of the object.
 * Ω U+03A9 A string with this value represents the undefined value.
 * Π U+03A0 Do Not Persist Object. If a property with this name exists on an
 *           object, regardless of its value, the object will be omitted from
 *           the output stream. As a conveniance, this character is exported as
 *           DO_NOT_PERSIST_OBJECT.
 * $ U+0024  Do Not Persist. If a property name starts with this character then 
 *           the property is ommitted from the object when writting to the
 *           output stream.
 * <pre>
 * @module OliveBranch
 */

var uuid = require("uuid"),
    StringBuffer = require("./string-buffer");

// Property names that *really* shouldn't conflict
var DNPP = "$",
    DNPO = "Π",
    UUID = "Σ",
    CTOR = "Ψ",
    UDEF = "Ω";

var ctors = {};
var serializedObjects = {};
var buff = null;

/** Registers a constructor function. Note that constructors MUST have a globaly
 * unique name.
 * 
 * @param {Function} ctor The constructor function to register.
 */
function register(ctor) {
    var name = ctor.name;
    if(ctors[name] !== undefined)
        throw new Error("Duplicate constructor " + name);
    if(typeof ctore !== "function")
        throw new Error(name + " does not appear to be a constructor");
    ctors[name] = ctor;
}

/** Serialize an object graph into a string representation.
 * 
 * @param {Object} obj The object graph to serialize.
 * @returns {String} A string containing the serialized representation of the
 *                   object graph.
 */
function serialize(obj) {
    serializedObjects = {};
    if(typeof obj !== "object" ||
        obj === null)
        throw new Error("serialize() called on a non-object");
    var root = _ser(obj);
    if(root === undefined)
        throw new Error("serialize() called on an object marked Do No Persist");
    return JSON.stringify({
        r: root,
        d: serializedObjects
    });
}

/** Deserialize an object graph from a string representation.
 * 
 * @param {String} str The string representation of the object graph.
 * @returns {Object} The object graph with prototypes restored.
 */
function deserialize(str) {
    var data = JSON.parse(str);
    serializedObjects = data.d;
    
}

// Returns the serializeable form of a value, or undefined if the value is not
// serializable.
function _ser(val) {
    switch(typeof(val))
    {
        case "undefined":
            return UDEF;
        case "boolean":
        case "number":
        case "string":
            return val;
        case "object":
            if(val === null)
                return val;
            return _obj(val);
        default:
            return undefined;
    }
}

// Returns the uuid of the object in the serialization stream, or undefined if
// the object is not serializable.
function _obj(obj) {
    // Check the Do Not Persist Object flag
    if(obj[DNPO] !== undefined)
        return undefined;
    
    // Bail if we've already seen this object
    var id = obj[UUID];
    if(id !== undefined &&
        serializedObjects[id] !== undefined)
        return;
    
    // If the object has not been setup, do so now
    if(id === undefined) {
        Object.defineProperty(obj, UUID, {
            configurable: false,
            enumerable: false,
            value: uuid.v4(),
            writable: false
        });
        id = obj[UUID];
    }
    
    // Setup the serializable object
    var out = {};
    out[UUID] = id;
    out[CTOR] = obj.constructor.name;
    serializedObjects[id] = out;
    
    // Process all object properties
    for(var key in Object.keys(obj)) {
        // Check Do Not Persist Property flag
        if(key.charAt(0) === DNPP)
            continue;
        
        // Try to serialize the property
        var val = _ser(obj[key]);
        if(val !== undefined)
            out[key] = val;
    }
    
    return id;
}

exports.register = register;
exports.serialize = serialize;
exports.deserialize = deserialize;
exports.DO_NOT_PERSIST_OBJECT = DNPO;
