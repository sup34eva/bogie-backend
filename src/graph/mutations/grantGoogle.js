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

import {
    findOrCreateUser
} from '../../utils';

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

        const {sub: googleId, email, name} = await res.json();
        const sub = await findOrCreateUser({
            googleId
        }, {
            id: r.uuid(username),
            username: name || email,
            googleId,
            createdAt: r.now()
        });

        const token = jwt.sign({
            aud: client.id,
            sub
        }, process.env.TOKEN_SECRET);

        return {
            token
        };
    }
});
