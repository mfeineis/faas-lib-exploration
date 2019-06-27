const fn = require("./fn.js");

// Custom Library Shell

function extract(ctx, next, stdout, stdin, stderr) {
    // console.log("extract", ctx); //, next, stdout, stdin);
    next(null, {
        headers: {},
        log: [],
    });
}

function collapse(ctx, next, stdout, stdin, stderr) {
    // console.log("collapse", ctx); //, next, stdout, stdin);
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
    collapse: collapse,
    extract: extract,
};

