import 'babel-polyfill';
import Koa from 'koa';

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

app.use(morgan('combined'));
app.use(bodyParser());

router.get('/graphql', endpoint);
router.post('/graphql', endpoint);
router.get('/schema.graphql', schemaQL);
router.get('/schema.json', schemaJSON);

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
