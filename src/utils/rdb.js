import {
    getOffsetWithDefault,
    offsetToCursor
} from 'graphql-relay';

import r from '../db';
import emailLoader from '../loaders/email';

export async function findOrCreateUser(email, data) {
    const users = await r.table('users').filter(data);
    if (users.length > 0) {
        return users[0].id;
    }

    const user = await emailLoader.load(insert.email);
    if (user !== null) {
        const {updated} = await r.table('users').get(user.id).update({
            ...merge,
            ...filter
        });

        if (updated !== 1) {
            throw new Error('Could not update user');
        }

        return merge.id;
    }

    const {inserted} = await r.table('users').insert({
        id: r.uuid(email),
        email,
        createdAt: r.now(),
        ...data
    });

    if (inserted !== 1) {
        throw new Error('Could not create user');
    }

    return r.uuid(email);
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
        node: value
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
                typeof first === 'number' ? endOffset < upperBound : false
        }
    };
}
