"use strict";

module.exports = {
    requiredClientVersion: {
        major: 7,
        minor: 0,
        revision: 47,
        prototype: undefined
    },
    logPath: null,
    ipv4: [127, 0, 0, 1],
    port: 2593,
    dbPath: null,
    servers: [ "testcenter" ],
    persistence: {
        activePath: "test/integration/save",
        pruneFrequency: 150,     // Milliseconds
        prunePercent: 15,        // 15% of the cache pruned per cycle
        maxCache: 1024 * 1024 * 32, // 32MB
        timeToLive: 120         // Seconds
    }
};
