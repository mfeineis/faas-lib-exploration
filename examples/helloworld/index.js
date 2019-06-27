
function sayHello(ctx, next, stdout, stdin) {
    ctx.headers["Content-Type"] = "text/plain";
    stdout.write("Hello, World!");

    if (Math.random() >= 0.5) {
        next();
    } else {
        next(new Error("Random Failure!"));
    }
}

module.exports = {
    handler: sayHello,
};


