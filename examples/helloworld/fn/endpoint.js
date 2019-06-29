"use strict";

const http = require("http");
const main = require("./main.js");

const server = http.createServer(main);
server.on('error', function (err, socket) {
    console.error(err);
    socket.end('HTTP/1.1 500 Server Error\r\n\r\n');
});
server.on('clientError', function (err, socket) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(5000);

