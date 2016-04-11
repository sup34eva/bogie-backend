import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import {
    mutationWithClientMutationId
} from 'graphql-relay';
import jwt from 'jsonwebtoken';
import fetch from 'isomorphic-fetch';

import r from '../../db';
import clientLoader from '../../loaders/client';

async function findOrCreateUser({sub, email, name}) {
    try {
        const [user] = await r.table('users').filter({
            googleId: sub
        });

        return user.id;
    } catch (e) {
        const username = name || email;
        const uuid = r.uuid(username);

        const {inserted} = await r.table('users').insert({
            id: uuid,
            username,
            googleId: sub,
            createdAt: r.now()
        });

        if (inserted !== 1) {
            throw new Error('Could not create user');
        }

        return uuid;
    }
}

export default mutationWithClientMutationId({
    name: 'GrantGoogle',
    description: `Allows an authenticated client to obtain an access token with a Google auth token`,
    inputFields: {
        clientId: {
            type: new GraphQLNonNull(GraphQLString)
        },
        clientSecret: {
            type: new GraphQLNonNull(GraphQLString)
        },
        accessToken: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        token: {
            type: GraphQLString
        }
    },
    async mutateAndGetPayload({clientId, clientSecret, accessToken}) {
        const client = await clientLoader.load(clientId);
        if (client.secret !== clientSecret) {
            throw new Error('Wrong client secret');
        }

        const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`);
        if (!res.ok) {
            throw new Error(`Could not get profile: ${res.statusText}`);
        }

        const user = await res.json();
        const sub = await findOrCreateUser(user);

        const token = jwt.sign({
            aud: client.id,
            sub
        }, process.env.TOKEN_SECRET);

        return {
            token
        };
    }
});
