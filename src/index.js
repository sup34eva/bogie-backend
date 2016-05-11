import 'babel-polyfill';
import Koa from 'koa';
import createServer from 'auto-sni';

import morgan from 'koa-morgan';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';

import {
    schemaJSON,
    schemaQL,
    endpoint
} from './graphql';

const app = new Koa();
const router = new Router();

app.use(morgan(':method :url :status'));
app.use(bodyParser());
app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type');

    if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
        return;
    }

    await next();
});

router.get('/graphql', endpoint);
router.post('/graphql', endpoint);
router.get('/schema.graphql', schemaQL);
router.get('/schema.json', schemaJSON);

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 8888;
const SECURE_PORT = process.env.SECURE_PORT || 8443;
if (process.env.NODE_ENV === 'production') {
    const server = createServer({
        email: 'bogie@leops.me',
        agreeTos: true,
        debug: false,
        domains: ['api.bogie.leops.me'],
        forceSSL: false,
        ports: {
            http: PORT,
            https: SECURE_PORT
        }
    }, app.callback());

    server.once('listening', () => {
        console.log(`HTTPS Server listening on port ${SECURE_PORT} with HTTP on port ${PORT}`);
    });
} else {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}
