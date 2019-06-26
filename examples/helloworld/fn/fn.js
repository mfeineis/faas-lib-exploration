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

        function decorate(fn) {
            return fn;
            //return function decorated() {
            //    console.log("decorate", fn);
            //    return fn.apply(this, arguments);
            //};
        }

        return function pipeline(ctx, done, stdout, stdin, stderr) {
            let lastCtx = ctx;

            const ms = middlewares.slice();
            ms.reverse();
            console.log("ms", ms);

            ms.reduce(function (next, current) {
                return decorate(function step(err, newCtx) {
                    if (err) {
                        console.error(err);
                    }
                    lastCtx = newCtx || lastCtx || ctx;
                    // console.log("step1.lastCtx", lastCtx);
                    current(lastCtx, next, stdout, stdin, stderr);
                });
            }, decorate(function lastStep(err, newCtx) {
                if (err) {
                    console.error(err);
                }
                lastCtx = newCtx || lastCtx || ctx;
                done(lastCtx, null, stdout, stdin, stderr);
            }))(lastCtx, null, stdout, stdin, stderr);
        };
    };

    return Object.freeze(fn);
}));
