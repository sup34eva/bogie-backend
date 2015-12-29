import graphqlHTTP from 'express-graphql';
import passport from 'passport';

import schema from '../graph';

export default [
    passport.authenticate('bearer', {
        session: false
    }),
    graphqlHTTP(request => ({
        schema,
        rootValue: {
            request
        },
        pretty: true
    }))
];
