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

import AccessToken from '../../entities/accessToken';

export default mutationWithClientMutationId({
    name: 'Exchange',
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
        },
        expires: {
            type: GraphQLInt
        }
    },
    async mutateAndGetPayload({clientId, clientSecret, username, password, scope}) {
        const client = await clientLoader.load(clientId);
        if (client.secret !== clientSecret) {
            throw new Error('Wrong client secret');
        }

        const user = await userLoader.load(username);
        if (user.password !== password) {
            throw new Error('Wrong password');
        }

        const {_id: token} = await AccessToken.create({
            client: client._id,
            user: user._id,
            createdAt: new Date(),
            scope
        });

        return {
            token,
            expires: 3600
        };
    }
});
