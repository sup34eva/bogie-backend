import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import {
    mutationWithClientMutationId
} from 'graphql-relay';
import jwt from 'jsonwebtoken';

import usernameLoader from '../../loaders/username';
import clientLoader from '../../loaders/client';

import {
    compareAsync
} from '../../utils';

export default mutationWithClientMutationId({
    name: 'GrantPassword',
    description: `Allows an authenticated client to obtain an access token with a user's credentials`,
    inputFields: {
        clientId: {
            type: new GraphQLNonNull(GraphQLString)
        },
        clientSecret: {
            type: new GraphQLNonNull(GraphQLString)
        },
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
    async mutateAndGetPayload({clientId, clientSecret, username, password, scope}) {
        const client = await clientLoader.load(clientId);
        if(client === null) {
            clientLoader.clear(clientId);
            throw new Error(`Client "${clientId}" not found`);
        }
        if (client.secret !== clientSecret) {
            throw new Error('Wrong client secret');
        }

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
