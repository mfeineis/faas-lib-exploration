
this["fn.tests"] = function (fn, describe, it, expect, setTimeout) {

    describe("the 'fn' library", function () {

        it("should export a single function as an entry point", function () {
            expect(typeof fn).toBe("function");
        });

        describe("a usage example in JS", function () {

            // User Code

            function sayHello(ctx, next, stdout) {
                ctx.headers["Content-Type"] = "text/plain";
                stdout.write("Hello, World!");
                next();
            }

            function makeLoggingMiddleware(prefix) {
                return function loggingMiddleware(ctx, next) {
                    ctx.log.push(prefix + ".loggingMiddleware", ctx);
                    next();
                };
            }

            const handler = fn.pipe([
                makeLoggingMiddleware("before"),
                sayHello,
                makeLoggingMiddleware("after"),
            ]);

            // Library Shell

            function extract(_, next, stdout, stdin) {
                next({
                    headers: {},
                    log: [],
                });
            }
            extract.tag = "source";

            function collapse(ctx, next, stdout, stdin) {
                next();
            }
            collapse.tag = "sink";

            const libifiedHandler = fn.pipe([
                extract,
                handler,
                collapse,
            ]);

            // Http Adapter

            const httpHandler = fn.pipe([
                function input(ctx, next, stdout, stdin) {
                },
                libifiedHandler,
                function output(ctx, next, stdout, stdin) {
                }
            ]);

            httpHandler("Some Input", function (err, response) {
                if (err) {
                    console.error(err);
                }
            });

        });

    });

};

