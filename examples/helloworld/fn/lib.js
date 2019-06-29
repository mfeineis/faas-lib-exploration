const fs = require("fs");
const readline = require("readline");
const url = require("url");

const fn = require("./fn.js");

let trace = function () {};
trace = console.log;

// Custom Library Shell

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
        ctx.headers = {};
        ctx.log = [];
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

module.exports = {
    bodyAsJson: bodyAsJson,
    collapse: collapse,
    extractBody: extractBody,
    utils: {
        extractRoute: extractRoute,
        normalizeEndpointName: normalizeEndpointName,
        trace: trace,
    },
};

