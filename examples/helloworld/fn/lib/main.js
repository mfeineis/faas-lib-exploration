const { bodyAsJson, collapse, extractBody, initialize, utils } = require("./lib.js");
const { factory: loggingMiddleware } = require("./loggingMiddleware.js");
const { trace } = utils;

const builtins = {
    bodyAsJson: bodyAsJson,
    extractBody: extractBody,
    loggingMiddleware: loggingMiddleware,
};

function createMiddleware(middleware) {
    if (typeof middleware === "string") {
        return builtins[middleware];
    }
    return builtins[middleware[0]](middleware[1]);
}

const defaultConfig = {
    "before": [
        "extractBody",
        "bodyAsJson",
    ],
};

function configureMain(handlers, config) {
    const endpointsByName = {};
    const endpoints = [];
    Object.keys(handlers).forEach(function (name) {
        const thisConfig = config[name] || defaultConfig;
        trace("Endpoint", name, "config", thisConfig);

        const endpoint = utils.pipe([
            [initialize],
            (thisConfig.before || []).map(createMiddleware),
            [handlers[name]],
            (thisConfig.after || []).map(createMiddleware),
            [collapse],
        ].reduce(function (a, b) {
            return a.concat(b);
        }, []));
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

    return function main(req, res) {

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
                    status: status,
                }));
                return;
            }
            //console.log("ctx", ctx, "\nstdout\n", stdout._buffer.join("")); //, next, stdout, stdin);
            res.writeHead(200, ctx.headers);
            res.end(stdout._buffer.join(""));
        }

        selectEndpoint(utils.extractRoute(req))({}, sentinel, stdout, req, stderr);
    };
}

module.exports = {
    configureMain: configureMain,
    trace: trace,
};

