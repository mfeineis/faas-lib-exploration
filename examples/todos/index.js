
function todos(ctx, next, stdout, stdin) {
    ctx.headers["Content-Type"] = "application/json";
    ctx.invoke("todos/readview/query", {
        query: "todos { id, label, done }",
        params: {},
    }, function (err, data) {
        if (err) {
            next(err);
        }
        stdout.write(data);
        next();
    });
}

function query(ctx, next, stdout, stdin) {
    ctx.log.push("todos/readview/query", ctx.body);
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
    "todos/readview/query": query,
};

