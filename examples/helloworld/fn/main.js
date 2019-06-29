const fn = require("./fn.js");
const { bodyAsJson, collapse, extractBody } = require("./lib.js");
const { handler } = require("../index.js");
const { factory: log } = require("./loggingMiddleware.js");

const servlet = fn.pipe([
    extractBody,
    bodyAsJson,
    log("before"),
    handler,
    log("after"),
    collapse,
]);

function main(req, res) {

    const stdout = {
        _buffer: [],
        write: function write(chunk) {
            stdout._buffer.push(chunk);
        },
    };

    const stderr = {
        _buffer: [],
        write: function write(chunk) {
            stderr._buffer.push(chunk);
        },
    };


    function sentinel(ctx, next, stdout, stdin, stderr) {
        if (stderr._buffer.length) {
            // console.log("ctx", ctx, "\nstderr\n", stderr._buffer.join("")); //, next, stdout, stdin);
            // TODO: Use problem.json?
            const status = 400;
            res.writeHead(status, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                error: stderr._buffer.join(""),
                status: 400,
            }));
            return;
        }
        //console.log("ctx", ctx, "\nstdout\n", stdout._buffer.join("")); //, next, stdout, stdin);
        res.writeHead(200, ctx.headers);
        res.end(stdout._buffer.join(""));
    }

    servlet({}, sentinel, stdout, req, stderr);

}

module.exports = main;

