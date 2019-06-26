
function makeLoggingMiddleware(prefix) {
    return function loggingMiddleware(ctx, next) {
        ctx.log.push(prefix + ".loggingMiddleware", JSON.parse(JSON.stringify(ctx)));
        next();
    };
}

module.exports = {
    factory: makeLoggingMiddleware,
};

