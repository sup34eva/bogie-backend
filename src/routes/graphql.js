import {
    graphql
} from 'graphql';
import graphqlHTTP from 'express-graphql';
import passport from 'koa-passport';

import {
    introspectionQuery,
    printSchema
} from 'graphql/utilities';

import schema from '../graph';

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
    return async ctx => {
        try {
            ctx.body = await new Promise(function (resolve, reject) {
                middleware(ctx.request, {
                    ...ctx.response,
                    set(...args) {
                        ctx.set(...args);
                        return this;
                    },
                    status(code) {
                        reject(code);
                    },
                    send(body) {
                        resolve(body);
                    }
                });
            });
        } catch (code) {
            ctx.status = code;
        }
    };
}

export const endpoint = [
    passport.authenticate('bearer', {
        session: false
    }),
    fromExpress(graphqlHTTP(request => ({
        schema,
        rootValue: {
            request
        },
        pretty: true
    })))
];
