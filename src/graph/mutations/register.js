import {
    GraphQLNonNull,
    GraphQLString
} from 'graphql';
import {
    mutationWithClientMutationId
} from 'graphql-relay';

import r from '../../db';
import userType from '../types/user';
import clientLoader from '../../loaders/client';

import {
    hashAsync
} from '../../utils';

export default mutationWithClientMutationId({
    name: 'Register',
    description: 'Register a new user',
    inputFields: {
        username: {
            type: new GraphQLNonNull(GraphQLString)
        },
        password: {
            type: new GraphQLNonNull(GraphQLString)
        },
        clientId: {
            type: new GraphQLNonNull(GraphQLString)
        },
        clientSecret: {
            type: new GraphQLNonNull(GraphQLString)
        }
    },
    outputFields: {
        user: {
            type: userType
        }
    },
    async mutateAndGetPayload({clientId, clientSecret, username, password}) {
        const client = await clientLoader.load(clientId);
        if(client === null) {
            clientLoader.clear(clientId);
            throw new Error(`Client "${clientId}" not found`);
        }
        if (client.secret !== clientSecret) {
            throw new Error('Wrong client secret');
        }

        const encryptedPass = await hashAsync(password);
        const id = r.uuid(username);
        const data = await r.table('users').insert({
            id,
            username,
            password: encryptedPass,
            createdAt: r.now()
        });

        if (data.errors) {
            throw new Error(data.first_error);
        }

        if (data.inserted !== 1) {
            throw new Error('Could not create user');
        }

        return r.table('users').get(id).then(user => ({
            user
        }));
    }
});
