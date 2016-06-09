import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import jwt from 'jsonwebtoken';
import fetch from 'isomorphic-fetch';

import {
    mutationWithClientCheck
} from '../../utils/mutation';
import {
    findOrCreateUser
} from '../../utils/rdb';

export default mutationWithClientCheck({
    name: 'GrantGoogle',
    description: `Allows an authenticated client to obtain an access token with a Google auth token`,
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
        const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${accessToken}`);
        if (!res.ok) {
            throw new Error(`Could not get profile: ${res.statusText}`);
        }

        const {sub: googleId, email} = await res.json();
        const sub = await findOrCreateUser(email, {
            googleId
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
