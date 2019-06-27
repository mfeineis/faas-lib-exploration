(function (window, factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        window["fn"] = factory();
    }

}(this, function factory() {

    function fn() {}

    fn.pipe = function pipe(middlewares) {
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

    return Object.freeze(fn);
}));
