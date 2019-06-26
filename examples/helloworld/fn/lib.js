const fn = require("./fn.js");

// Custom Library Shell

function extract(ctx, next, stdout, stdin) {
    // console.log("extract", ctx); //, next, stdout, stdin);
    next(null, {
        headers: {},
        log: [],
    });
}

function collapse(ctx, next, stdout, stdin) {
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

function servlet(pipeline) {
    // console.log("servlet", pipeline, extract, collapse);
    return fn.pipe([
        extract,
        wait,
        pipeline,
        fail,
        collapse,
    ]);
}

module.exports = {
    handler: servlet,
};

