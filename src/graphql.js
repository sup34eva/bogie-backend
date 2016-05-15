import {
    graphql
} from 'graphql';
import graphqlHTTP from 'express-graphql';

import {
    introspectionQuery,
    printSchema
} from 'graphql/utilities';

import schema from './graph';
import {
    fromExpress
} from './utils';

export const schemaJSON = async ctx => {
    try {
        const result = await graphql(schema, introspectionQuery);
        ctx.body = result;
    } catch (err) {
        ctx.status = 500;
        ctx.body = err;
    }
};

export const schemaQL = ctx => {
    ctx.body = printSchema(schema);
};

export const endpoint = fromExpress(
    graphqlHTTP(request => ({
        schema,
        rootValue: {
            request
        },
        pretty: true,
        graphiql: true
    }))
);
