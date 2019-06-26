"use strict";

const fn = require("./fn.js");
const { handler: servlet } = require("./lib.js");
const { handler } = require("../index.js");
const { factory: log } = require("./loggingMiddleware.js");

const pipeline = servlet(fn.pipe([
    log("before"),
    handler,
    log("after"),
]));

const stdout = {
    _buffer: [],
    write: function write(chunk) {
        this._buffer.push(chunk);
    },
};

function sentinel(ctx, next, stdout, stdin, stderr) {
    console.log("ctx", ctx, "\nstdout\n", stdout._buffer.join("")); //, next, stdout, stdin);
}

pipeline({ ctx: true }, sentinel, stdout, null, null);

