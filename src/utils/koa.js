export function fromExpress(middleware) {
    return async ctx => {
        ctx.body = await new Promise(function (resolve) {
            middleware(ctx.request, {
                ...ctx.response,
                set(...args) {
                    ctx.set(...args);
                    return this;
                },
                status(code) {
                    ctx.status = code;
                },
                send(body) {
                    resolve(body);
                }
            });
        });
    };
}
