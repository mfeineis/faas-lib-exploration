"use strict";

const main = require("./main.js");

const req = Object.create(process.stdin);
req.url = process.argv[2] || "/";

main(req, {
    end: function end(chunk) {
        console.log("[invoke.end]", chunk);
    },
    write: function write(chunk) {
        console.log("[invoke.write]", chunk);
    },
    writeHead: function writeHead(status, headers) {
        console.log("[invoke.writeHead]", status, headers);
    },
});
