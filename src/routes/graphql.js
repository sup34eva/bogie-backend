import {
    graphql
} from 'graphql';
import graphqlHTTP from 'express-graphql';
import passport from 'passport';

import {
    introspectionQuery,
    printSchema
} from 'graphql/utilities';
import {
    Router as createRouter
} from 'express';

import schema from '../graph';

const router = createRouter();
export default router;

router.get('/schema.json', (req, res) => {
    graphql(schema, introspectionQuery).then(result => {
        console.log(result);
        res.json(result);
    }).catch(errors => {
        res.status(500).json(errors);
    });
});

router.get('/schema.graphql', (req, res) => {
    res.end(printSchema(schema));
});

router.use('/', passport.authenticate('bearer', {
    session: false
}), graphqlHTTP(request => ({
    schema,
    rootValue: {
        request
    },
    pretty: true
})));
