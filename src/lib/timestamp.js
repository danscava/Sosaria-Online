/** Exposes an efficient timestamp creation and comparison library.
 * 
 * @module Timestamp
 */

var ts = undefined;
var timer = null;

// Internal function to invalidate the current timestamp
function invalidate() {
    ts = undefined;
}

/** Returns the current time as a Unix timestamp (count of miliseconds since
 * 1970/1/1 in UTC).
 * 
 * @returns {Number} The current time as a Unix timestamp.
 */
function now() {
    // Update the timestamp if needed
    if(ts === undefined) {
        ts = Date.now();
        setImmediate(invalidate);
    }
    return ts;
}

exports.now = now;
