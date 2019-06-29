"use strict";

const main = require("./main.js");

main(process.stdin, {
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
