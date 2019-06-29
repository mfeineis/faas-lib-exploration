
function todos(ctx, next, stdout, stdin) {
    ctx.headers["Content-Type"] = "application/json";
    stdout.write(JSON.stringify({
        items: [
            { id: 1, label: "Do dishes", done: true },
            { id: 2, label: "Wash clothes" },
            { id: 3, label: "Vacuum clean" },
        ],
    }));
    next();
}

module.exports = {
    todos: todos,
};

