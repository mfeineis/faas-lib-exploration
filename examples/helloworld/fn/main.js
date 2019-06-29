const fn = require("./fn.js");
const { bodyAsJson, collapse, extractBody, utils } = require("./lib.js");
const handlers = require("../index.js");
const { factory: log } = require("./loggingMiddleware.js");

const { trace } = utils;

const endpointsByName = {};
const endpoints = [];
Object.keys(handlers).forEach(function (name) {
    const endpoint = utils.pipe([
        extractBody,
        bodyAsJson,
        log("before"),
        handlers[name],
        log("after"),
        collapse,
    ]);
    endpointsByName[utils.normalizeEndpointName(name)] = endpoint;
    endpoints.push(endpoint);
});

trace("Endpoints detected", endpointsByName);

function selectEndpoint(route) {
    trace("selectEndpoint", "Route: ", route);

    const pathname = utils.normalizeEndpointName(route.pathname);
    if (pathname in endpointsByName) {
        trace("  selected specific endpoint", pathname);
        return endpointsByName[pathname];
    }

    // FIXME: Actually select the default endpoint based on some convention
    const defaultEndpoint = endpoints[0];
    trace("  selected default endpoint", defaultEndpoint);
    return defaultEndpoint;
}

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

    selectEndpoint(utils.extractRoute(req))({}, sentinel, stdout, req, stderr);
}

module.exports = main;

