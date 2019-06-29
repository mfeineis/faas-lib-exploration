"use strict";

const http = require('http');

const fn = require("./fn.js");
const { collapse, extract } = require("./lib.js");
const { handler } = require("../index.js");
const { factory: log } = require("./loggingMiddleware.js");

const servlet = fn.pipe([
    extract,
    log("before"),
    handler,
    log("after"),
    collapse,
]);

const server = http.createServer(function (req, res) {

    const stdout = {
        _buffer: [],
        write: function write(chunk) {
            this._buffer.push(chunk);
        },
    };

    const stderr = {
        _buffer: [],
        write: function write(chunk) {
            this._buffer.push(chunk);
        },
    };

    function sentinel(ctx, next, stdout, stdin, stderr) {
        if (stderr._buffer.length) {
            // console.log("ctx", ctx, "\nstderr\n", stderr._buffer.join("")); //, next, stdout, stdin);
            res.writeHead(400, { "Content-Type": "text/plain" });
            res.end(stderr._buffer.join(""));
            return;
        }
        //console.log("ctx", ctx, "\nstdout\n", stdout._buffer.join("")); //, next, stdout, stdin);
        res.writeHead(200, ctx.headers);
        res.end(stdout._buffer.join(""));
    }

    servlet({ ctx: true }, sentinel, stdout, null, stderr);
});
server.on('error', function (err, socket) {
    console.error(err);
    socket.end('HTTP/1.1 500 Server Error\r\n\r\n');
});
server.on('clientError', function (err, socket) {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(5000);

