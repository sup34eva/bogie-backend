import {
    hash,
    compare
} from 'bcrypt-nodejs';

import {
    getOffsetWithDefault,
    offsetToCursor
} from 'graphql-relay';

import r from './db';

export function hashAsync(data, salt, progress) {
    return new Promise((resolve, reject) => {
        hash(data, salt, progress, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

export function compareAsync(data, encrypted) {
    return new Promise((resolve, reject) => {
        compare(data, encrypted, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

export async function findOrCreateUser(filter, insert) {
    try {
        const [user] = await r.table('users').filter(filter);
        return user.id;
    } catch (e) {
        const {inserted} = await r.table('users').insert(insert);

        if (inserted !== 1) {
            throw new Error('Could not create user');
        }

        return insert.id;
    }
}

export async function connectionFromReQL(table, args) {
    const {after, before, first, last} = args;
    const arrayLength = await table.count().run();
    const beforeOffset = getOffsetWithDefault(before, arrayLength);
    const afterOffset = getOffsetWithDefault(after, -1);

    let startOffset = Math.max(afterOffset, -1) + 1;
    let endOffset = Math.min(beforeOffset, arrayLength);
    if (typeof first === 'number') {
        endOffset = Math.min(endOffset, startOffset + first);
    }
    if (typeof last === 'number') {
        startOffset = Math.max(startOffset, endOffset - last);
    }

    const arraySlice = await table
        .skip(Math.max(startOffset, 0))
        .limit(endOffset - startOffset)
        .run();
    const edges = arraySlice.map((value, index) => ({
        cursor: offsetToCursor(startOffset + index),
        node: value,
    }));

    const firstEdge = edges[0];
    const lastEdge = edges[edges.length - 1];
    const lowerBound = after ? (afterOffset + 1) : 0;
    const upperBound = before ? beforeOffset : arrayLength;
    return {
        edges,
        pageInfo: {
            startCursor: firstEdge ? firstEdge.cursor : null,
            endCursor: lastEdge ? lastEdge.cursor : null,
            hasPreviousPage:
                typeof last === 'number' ? startOffset > lowerBound : false,
            hasNextPage:
                typeof first === 'number' ? endOffset < upperBound : false,
        },
    };
}

export function fromExpress(middleware) {
    return async ctx => {
        ctx.body = await new Promise(function(resolve) {
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
