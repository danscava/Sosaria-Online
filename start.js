"use strict";

if(process.argv.length !== 3) {
    console.log("Usage: node start.js name_of_service");
    console.log("name_of_service must match the service name in config.js");
    throw 1;
}

var serviceName = process.argv[2];

require("./src/lib/config")(serviceName);

if(serviceName === "master") {
    require("./src/master-server/server");
} else {
    // TODO
}
