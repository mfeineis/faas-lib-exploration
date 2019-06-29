const fs = require("fs");
const readline = require("readline");

const fn = require("./fn.js");

let trace = function () {};
trace = console.log;

// Custom Library Shell

function extractBody(ctx, next, stdout, stdin, stderr) {
    // console.log("extract", ctx); //, next, stdout, stdin);

    stdin.setEncoding("utf-8");

    const lines = [];

    //const reader = readline.createInterface({
    //    input: stdin,
    //    // input: fs.createReadStream('sample.txt'),
    //    // crlfDelay: Infinity
    //});
    const reader = stdin;
    //console.log("reader", typeof reader);

    let failed = false;
    reader.on("error", function (err) {
        trace("reader.error", err);
        failed = true;
        next(new Error(err));
    });

    reader.on("end", function (line) {
        if (failed) return;

        if (line) {
            trace(`Last line from file: ${line}`);
            lines.push(line);
        }
        const isStringBody = typeof lines[0] === "string";
        //const body = lines.join("\n");
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

    reader.on("data"/*"data"*/, function (line) {
        if (failed) return;

        trace(`Line from file: ${line}`);
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

module.exports = {
    bodyAsJson: bodyAsJson,
    collapse: collapse,
    extractBody: extractBody,
};

