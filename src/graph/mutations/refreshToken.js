import {
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt
} from 'graphql';
import {
    mutationWithClientMutationId
} from 'graphql-relay';

import userLoader from '../../loaders/user';
import clientLoader from '../../loaders/client';
import tokenLoader from '../../loaders/refreshToken';

import AccessToken from '../../entities/accessToken';

export default mutationWithClientMutationId({
    name: 'GrantRefreshToken',
    description: 'Allows an authenticated client to get a new access token with an existing refresh token',
    inputFields: {
        clientId: {
            type: new GraphQLNonNull(GraphQLString)
        },
        clientSecret: {
            type: new GraphQLNonNull(GraphQLString)
        },
        refreshToken: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        accessToken: {
            type: GraphQLString
        },
        refreshToken: {
            type: GraphQLString
        },
        expires: {
            type: GraphQLInt
        }
    },
    async mutateAndGetPayload({clientId, clientSecret, refreshToken}) {
        const [client, token] = await Promise.all([
            clientLoader.load(clientId),
            tokenLoader.load(refreshToken)
        ]);

        if (client.secret !== clientSecret) {
            throw new Error('Wrong client secret');
        }

        if (token.client !== clientId) {
            throw new Error('This refresh token was not issued to this client');
        }

        const user = await userLoader.load(token.user);
        const {_id: accessToken} = await AccessToken.create({
            client: client._id,
            user: user._id,
            createdAt: new Date(),
            scope: token.scope
        });

        return {
            accessToken,
            refreshToken,
            expires: 3600
        };
    }
});
