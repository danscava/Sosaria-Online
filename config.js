"use strict";

module.exports = {
    master: {
        requiredClientVersion: {
            major: 7,
            minor: 0,
            revision: 47,
            prototype: undefined
        },
        logPath: "master-server.log",
        host: "0.0.0.0",
        port: 2593,
        dbPath: ["saves", "master"],
        servers: [ "testcenter", "sosariaonline" ]
    },
    testcenter: {
        name: "Test Center",
        limit: 100,
        gmtOffset: 18,
        ipv4: [127, 0, 0, 1],
        port: 2594
    },
    sosariaonline: {
        name: "Sosaria Online",
        limit: 100,
        gmtOffset: 18,
        ipv4: [127, 0, 0, 1],
        port: 2595
    }
};
