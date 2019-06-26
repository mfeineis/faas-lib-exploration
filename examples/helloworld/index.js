
function sayHello(ctx, next, stdout, stdin) {
    ctx.headers["Content-Type"] = "text/plain";
    stdout.write("Hello, World!");
    next();
}

module.exports = {
    handler: sayHello,
};


