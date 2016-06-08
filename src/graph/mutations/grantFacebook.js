import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import jwt from 'jsonwebtoken';
import fetch from 'isomorphic-fetch';

import r from '../../db';

import {
    mutationWithClientCheck
} from '../../utils/mutation';
import {
    findOrCreateUser
} from '../../utils/rdb';

export default mutationWithClientCheck({
    name: 'GrantFacebook',
    description: `Allows an authenticated client to obtain an access token with a Facebook login code`,
    inputFields: {
        accessToken: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        token: {
            type: GraphQLString
        }
    },
    async mutateAndGetPayload({clientId, accessToken}) {
        const res = await fetch(`https://graph.facebook.com/v2.5/me?fields=id%2Cemail&access_token=${accessToken}`);
        if (!res.ok) {
            throw new Error(`Could not get profile: ${res.statusText}`);
        }

        const {id, email} = await res.json();
        const sub = await findOrCreateUser(email, {
            fbId: id
        });

        const token = jwt.sign({
            aud: clientId,
            sub
        }, process.env.TOKEN_SECRET);

        return {
            token
        };
    }
});
