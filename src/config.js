module.exports = {
    requiredClientVersion: {
        major: 7,
        minor: 0,
        revision: 47,
        prototype: undefined
    },
    master: {
        logPath: "sosaria-online.log",
        host: "0.0.0.0",
        port: 2593,
        dbPath: ["saves", "accounts.db"],
        dbSaveInterval: 1 * 60 * 60 * 1000
    },
};
