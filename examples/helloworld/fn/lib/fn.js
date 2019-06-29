(function (window, factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        window["fn"] = factory();
    }

}(this, function factory() {

    function fn() {}

    return Object.freeze(fn);
}));
