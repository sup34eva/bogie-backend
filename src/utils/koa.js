export function fromExpress(middleware) {
    return ctx => new Promise(resolve => {
        middleware(ctx.request, {
            ...ctx.response,
            setHeader(key, value) {
                ctx.set(key, value);
            },
            get statusCode() {
                return ctx.status;
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
