import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import jwt from 'jsonwebtoken';

import usernameLoader from '../../loaders/username';

import {
    mutationWithClientCheck
} from '../../utils/mutation';
import {
    compareAsync
} from '../../utils/crypto';

export default mutationWithClientCheck({
    name: 'GrantPassword',
    description: `Allows an authenticated client to obtain an access token with a user's credentials`,
    inputFields: {
        username: {
            type: new GraphQLNonNull(GraphQLString)
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        },
        scope: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        token: {
            type: GraphQLString
        }
    },
    async mutateAndGetPayload({username, password, scope}) {
        const user = await usernameLoader.load(username);
        if(user === null) {
            usernameLoader.clear(username);
            throw new Error(`User "${username}" not found`);
        }

        const equals = await compareAsync(password, user.password);
        if (!equals) {
            throw new Error('Wrong password');
        }

        const token = jwt.sign({
            sub: user.id,
            aud: client.id,
            scope
        }, process.env.TOKEN_SECRET);

        return {
            token
        };
    }
});
