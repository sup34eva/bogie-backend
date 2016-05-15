import {
    graphql
} from 'graphql';
import graphqlHTTP from 'express-graphql';

import {
    introspectionQuery,
    printSchema
} from 'graphql/utilities';

import schema from './graph';

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

function fromExpress(middleware) {
    return ctx => {
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
                ctx.body = body;
            }
        });
    };
}

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
