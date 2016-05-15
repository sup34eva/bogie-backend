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
    name: 'GrantFacebook',
    description: `Allows an authenticated client to obtain an access token with a Facebook login code`,
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

        const res = await fetch(`https://graph.facebook.com/v2.5/me?fields=id%2Cname%2Cemail&access_token=${accessToken}`);
        if (!res.ok) {
            throw new Error(`Could not get profile: ${res.statusText}`);
        }

        const {id, name} = await res.json();
        const sub = await findOrCreateUser({
            fbId: id
        }, {
            id: r.uuid(name),
            username: name,
            fbId: id,
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
