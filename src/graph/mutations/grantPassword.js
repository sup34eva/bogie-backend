import {
    GraphQLNonNull,
    GraphQLString,
    GraphQLInt
} from 'graphql';
import {
    mutationWithClientMutationId
} from 'graphql-relay';
import {
    compare
} from 'bcrypt-nodejs';

import userLoader from '../../loaders/user';
import clientLoader from '../../loaders/client';

import AccessToken from '../../entities/accessToken';
import RefreshToken from '../../entities/refreshToken';

function compareAsync(data, encrypted) {
    return new Promise((resolve, reject) => {
        compare(data, encrypted, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

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
    async mutateAndGetPayload({clientId, clientSecret, username, password, scope}) {
        const client = await clientLoader.load(clientId);
        if (client.secret !== clientSecret) {
            throw new Error('Wrong client secret');
        }

        const user = await userLoader.load(username);
        const equals = await compareAsync(password, user.password);
        if (!equals) {
            throw new Error('Wrong password');
        }

        const [
            {_id: accessToken},
            {_id: refreshToken}
        ] = await Promise.all([
            AccessToken.create({
                client: client._id,
                user: user._id,
                createdAt: new Date(),
                scope
            }),
            RefreshToken.create({
                client: client._id,
                user: user._id,
                createdAt: new Date(),
                scope
            })
        ]);

        return {
            accessToken,
            refreshToken,
            expires: 3600
        };
    }
});
