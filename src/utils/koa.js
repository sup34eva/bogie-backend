export function fromExpress(middleware) {
    return ctx => new Promise(function (resolve) {
        middleware(ctx.request, {
            ...ctx.response,
            setHeader(key, value) {
                ctx.set(key, value);
            },
            set statusCode(code) {
                ctx.status = code;
            },
            write(data) {
                ctx.body = data;
            },
            end() {
                resolve();
            }
        });
    });
}
