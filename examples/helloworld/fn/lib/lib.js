const fs = require("fs");
const readline = require("readline");
const url = require("url");

let trace = function () {};
//trace = console.log;

// Custom Library Shell

function initialize(ctx, next, stdout, stdin, stderr) {
    ctx.headers = {};
    ctx.log = [];

    next(null, ctx);
}

function extractBody(ctx, next, stdout, stdin, stderr) {
    stdin.setEncoding("utf-8");

    const lines = [];
    let failed = false;

    stdin.on("error", function (err) {
        trace("reader.error", err);
        failed = true;
        next(new Error(err));
    });

    stdin.on("end", function (line) {
        if (failed) return;

        if (line) {
            trace(`Last line from stdin: ${line}`);
            lines.push(line);
        }
        const isStringBody = typeof lines[0] === "string";
        const body = isStringBody
            ? lines.join("\n")
            : Buffer.concat(lines).toString();

        trace("isStringBody", isStringBody, "stdin:", body);

        ctx.body = body;
        ctx.originalBody = body;
        next(null, ctx);
    });

    stdin.on("data"/*"data"*/, function (line) {
        if (failed) return;

        trace(`Line from stdin: ${line}`);
        lines.push(line);
    });
}

function bodyAsJson(ctx, next) {
    try {
        ctx.body = JSON.parse(ctx.body);
        next(null, ctx);
    } catch (err) {
        ctx.log.push("Failed to parse body as JSON: " + err.message);
        ctx.body = {};
        next(err, ctx);
    }
}

function collapse(ctx, next, stdout, stdin, stderr) {
    trace("collapse", ctx); //, next, stdout, stdin);
    next();
}

function fail(ctx, next) {
    next(new Error("OMG, something went horribly wrong!"));
}

function wait(ctx, next) {
    ctx.log.push('...');
    setTimeout(next, 1000);
}

function extractRoute(req) {
    const pathname = req.url ? url.parse(req.url).pathname : "/";
    return {
        pathname: normalizeEndpointName(pathname),
        url: req.url,
    };
}

function normalizeEndpointName(name) {
    return name.replace(/^([^\/])/, function (_, fst) {
        return "/" + fst;
    });
}

function pipe(middlewares) {
    const ms = middlewares.slice();
    ms.reverse();
    //console.log("ms", ms);

    return function pipeline(ctx, done, stdout, stdin, stderr) {
        let lastCtx = ctx;

        ms.reduce(function (next, current) {
            return function step(err, newCtx) {
                lastCtx = newCtx || lastCtx || ctx;
                if (err instanceof Error) {
                    stderr.write(err.message);
                    done(lastCtx, null, stdout, stdin, stderr);
                    return;
                }
                // console.log("step1.lastCtx", lastCtx);
                current(lastCtx, next, stdout, stdin, stderr);
            };
        }, function tail(err, newCtx) {
            lastCtx = newCtx || lastCtx || ctx;
            if (err instanceof Error) {
                stderr.write(err.message);
                done(lastCtx, null, stdout, stdin, stderr);
                return;
            }
            done(lastCtx, null, stdout, stdin, stderr);
        })(lastCtx, null, stdout, stdin, stderr);
    };
};

module.exports = {
    bodyAsJson: bodyAsJson,
    collapse: collapse,
    extractBody: extractBody,
    initialize,
    utils: {
        extractRoute: extractRoute,
        normalizeEndpointName: normalizeEndpointName,
        pipe: pipe,
        trace: trace,
    },
};

